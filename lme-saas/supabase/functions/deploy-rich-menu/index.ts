import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RichMenuSize {
  width: number
  height: number
}

interface RichMenuBounds {
  x: number
  y: number
  width: number
  height: number
}

interface RichMenuAction {
  type: string
  label?: string
  data?: string
  text?: string
  uri?: string
}

interface RichMenuArea {
  bounds: RichMenuBounds
  action: RichMenuAction
}

interface RichMenuRequest {
  size: RichMenuSize
  selected: boolean
  name: string
  chatBarText: string
  areas: RichMenuArea[]
}

interface DeployRequest {
  richMenuId: string
  setAsDefault?: boolean
}

interface DeployResponse {
  success: boolean
  lineRichMenuId?: string
  error?: string
}

const LINE_API_BASE = 'https://api.line.me/v2/bot'

async function downloadImage(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`)
  }
  return await response.arrayBuffer()
}

async function createLineRichMenu(
  accessToken: string,
  richMenu: RichMenuRequest
): Promise<string> {
  const response = await fetch(`${LINE_API_BASE}/richmenu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(richMenu),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || `Failed to create Rich Menu: ${response.status}`)
  }

  const data = await response.json()
  return data.richMenuId
}

async function uploadRichMenuImage(
  accessToken: string,
  richMenuId: string,
  imageBuffer: ArrayBuffer,
  contentType: string
): Promise<void> {
  const response = await fetch(`${LINE_API_BASE}/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${accessToken}`,
    },
    body: imageBuffer,
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || `Failed to upload image: ${response.status}`)
  }
}

async function setDefaultRichMenu(accessToken: string, richMenuId: string): Promise<void> {
  const response = await fetch(`${LINE_API_BASE}/user/all/richmenu/${richMenuId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || `Failed to set default: ${response.status}`)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const { richMenuId, setAsDefault = false }: DeployRequest = await req.json()

    if (!richMenuId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rich Menu ID is required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Get Rich Menu data from database
    const { data: richMenu, error: richMenuError } = await supabaseClient
      .from('rich_menus')
      .select(`
        *,
        areas:rich_menu_areas(*)
      `)
      .eq('id', richMenuId)
      .eq('user_id', user.id)
      .single()

    if (richMenuError || !richMenu) {
      return new Response(
        JSON.stringify({ success: false, error: 'Rich Menu not found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Get LINE credentials from user settings or environment
    const lineAccessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN')

    if (!lineAccessToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'LINE credentials not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Build Rich Menu request
    const richMenuRequest: RichMenuRequest = {
      size: richMenu.size as RichMenuSize,
      selected: richMenu.selected,
      name: richMenu.name,
      chatBarText: richMenu.chat_bar_text,
      areas: (richMenu.areas as any[]).map((area: any) => ({
        bounds: area.bounds,
        action: area.action,
      })),
    }

    // Create Rich Menu in LINE
    const lineRichMenuId = await createLineRichMenu(lineAccessToken, richMenuRequest)

    // Download and upload image
    if (richMenu.image_url) {
      const imageBuffer = await downloadImage(richMenu.image_url)
      const contentType = richMenu.image_url.endsWith('.jpg') || richMenu.image_url.endsWith('.jpeg')
        ? 'image/jpeg'
        : 'image/png'

      await uploadRichMenuImage(lineAccessToken, lineRichMenuId, imageBuffer, contentType)
    }

    // Set as default if requested
    if (setAsDefault) {
      await setDefaultRichMenu(lineAccessToken, lineRichMenuId)
    }

    // Update database with LINE Rich Menu ID
    const { error: updateError } = await supabaseClient
      .from('rich_menus')
      .update({
        line_rich_menu_id: lineRichMenuId,
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', richMenuId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update database:', updateError)
    }

    const response: DeployResponse = {
      success: true,
      lineRichMenuId,
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Deploy Rich Menu error:', error)

    const response: DeployResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
