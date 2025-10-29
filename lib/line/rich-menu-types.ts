/**
 * LINE Rich Menu Types
 * Based on LINE Messaging API Rich Menu specifications
 */

export type RichMenuSize = {
  width: 2500;
  height: 1686 | 843;
};

export type RichMenuActionType = 'uri' | 'message' | 'postback';

export interface RichMenuAction {
  type: RichMenuActionType;
  label?: string;
  data?: string;
  uri?: string;
  text?: string;
}

export interface RichMenuArea {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: RichMenuAction;
}

export interface RichMenuData {
  size: RichMenuSize;
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: RichMenuArea[];
}

export interface GridTemplate {
  id: string;
  name: string;
  rows: number;
  cols: number;
  areas: Omit<RichMenuArea, 'action'>[];
}

export const RICH_MENU_SIZES: RichMenuSize[] = [
  { width: 2500, height: 1686 },
  { width: 2500, height: 843 },
];

export const GRID_TEMPLATES: GridTemplate[] = [
  {
    id: '2x2',
    name: '2x2グリッド',
    rows: 2,
    cols: 2,
    areas: [
      { bounds: { x: 0, y: 0, width: 1250, height: 843 } },
      { bounds: { x: 1250, y: 0, width: 1250, height: 843 } },
      { bounds: { x: 0, y: 843, width: 1250, height: 843 } },
      { bounds: { x: 1250, y: 843, width: 1250, height: 843 } },
    ],
  },
  {
    id: '3x3',
    name: '3x3グリッド',
    rows: 3,
    cols: 3,
    areas: [
      { bounds: { x: 0, y: 0, width: 833, height: 562 } },
      { bounds: { x: 833, y: 0, width: 834, height: 562 } },
      { bounds: { x: 1667, y: 0, width: 833, height: 562 } },
      { bounds: { x: 0, y: 562, width: 833, height: 562 } },
      { bounds: { x: 833, y: 562, width: 834, height: 562 } },
      { bounds: { x: 1667, y: 562, width: 833, height: 562 } },
      { bounds: { x: 0, y: 1124, width: 833, height: 562 } },
      { bounds: { x: 833, y: 1124, width: 834, height: 562 } },
      { bounds: { x: 1667, y: 1124, width: 833, height: 562 } },
    ],
  },
  {
    id: '2x1',
    name: '2x1グリッド (小)',
    rows: 1,
    cols: 2,
    areas: [
      { bounds: { x: 0, y: 0, width: 1250, height: 843 } },
      { bounds: { x: 1250, y: 0, width: 1250, height: 843 } },
    ],
  },
  {
    id: '3x1',
    name: '3x1グリッド (小)',
    rows: 1,
    cols: 3,
    areas: [
      { bounds: { x: 0, y: 0, width: 833, height: 843 } },
      { bounds: { x: 833, y: 0, width: 834, height: 843 } },
      { bounds: { x: 1667, y: 0, width: 833, height: 843 } },
    ],
  },
];
