/**
 * Edge Function: process-url-click
 * Trigger: HTTP POST from redirect handler
 * Processes URL click tracking and analytics
 *
 * Features:
 * - Records individual click events in url_clicks table
 * - Increments url_tracking.click_count and unique_click_count
 * - Updates url_tracking.last_clicked_at timestamp
 * - Records analytics_events for reporting
 * - Parses User-Agent for device type, browser, and OS detection
 * - Tracks referrer, IP address, and session information
 * - Supports UTM parameter tracking
 * - Returns redirect URL for client-side redirection
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ClickData {
  short_code: string;
  friend_id?: string;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
  session_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

interface DeviceInfo {
  device_type: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown';
  browser: string;
  os: string;
}

/**
 * Parse User-Agent string to extract device type, browser, and OS
 */
function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();

  // Detect bots
  if (
    ua.includes('bot') ||
    ua.includes('crawler') ||
    ua.includes('spider') ||
    ua.includes('slurp')
  ) {
    return {
      device_type: 'bot',
      browser: 'Bot',
      os: 'Unknown',
    };
  }

  // Detect device type
  let device_type: DeviceInfo['device_type'] = 'desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    device_type = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    device_type = 'tablet';
  }

  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('chrome')) {
    browser = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
  } else if (ua.includes('msie') || ua.includes('trident')) {
    browser = 'Internet Explorer';
  }

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac os') || ua.includes('macos')) {
    os = 'macOS';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) {
    os = 'iOS';
  }

  return {
    device_type,
    browser,
    os,
  };
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    console.log('Processing URL click...');

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse request body
    const clickData: ClickData = await req.json();

    if (!clickData.short_code) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: short_code' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing click for short code: ${clickData.short_code}`);

    // Get URL tracking record
    const { data: urlTracking, error: trackingError } = await supabase
      .from('url_tracking')
      .select('id, organization_id, original_url, is_active, expires_at, click_count, unique_click_count')
      .eq('short_code', clickData.short_code)
      .single();

    if (trackingError || !urlTracking) {
      console.error('URL tracking not found:', trackingError);
      return new Response(
        JSON.stringify({ error: 'URL not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if URL is active and not expired
    if (!urlTracking.is_active) {
      return new Response(
        JSON.stringify({ error: 'URL is inactive' }),
        {
          status: 410,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (urlTracking.expires_at && new Date(urlTracking.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'URL has expired' }),
        {
          status: 410,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse User-Agent
    const userAgent = clickData.user_agent || req.headers.get('user-agent') || '';
    const deviceInfo = parseUserAgent(userAgent);

    // Check if this is a unique click (based on session_id and url_tracking_id)
    let isUniqueClick = true;
    if (clickData.session_id) {
      const { data: existingClick } = await supabase
        .from('url_clicks')
        .select('id')
        .eq('url_tracking_id', urlTracking.id)
        .eq('session_id', clickData.session_id)
        .limit(1)
        .single();

      isUniqueClick = !existingClick;
    }

    // Create url_clicks record
    const { error: clickError } = await supabase.from('url_clicks').insert({
      url_tracking_id: urlTracking.id,
      organization_id: urlTracking.organization_id,
      friend_id: clickData.friend_id || null,
      clicked_at: new Date().toISOString(),
      user_agent: userAgent,
      device_type: deviceInfo.device_type,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ip_address: clickData.ip_address || null,
      referrer: clickData.referrer || req.headers.get('referer') || null,
      utm_source: clickData.utm_source || null,
      utm_medium: clickData.utm_medium || null,
      utm_campaign: clickData.utm_campaign || null,
      utm_content: clickData.utm_content || null,
      utm_term: clickData.utm_term || null,
      session_id: clickData.session_id || null,
      is_unique_click: isUniqueClick,
    });

    if (clickError) {
      console.error('Error creating click record:', clickError);
      throw clickError;
    }

    // Update url_tracking statistics
    const updateData: Record<string, any> = {
      click_count: urlTracking.click_count + 1,
      last_clicked_at: new Date().toISOString(),
    };

    if (isUniqueClick) {
      updateData.unique_click_count = (urlTracking.unique_click_count || 0) + 1;
    }

    const { error: updateError } = await supabase
      .from('url_tracking')
      .update(updateData)
      .eq('id', urlTracking.id);

    if (updateError) {
      console.error('Error updating url_tracking:', updateError);
      // Non-critical error, continue processing
    }

    // Record analytics event
    const { error: eventError } = await supabase.from('analytics_events').insert({
      organization_id: urlTracking.organization_id,
      friend_id: clickData.friend_id || null,
      event_type: 'url_clicked',
      event_data: {
        url_tracking_id: urlTracking.id,
        short_code: clickData.short_code,
        device_type: deviceInfo.device_type,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        is_unique_click: isUniqueClick,
        utm_source: clickData.utm_source,
        utm_medium: clickData.utm_medium,
        utm_campaign: clickData.utm_campaign,
      },
      user_agent: userAgent,
      ip_address: clickData.ip_address || null,
      session_id: clickData.session_id || null,
      referrer: clickData.referrer || req.headers.get('referer') || null,
    });

    if (eventError) {
      console.error('Error creating analytics event:', eventError);
      // Non-critical error, continue processing
    }

    console.log(
      `Click processed successfully: ${clickData.short_code} (unique: ${isUniqueClick})`
    );

    // Return redirect URL
    return new Response(
      JSON.stringify({
        success: true,
        redirect_url: urlTracking.original_url,
        is_unique_click: isUniqueClick,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing URL click:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
