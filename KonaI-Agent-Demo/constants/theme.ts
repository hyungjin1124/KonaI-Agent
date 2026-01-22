// Brand Colors
export const BRAND_COLORS = {
  PRIMARY: '#FF3C42',
  PRIMARY_DARK: '#E02B31',
  PRIMARY_LIGHT: '#FF6D72',
  PRIMARY_LIGHTER: '#FF9DA0',
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  GRAY_DARK: '#0A0A0A',
  GRAY_MEDIUM: '#555555',
  GRAY: '#848383',
  GRAY_LIGHT: '#AAAAAA',
  GRAY_LIGHTER: '#E5E7EB',
  GRAY_LIGHTEST: '#F3F4F6',
} as const;

// Chart Color Palettes
export const CHART_COLORS = {
  DEFAULT: ['#000000', '#555555', '#848383', '#AAAAAA', '#E5E7EB'],
  ACCENT: ['#FF3C42', '#000000', '#555555', '#848383', '#AAAAAA'],
  GRADIENT: {
    start: '#FF3C42',
    end: '#000000',
  },
  PIE: ['#000000', '#555555', '#848383', '#AAAAAA', '#E5E7EB'],
} as const;

// Trend Colors
export const TREND_COLORS = {
  UP: {
    bg: 'bg-red-50',
    text: 'text-[#FF3C42]',
    hex: '#FF3C42',
  },
  DOWN: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    hex: '#2563EB',
  },
  NEUTRAL: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    hex: '#4B5563',
  },
} as const;

// Status Colors
export const STATUS_COLORS = {
  CRITICAL: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    text: 'text-red-600',
    hex: '#DC2626',
  },
  WARNING: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-600',
    hex: '#D97706',
  },
  SUCCESS: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    text: 'text-green-600',
    hex: '#059669',
  },
  INFO: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    text: 'text-blue-600',
    hex: '#2563EB',
  },
} as const;

// Tailwind class helpers
export const getTrendClasses = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return TREND_COLORS.UP;
    case 'down':
      return TREND_COLORS.DOWN;
    default:
      return TREND_COLORS.NEUTRAL;
  }
};

export const getStatusClasses = (status: 'critical' | 'warning' | 'success' | 'info') => {
  switch (status) {
    case 'critical':
      return STATUS_COLORS.CRITICAL;
    case 'warning':
      return STATUS_COLORS.WARNING;
    case 'success':
      return STATUS_COLORS.SUCCESS;
    default:
      return STATUS_COLORS.INFO;
  }
};
