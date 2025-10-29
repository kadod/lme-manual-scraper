import type { ChartConfig } from '@/types/analytics'

// Recharts Default Configuration
export const RECHARTS_DEFAULT_CONFIG = {
  margin: { top: 5, right: 30, left: 20, bottom: 5 },
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 300,
    easing: 'ease-in-out',
  },
} as const

// Chart Dimensions
export const CHART_DIMENSIONS = {
  height: {
    small: 200,
    medium: 300,
    large: 400,
    xlarge: 500,
  },
  width: {
    mobile: 320,
    tablet: 768,
    desktop: 1024,
  },
} as const

// Color Palettes
export const COLOR_PALETTES = {
  blue: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  green: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
  purple: ['#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87'],
  orange: ['#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
  red: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
  cyan: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
  amber: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'],
  pink: ['#ec4899', '#db2777', '#be185d', '#9f1239', '#831843'],
  gradient: [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  ],
} as const

// Font Configuration
export const FONT_CONFIG = {
  family: {
    primary: 'Inter, system-ui, sans-serif',
    monospace: 'Consolas, Monaco, monospace',
  },
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
  },
  weight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const

// Tooltip Configuration
export const TOOLTIP_CONFIG = {
  contentStyle: {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    padding: '12px',
  },
  labelStyle: {
    color: 'hsl(var(--popover-foreground))',
    fontWeight: 600,
    marginBottom: '8px',
  },
  itemStyle: {
    color: 'hsl(var(--muted-foreground))',
  },
  cursor: {
    fill: 'rgba(59, 130, 246, 0.1)',
  },
} as const

// Axis Configuration
export const AXIS_CONFIG = {
  tick: {
    fontSize: FONT_CONFIG.size.sm,
    fill: 'hsl(var(--muted-foreground))',
  },
  axisLine: {
    stroke: 'hsl(var(--border))',
  },
  tickLine: {
    stroke: 'hsl(var(--border))',
  },
} as const

// Grid Configuration
export const GRID_CONFIG = {
  strokeDasharray: '3 3',
  stroke: 'hsl(var(--border))',
  opacity: 0.5,
} as const

// Legend Configuration
export const LEGEND_CONFIG = {
  wrapperStyle: {
    paddingTop: '16px',
  },
  iconSize: 12,
  iconType: 'circle' as const,
} as const

// Responsive Breakpoints
export const RESPONSIVE_BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const

// Chart Type Specific Configs
export const LINE_CHART_CONFIG = {
  strokeWidth: 2,
  dot: {
    r: 4,
    strokeWidth: 2,
  },
  activeDot: {
    r: 6,
    strokeWidth: 2,
  },
} as const

export const BAR_CHART_CONFIG = {
  barSize: 40,
  maxBarSize: 60,
  radius: [4, 4, 0, 0] as [number, number, number, number],
  barGap: 4,
  barCategoryGap: '20%',
} as const

export const PIE_CHART_CONFIG = {
  innerRadius: 0,
  outerRadius: 80,
  paddingAngle: 2,
  labelLine: false,
  label: {
    fill: 'hsl(var(--foreground))',
    fontSize: FONT_CONFIG.size.sm,
  },
} as const

export const AREA_CHART_CONFIG = {
  fillOpacity: 0.6,
  strokeWidth: 2,
  gradientOffset: {
    start: '5%',
    end: '95%',
  },
  gradientOpacity: {
    start: 0.8,
    end: 0.1,
  },
} as const

// Animation Configs
export const ANIMATION_CONFIG = {
  duration: 300,
  easing: 'ease-in-out',
  animationBegin: 0,
  isAnimationActive: true,
} as const

// Export helper function to get color by value
export function getColorByValue(
  value: number,
  thresholds: { low: number; medium: number; high: number }
): string {
  if (value >= thresholds.high) return COLOR_PALETTES.green[0]
  if (value >= thresholds.medium) return COLOR_PALETTES.amber[0]
  return COLOR_PALETTES.red[0]
}

// Export helper function to create chart config
export function createChartConfig(
  dataKey: string,
  label: string,
  options?: {
    color?: string
    unit?: string
    formatter?: (value: number) => string
  }
): ChartConfig {
  return {
    dataKey,
    label,
    color: options?.color,
    unit: options?.unit,
    formatter: options?.formatter,
  }
}

// Export helper to generate gradient ID
export function getGradientId(dataKey: string): string {
  return `gradient-${dataKey}`
}
