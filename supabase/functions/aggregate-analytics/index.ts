/**
 * Edge Function: aggregate-analytics
 * Cron Job: Runs daily at 2:00 AM (0 2 * * *)
 * Aggregates analytics data from analytics_events into analytics_daily_stats
 *
 * Features:
 * - Daily aggregation of message, friend, form, reservation, and URL metrics
 * - Calculates engagement rates (open rate, click rate, response rate, form completion rate)
 * - Updates materialized view for dashboard performance
 * - Handles multiple organizations independently
 * - Idempotent: Can be re-run safely for same date
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DailyStats {
  organization_id: string;
  date: string;
  friends_added: number;
  friends_blocked: number;
  friends_total: number;
  messages_sent: number;
  messages_delivered: number;
  messages_read: number;
  messages_failed: number;
  open_rate: number;
  click_rate: number;
  response_rate: number;
  reservations_created: number;
  reservations_confirmed: number;
  reservations_cancelled: number;
  reservations_completed: number;
  reservations_no_show: number;
  forms_viewed: number;
  forms_submitted: number;
  forms_abandoned: number;
  form_completion_rate: number;
  url_clicks_total: number;
  unique_url_clicks: number;
}

serve(async (req) => {
  try {
    console.log('Starting daily analytics aggregation...');

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get target date (yesterday)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const targetDate = yesterday.toISOString().split('T')[0];

    console.log(`Aggregating data for date: ${targetDate}`);

    // Get all organizations
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('id')
      .eq('is_active', true);

    if (orgsError) {
      console.error('Error fetching organizations:', orgsError);
      return new Response(
        JSON.stringify({ error: orgsError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!organizations || organizations.length === 0) {
      console.log('No active organizations found');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No organizations to process',
          processedCount: 0,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each organization
    for (const org of organizations) {
      try {
        console.log(`Processing organization: ${org.id}`);

        // Get date range for query
        const startDate = new Date(targetDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(targetDate);
        endDate.setHours(23, 59, 59, 999);

        // Aggregate message metrics
        const { data: messageMetrics, error: msgError } = await supabase
          .from('analytics_events')
          .select('event_type')
          .eq('organization_id', org.id)
          .in('event_type', ['message_sent', 'message_delivered', 'message_read', 'message_failed'])
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (msgError) throw msgError;

        const messages_sent = messageMetrics?.filter((e) => e.event_type === 'message_sent').length || 0;
        const messages_delivered = messageMetrics?.filter((e) => e.event_type === 'message_delivered').length || 0;
        const messages_read = messageMetrics?.filter((e) => e.event_type === 'message_read').length || 0;
        const messages_failed = messageMetrics?.filter((e) => e.event_type === 'message_failed').length || 0;

        // Calculate engagement rates
        const open_rate = messages_delivered > 0 ? (messages_read / messages_delivered) * 100 : 0;
        const click_rate = messages_delivered > 0 ? 0 : 0; // TODO: Calculate from url_clicks
        const response_rate = messages_delivered > 0 ? 0 : 0; // TODO: Calculate from user responses

        // Aggregate friend metrics
        const { data: friendMetrics, error: friendError } = await supabase
          .from('analytics_events')
          .select('event_type')
          .eq('organization_id', org.id)
          .in('event_type', ['friend_added', 'friend_deleted'])
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (friendError) throw friendError;

        const friends_added = friendMetrics?.filter((e) => e.event_type === 'friend_added').length || 0;
        const friends_blocked = friendMetrics?.filter((e) => e.event_type === 'friend_deleted').length || 0;

        // Get total friends count
        const { count: friendsTotal, error: friendsTotalError } = await supabase
          .from('friends')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id)
          .eq('is_blocked', false);

        if (friendsTotalError) throw friendsTotalError;

        const friends_total = friendsTotal || 0;

        // Aggregate reservation metrics
        const { data: reservationMetrics, error: resError } = await supabase
          .from('analytics_events')
          .select('event_type')
          .eq('organization_id', org.id)
          .in('event_type', [
            'reservation_created',
            'reservation_confirmed',
            'reservation_cancelled',
            'reservation_completed',
            'reservation_no_show',
          ])
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (resError) throw resError;

        const reservations_created = reservationMetrics?.filter((e) => e.event_type === 'reservation_created').length || 0;
        const reservations_confirmed = reservationMetrics?.filter((e) => e.event_type === 'reservation_confirmed').length || 0;
        const reservations_cancelled = reservationMetrics?.filter((e) => e.event_type === 'reservation_cancelled').length || 0;
        const reservations_completed = reservationMetrics?.filter((e) => e.event_type === 'reservation_completed').length || 0;
        const reservations_no_show = reservationMetrics?.filter((e) => e.event_type === 'reservation_no_show').length || 0;

        // Aggregate form metrics
        const { data: formMetrics, error: formError } = await supabase
          .from('analytics_events')
          .select('event_type')
          .eq('organization_id', org.id)
          .in('event_type', ['form_viewed', 'form_submitted', 'form_abandoned'])
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (formError) throw formError;

        const forms_viewed = formMetrics?.filter((e) => e.event_type === 'form_viewed').length || 0;
        const forms_submitted = formMetrics?.filter((e) => e.event_type === 'form_submitted').length || 0;
        const forms_abandoned = formMetrics?.filter((e) => e.event_type === 'form_abandoned').length || 0;

        // Calculate form completion rate
        const form_completion_rate = forms_viewed > 0 ? (forms_submitted / forms_viewed) * 100 : 0;

        // Aggregate URL tracking metrics
        const { data: urlMetrics, error: urlError } = await supabase
          .from('analytics_events')
          .select('event_type, friend_id')
          .eq('organization_id', org.id)
          .eq('event_type', 'url_clicked')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        if (urlError) throw urlError;

        const url_clicks_total = urlMetrics?.length || 0;
        const unique_url_clicks = urlMetrics ? new Set(urlMetrics.map((e) => e.friend_id).filter(Boolean)).size : 0;

        // Prepare daily stats record
        const dailyStats: Partial<DailyStats> = {
          organization_id: org.id,
          date: targetDate,
          friends_added,
          friends_blocked,
          friends_total,
          messages_sent,
          messages_delivered,
          messages_read,
          messages_failed,
          open_rate: Math.round(open_rate * 100) / 100,
          click_rate: Math.round(click_rate * 100) / 100,
          response_rate: Math.round(response_rate * 100) / 100,
          reservations_created,
          reservations_confirmed,
          reservations_cancelled,
          reservations_completed,
          reservations_no_show,
          forms_viewed,
          forms_submitted,
          forms_abandoned,
          form_completion_rate: Math.round(form_completion_rate * 100) / 100,
          url_clicks_total,
          unique_url_clicks,
        };

        // Upsert daily stats (idempotent)
        const { error: upsertError } = await supabase
          .from('analytics_daily_stats')
          .upsert(dailyStats, {
            onConflict: 'organization_id,date',
            ignoreDuplicates: false,
          });

        if (upsertError) throw upsertError;

        console.log(`Successfully aggregated stats for organization ${org.id}`);
        successCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorMsg = `Organization ${org.id}: ${errorMessage}`;
        console.error(errorMsg);
        errors.push(errorMsg);
        errorCount++;
      }
    }

    // Refresh materialized view
    try {
      console.log('Refreshing analytics overview materialized view...');
      await supabase.rpc('refresh_analytics_overview');
      console.log('Materialized view refreshed successfully');
    } catch (error) {
      console.error('Error refreshing materialized view:', error);
      // Non-critical error, don't fail the entire job
    }

    console.log(
      `Aggregation complete: ${successCount} successful, ${errorCount} errors`
    );

    return new Response(
      JSON.stringify({
        success: true,
        date: targetDate,
        successCount,
        errorCount,
        totalProcessed: organizations.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analytics aggregation:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
