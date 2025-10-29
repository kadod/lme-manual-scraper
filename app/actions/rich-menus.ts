'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { RichMenuData } from '@/lib/line/rich-menu-types';

const LINE_API_BASE = 'https://api.line.me/v2/bot';

/**
 * Upload rich menu image to LINE
 */
export async function uploadRichMenuImage(
  richMenuId: string,
  imageData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get LINE channel access token
    const { data: channel } = await supabase
      .from('line_channels')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      return { success: false, error: 'LINE channel not found' };
    }

    const imageFile = imageData.get('image') as File;
    if (!imageFile) {
      return { success: false, error: 'No image provided' };
    }

    const imageBuffer = await imageFile.arrayBuffer();

    // Upload image to LINE
    const response = await fetch(
      `${LINE_API_BASE}/richmenu/${richMenuId}/content`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
          Authorization: `Bearer ${channel.access_token}`,
        },
        body: imageBuffer,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to upload image',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error uploading rich menu image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create rich menu on LINE
 */
export async function createRichMenu(richMenuData: RichMenuData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get LINE channel access token
    const { data: channel } = await supabase
      .from('line_channels')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      return { success: false, error: 'LINE channel not found' };
    }

    // Create rich menu on LINE
    const response = await fetch(`${LINE_API_BASE}/richmenu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channel.access_token}`,
      },
      body: JSON.stringify(richMenuData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to create rich menu',
      };
    }

    const data = await response.json();
    const richMenuId = data.richMenuId;

    // Save to database
    const { error: dbError } = await supabase.from('rich_menus').insert({
      user_id: user.id,
      rich_menu_id: richMenuId,
      name: richMenuData.name,
      chat_bar_text: richMenuData.chatBarText,
      size: richMenuData.size,
      selected: richMenuData.selected,
      areas: richMenuData.areas,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Database error:', dbError);
    }

    revalidatePath('/dashboard/rich-menus');

    return { success: true, richMenuId };
  } catch (error) {
    console.error('Error creating rich menu:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update rich menu
 */
export async function updateRichMenu(
  richMenuId: string,
  richMenuData: RichMenuData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get LINE channel access token
    const { data: channel } = await supabase
      .from('line_channels')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      return { success: false, error: 'LINE channel not found' };
    }

    // Delete old rich menu from LINE
    await fetch(`${LINE_API_BASE}/richmenu/${richMenuId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${channel.access_token}`,
      },
    });

    // Create new rich menu
    const response = await fetch(`${LINE_API_BASE}/richmenu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channel.access_token}`,
      },
      body: JSON.stringify(richMenuData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to update rich menu',
      };
    }

    const data = await response.json();
    const newRichMenuId = data.richMenuId;

    // Update database
    const { error: dbError } = await supabase
      .from('rich_menus')
      .update({
        rich_menu_id: newRichMenuId,
        name: richMenuData.name,
        chat_bar_text: richMenuData.chatBarText,
        size: richMenuData.size,
        selected: richMenuData.selected,
        areas: richMenuData.areas,
        updated_at: new Date().toISOString(),
      })
      .eq('rich_menu_id', richMenuId);

    if (dbError) {
      console.error('Database error:', dbError);
    }

    revalidatePath('/dashboard/rich-menus');

    return { success: true, richMenuId: newRichMenuId };
  } catch (error) {
    console.error('Error updating rich menu:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete rich menu
 */
export async function deleteRichMenu(richMenuId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get LINE channel access token
    const { data: channel } = await supabase
      .from('line_channels')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      return { success: false, error: 'LINE channel not found' };
    }

    // Delete from LINE
    const response = await fetch(`${LINE_API_BASE}/richmenu/${richMenuId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${channel.access_token}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to delete rich menu',
      };
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('rich_menus')
      .delete()
      .eq('rich_menu_id', richMenuId);

    if (dbError) {
      console.error('Database error:', dbError);
    }

    revalidatePath('/dashboard/rich-menus');

    return { success: true };
  } catch (error) {
    console.error('Error deleting rich menu:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all rich menus for current user
 */
export async function getRichMenus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('rich_menus')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rich menus:', error);
    throw error;
  }

  return data;
}

/**
 * Duplicate rich menu
 */
export async function duplicateRichMenu(richMenuId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get original rich menu
    const { data: original } = await supabase
      .from('rich_menus')
      .select('*')
      .eq('rich_menu_id', richMenuId)
      .eq('user_id', user.id)
      .single();

    if (!original) {
      return { success: false, error: 'Rich menu not found' };
    }

    // Get LINE channel access token
    const { data: channel } = await supabase
      .from('line_channels')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      return { success: false, error: 'LINE channel not found' };
    }

    // Create new rich menu on LINE
    const richMenuData: RichMenuData = {
      name: `${original.name} (コピー)`,
      chatBarText: original.chat_bar_text,
      size: original.size,
      selected: original.selected,
      areas: original.areas,
    };

    const response = await fetch(`${LINE_API_BASE}/richmenu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channel.access_token}`,
      },
      body: JSON.stringify(richMenuData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to create rich menu',
      };
    }

    const data = await response.json();
    const newRichMenuId = data.richMenuId;

    // Save to database
    const { error: dbError } = await supabase.from('rich_menus').insert({
      user_id: user.id,
      rich_menu_id: newRichMenuId,
      name: richMenuData.name,
      chat_bar_text: richMenuData.chatBarText,
      size: richMenuData.size,
      selected: richMenuData.selected,
      areas: richMenuData.areas,
      is_default: false,
      status: 'draft',
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Database error:', dbError);
      return { success: false, error: 'Failed to save to database' };
    }

    revalidatePath('/dashboard/rich-menus');

    return { success: true, richMenuId: newRichMenuId };
  } catch (error) {
    console.error('Error duplicating rich menu:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Set rich menu as default
 */
export async function setDefaultRichMenu(richMenuId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get LINE channel access token
    const { data: channel } = await supabase
      .from('line_channels')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      return { success: false, error: 'LINE channel not found' };
    }

    // Set as default on LINE
    const response = await fetch(`${LINE_API_BASE}/user/all/richmenu/${richMenuId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${channel.access_token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to set default rich menu',
      };
    }

    // Remove default from all menus
    await supabase
      .from('rich_menus')
      .update({ is_default: false })
      .eq('user_id', user.id);

    // Set this menu as default
    const { error: dbError } = await supabase
      .from('rich_menus')
      .update({ is_default: true })
      .eq('rich_menu_id', richMenuId);

    if (dbError) {
      console.error('Database error:', dbError);
    }

    revalidatePath('/dashboard/rich-menus');

    return { success: true };
  } catch (error) {
    console.error('Error setting default rich menu:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Publish rich menu
 */
export async function publishRichMenu(richMenuId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error: dbError } = await supabase
      .from('rich_menus')
      .update({ status: 'published' })
      .eq('rich_menu_id', richMenuId)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database error:', dbError);
      return { success: false, error: 'Failed to publish' };
    }

    revalidatePath('/dashboard/rich-menus');

    return { success: true };
  } catch (error) {
    console.error('Error publishing rich menu:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Unpublish rich menu
 */
export async function unpublishRichMenu(richMenuId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { error: dbError } = await supabase
      .from('rich_menus')
      .update({ status: 'unpublished' })
      .eq('rich_menu_id', richMenuId)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database error:', dbError);
      return { success: false, error: 'Failed to unpublish' };
    }

    revalidatePath('/dashboard/rich-menus');

    return { success: true };
  } catch (error) {
    console.error('Error unpublishing rich menu:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Deploy rich menu to LINE (using Edge Function)
 */
export interface DeployRichMenuOptions {
  richMenuId: string;
  setAsDefault?: boolean;
}

export interface DeployResult {
  success: boolean;
  lineRichMenuId?: string;
  error?: string;
}

export async function deployRichMenu(
  options: DeployRichMenuOptions
): Promise<DeployResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get the auth session for the edge function
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        error: 'No active session',
      };
    }

    // Call edge function to deploy
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/deploy-rich-menu`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(options),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Deploy failed',
      };
    }

    const result = await response.json();

    revalidatePath('/dashboard/rich-menus');

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Set rich menu as default (for already deployed menu)
 */
export async function setAsDefault(richMenuId: string): Promise<DeployResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get rich menu to verify it's deployed
    const { data: richMenu } = await supabase
      .from('rich_menus')
      .select('*')
      .eq('rich_menu_id', richMenuId)
      .eq('user_id', user.id)
      .single();

    if (!richMenu) {
      return {
        success: false,
        error: 'Rich Menu not found',
      };
    }

    if (!richMenu.line_rich_menu_id) {
      return {
        success: false,
        error: 'Rich Menu not deployed to LINE',
      };
    }

    // Get LINE channel access token
    const { data: channel } = await supabase
      .from('line_channels')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      return { success: false, error: 'LINE channel not found' };
    }

    // Set as default on LINE
    const response = await fetch(
      `${LINE_API_BASE}/user/all/richmenu/${richMenu.line_rich_menu_id}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${channel.access_token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to set default rich menu',
      };
    }

    // Remove default from all menus
    await supabase
      .from('rich_menus')
      .update({ is_default: false })
      .eq('user_id', user.id);

    // Set this menu as default
    await supabase
      .from('rich_menus')
      .update({ is_default: true })
      .eq('rich_menu_id', richMenuId);

    revalidatePath('/dashboard/rich-menus');

    return {
      success: true,
      lineRichMenuId: richMenu.line_rich_menu_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Undeploy rich menu from LINE
 */
export async function undeployRichMenu(richMenuId: string): Promise<DeployResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get rich menu
    const { data: richMenu } = await supabase
      .from('rich_menus')
      .select('*')
      .eq('rich_menu_id', richMenuId)
      .eq('user_id', user.id)
      .single();

    if (!richMenu) {
      return {
        success: false,
        error: 'Rich Menu not found',
      };
    }

    if (!richMenu.line_rich_menu_id) {
      return {
        success: false,
        error: 'Rich Menu not deployed',
      };
    }

    // Get LINE channel access token
    const { data: channel } = await supabase
      .from('line_channels')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      return { success: false, error: 'LINE channel not found' };
    }

    // Delete from LINE
    const response = await fetch(
      `${LINE_API_BASE}/richmenu/${richMenu.line_rich_menu_id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${channel.access_token}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to delete from LINE',
      };
    }

    // Update database
    await supabase
      .from('rich_menus')
      .update({
        line_rich_menu_id: null,
        status: 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('rich_menu_id', richMenuId)
      .eq('user_id', user.id);

    revalidatePath('/dashboard/rich-menus');

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Link rich menu to specific user
 */
export async function linkRichMenuToUser(
  richMenuId: string,
  lineUserId: string
): Promise<DeployResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get rich menu
    const { data: richMenu } = await supabase
      .from('rich_menus')
      .select('*')
      .eq('rich_menu_id', richMenuId)
      .eq('user_id', user.id)
      .single();

    if (!richMenu) {
      return {
        success: false,
        error: 'Rich Menu not found',
      };
    }

    if (!richMenu.line_rich_menu_id) {
      return {
        success: false,
        error: 'Rich Menu not deployed',
      };
    }

    // Get LINE channel access token
    const { data: channel } = await supabase
      .from('line_channels')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      return { success: false, error: 'LINE channel not found' };
    }

    // Link to user in LINE
    const response = await fetch(
      `${LINE_API_BASE}/user/${lineUserId}/richmenu/${richMenu.line_rich_menu_id}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${channel.access_token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to link Rich Menu to user',
      };
    }

    return {
      success: true,
      lineRichMenuId: richMenu.line_rich_menu_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Unlink rich menu from specific user
 */
export async function unlinkRichMenuFromUser(
  lineUserId: string
): Promise<DeployResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get LINE channel access token
    const { data: channel } = await supabase
      .from('line_channels')
      .select('access_token')
      .eq('user_id', user.id)
      .single();

    if (!channel) {
      return { success: false, error: 'LINE channel not found' };
    }

    // Unlink from user in LINE
    const response = await fetch(`${LINE_API_BASE}/user/${lineUserId}/richmenu`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${channel.access_token}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Failed to unlink Rich Menu from user',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
