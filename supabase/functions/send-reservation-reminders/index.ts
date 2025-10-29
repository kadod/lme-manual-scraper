/**
 * Edge Function: send-reservation-reminders
 * Cron Job: Runs every hour (0 * * * *)
 * Sends LINE reminder messages for upcoming reservations
 *
 * Features:
 * - Sends reminders 24 hours before reservation
 * - Sends reminders 1 hour before reservation
 * - Supports custom reminder times
 * - Includes reservation details and cancellation URL
 * - Records reminder send status
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LINE_API_BASE = 'https://api.line.me/v2/bot';
const REMINDER_WINDOW_MINUTES = 70; // Process reminders within 70-minute window (hourly cron + buffer)

interface Reservation {
  id: string;
  friend_id: string;
  reservation_datetime: string;
  location: string;
  notes: string | null;
  status: string;
  friends: {
    id: string;
    line_user_id: string;
    display_name: string;
    is_blocked: boolean;
  };
}

interface ReminderConfig {
  id: string;
  reservation_id: string;
  remind_at: string;
  reminder_type: 'custom' | '24_hours' | '1_hour';
  sent_at: string | null;
}

serve(async (req) => {
  try {
    console.log('Starting reservation reminder processing...');

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get LINE access token
    const accessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'LINE credentials not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MINUTES * 60 * 1000);

    // Get pending reminders that should be sent within the window
    const { data: reminders, error: remindersError } = await supabase
      .from('reservation_reminders')
      .select(
        `
        id,
        reservation_id,
        remind_at,
        reminder_type,
        sent_at,
        reservations:reservation_id (
          id,
          friend_id,
          reservation_datetime,
          location,
          notes,
          status,
          friends:friend_id (
            id,
            line_user_id,
            display_name,
            is_blocked
          )
        )
      `
      )
      .is('sent_at', null)
      .lte('remind_at', windowEnd.toISOString())
      .gte('remind_at', now.toISOString())
      .order('remind_at', { ascending: true })
      .limit(100); // Process up to 100 reminders per run

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      return new Response(
        JSON.stringify({ error: remindersError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!reminders || reminders.length === 0) {
      console.log('No reminders to process');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No reminders to process',
          processedCount: 0,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let sentCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each reminder
    for (const reminder of reminders as Array<ReminderConfig & { reservations: Reservation }>) {
      try {
        const reservation = reminder.reservations;

        // Validate reservation exists and is active
        if (!reservation || reservation.status === 'cancelled') {
          console.log(`Skipping reminder ${reminder.id}: reservation cancelled or not found`);
          await supabase
            .from('reservation_reminders')
            .update({
              sent_at: now.toISOString(),
              error_message: reservation ? 'Reservation cancelled' : 'Reservation not found',
            })
            .eq('id', reminder.id);
          errorCount++;
          continue;
        }

        const friend = reservation.friends;

        // Skip if user is blocked or not found
        if (!friend || friend.is_blocked) {
          console.log(`Skipping reminder ${reminder.id}: user blocked or not found`);
          await supabase
            .from('reservation_reminders')
            .update({
              sent_at: now.toISOString(),
              error_message: 'User is blocked or not found',
            })
            .eq('id', reminder.id);
          errorCount++;
          continue;
        }

        // Format reservation datetime
        const reservationDate = new Date(reservation.reservation_datetime);
        const dateStr = reservationDate.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        });
        const timeStr = reservationDate.toLocaleTimeString('ja-JP', {
          hour: '2-digit',
          minute: '2-digit',
        });

        // Determine reminder message based on type
        let reminderTitle = '';
        switch (reminder.reminder_type) {
          case '24_hours':
            reminderTitle = '【予約リマインダー】明日のご予約について';
            break;
          case '1_hour':
            reminderTitle = '【予約リマインダー】まもなくご予約時間です';
            break;
          case 'custom':
            reminderTitle = '【予約リマインダー】ご予約のお知らせ';
            break;
        }

        // Generate cancellation URL
        const cancelUrl = `${Deno.env.get('APP_BASE_URL')}/cancel-reservation/${reservation.id}`;

        // Create LINE message
        const messageText = `${reminderTitle}

${friend.display_name}様

ご予約のリマインダーをお送りします。

【予約情報】
日時: ${dateStr} ${timeStr}
場所: ${reservation.location}
${reservation.notes ? `メモ: ${reservation.notes}` : ''}

キャンセルが必要な場合は、以下のURLからお手続きください。
${cancelUrl}

ご来店をお待ちしております。`;

        // Send message via LINE API
        const response = await fetch(`${LINE_API_BASE}/message/push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            to: friend.line_user_id,
            messages: [
              {
                type: 'text',
                text: messageText,
              },
            ],
          }),
        });

        if (response.ok) {
          // Update reminder status to sent
          await supabase
            .from('reservation_reminders')
            .update({
              sent_at: now.toISOString(),
            })
            .eq('id', reminder.id);

          console.log(`Reminder sent successfully: ${reminder.id}`);
          sentCount++;
        } else {
          const errorData = await response.json();

          // Handle rate limiting
          if (response.status === 429) {
            console.log(`Rate limit hit for reminder ${reminder.id}, will retry next run`);
            // Don't update sent_at, will be retried in next run
            continue;
          }

          // Handle invalid user
          if (errorData.message?.includes('Invalid')) {
            await supabase
              .from('reservation_reminders')
              .update({
                sent_at: now.toISOString(),
                error_message: 'Invalid LINE user',
              })
              .eq('id', reminder.id);
          } else {
            await supabase
              .from('reservation_reminders')
              .update({
                sent_at: now.toISOString(),
                error_message: errorData.message || 'Unknown LINE API error',
              })
              .eq('id', reminder.id);
          }

          const errorMsg = `Reminder ${reminder.id}: ${errorData.message || 'Unknown error'}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          errorCount++;
        }
      } catch (error) {
        // Network or other errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorMsg = `Reminder ${reminder.id}: ${errorMessage}`;
        console.error(errorMsg);
        errors.push(errorMsg);

        await supabase
          .from('reservation_reminders')
          .update({
            sent_at: now.toISOString(),
            error_message: errorMessage,
          })
          .eq('id', reminder.id);

        errorCount++;
      }

      // Small delay to respect rate limits (500 messages/second max)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(
      `Reminder processing complete: ${sentCount} sent, ${errorCount} errors`
    );

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        errorCount,
        totalProcessed: reminders.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing reservation reminders:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
