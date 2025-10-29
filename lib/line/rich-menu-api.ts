/**
 * LINE Rich Menu API Integration
 * Handles Rich Menu creation, image upload, and management
 */

const LINE_API_BASE = 'https://api.line.me/v2/bot';

export interface RichMenuSize {
  width: number;
  height: number;
}

export interface RichMenuBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RichMenuArea {
  bounds: RichMenuBounds;
  action: RichMenuAction;
}

export interface RichMenuAction {
  type: 'postback' | 'message' | 'uri' | 'datetimepicker' | 'richmenuswitch';
  label?: string;
  data?: string;
  text?: string;
  uri?: string;
  mode?: string;
  initial?: string;
  max?: string;
  min?: string;
  richMenuAliasId?: string;
}

export interface RichMenuRequest {
  size: RichMenuSize;
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: RichMenuArea[];
}

export interface RichMenuResponse {
  richMenuId: string;
}

export interface RichMenuListResponse {
  richmenus: {
    richMenuId: string;
    size: RichMenuSize;
    selected: boolean;
    name: string;
    chatBarText: string;
    areas: RichMenuArea[];
  }[];
}

export class LineRichMenuAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Create a new Rich Menu
   */
  async createRichMenu(richMenu: RichMenuRequest): Promise<RichMenuResponse> {
    try {
      const response = await fetch(`${LINE_API_BASE}/richmenu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(richMenu),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to create Rich Menu: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Rich Menu creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Upload Rich Menu image
   */
  async uploadRichMenuImage(
    richMenuId: string,
    imageBuffer: Buffer,
    contentType: string = 'image/png'
  ): Promise<void> {
    try {
      const response = await fetch(
        `${LINE_API_BASE}/richmenu/${richMenuId}/content`,
        {
          method: 'POST',
          headers: {
            'Content-Type': contentType,
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: imageBuffer,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to upload Rich Menu image: ${response.status}`
        );
      }
    } catch (error) {
      throw new Error(
        `Rich Menu image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Set Rich Menu as default for all users
   */
  async setDefaultRichMenu(richMenuId: string): Promise<void> {
    try {
      const response = await fetch(`${LINE_API_BASE}/user/all/richmenu/${richMenuId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to set default Rich Menu: ${response.status}`
        );
      }
    } catch (error) {
      throw new Error(
        `Setting default Rich Menu failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get default Rich Menu ID
   */
  async getDefaultRichMenuId(): Promise<string | null> {
    try {
      const response = await fetch(`${LINE_API_BASE}/user/all/richmenu`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get default Rich Menu: ${response.status}`);
      }

      const data = await response.json();
      return data.richMenuId || null;
    } catch (error) {
      throw new Error(
        `Getting default Rich Menu failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Cancel default Rich Menu
   */
  async cancelDefaultRichMenu(): Promise<void> {
    try {
      const response = await fetch(`${LINE_API_BASE}/user/all/richmenu`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok && response.status !== 404) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to cancel default Rich Menu: ${response.status}`
        );
      }
    } catch (error) {
      throw new Error(
        `Canceling default Rich Menu failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete a Rich Menu
   */
  async deleteRichMenu(richMenuId: string): Promise<void> {
    try {
      const response = await fetch(`${LINE_API_BASE}/richmenu/${richMenuId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok && response.status !== 404) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to delete Rich Menu: ${response.status}`
        );
      }
    } catch (error) {
      throw new Error(
        `Rich Menu deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Link Rich Menu to a specific user
   */
  async linkRichMenuToUser(richMenuId: string, userId: string): Promise<void> {
    try {
      const response = await fetch(
        `${LINE_API_BASE}/user/${userId}/richmenu/${richMenuId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to link Rich Menu to user: ${response.status}`
        );
      }
    } catch (error) {
      throw new Error(
        `Linking Rich Menu to user failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Unlink Rich Menu from a specific user
   */
  async unlinkRichMenuFromUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${LINE_API_BASE}/user/${userId}/richmenu`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok && response.status !== 404) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to unlink Rich Menu from user: ${response.status}`
        );
      }
    } catch (error) {
      throw new Error(
        `Unlinking Rich Menu from user failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get Rich Menu ID linked to a user
   */
  async getRichMenuIdOfUser(userId: string): Promise<string | null> {
    try {
      const response = await fetch(`${LINE_API_BASE}/user/${userId}/richmenu`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get user's Rich Menu: ${response.status}`);
      }

      const data = await response.json();
      return data.richMenuId || null;
    } catch (error) {
      throw new Error(
        `Getting user's Rich Menu failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get Rich Menu details
   */
  async getRichMenu(richMenuId: string): Promise<RichMenuRequest> {
    try {
      const response = await fetch(`${LINE_API_BASE}/richmenu/${richMenuId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to get Rich Menu: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Getting Rich Menu failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * List all Rich Menus
   */
  async listRichMenus(): Promise<RichMenuListResponse> {
    try {
      const response = await fetch(`${LINE_API_BASE}/richmenu/list`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to list Rich Menus: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Listing Rich Menus failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Create LINE Rich Menu API client
 */
export function createRichMenuClient(accessToken?: string): LineRichMenuAPI {
  const token = accessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!token) {
    throw new Error('LINE access token not configured');
  }

  return new LineRichMenuAPI(token);
}

/**
 * Download image from URL as Buffer
 */
export async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    throw new Error(
      `Image download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
