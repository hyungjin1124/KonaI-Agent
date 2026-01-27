/**
 * Lazy-loaded chart components for better initial bundle size
 *
 * These components use React.lazy to defer loading of the heavy recharts library
 * until the chart is actually needed, improving Time to Interactive (TTI).
 */

import React, { lazy, Suspense, ComponentType } from 'react';

// Chart fallback component
export const ChartFallback: React.FC<{ height?: number | string }> = ({ height = 256 }) => (
  <div
    className="animate-pulse bg-gray-100 rounded-xl flex items-center justify-center"
    style={{ height: typeof height === 'number' ? `${height}px` : height }}
  >
    <span className="text-gray-400 text-sm">Loading chart...</span>
  </div>
);

// Lazy-loaded chart components
export const LazyLineChart = lazy(() =>
  import('recharts').then(module => ({ default: module.LineChart as ComponentType<any> }))
);

export const LazyBarChart = lazy(() =>
  import('recharts').then(module => ({ default: module.BarChart as ComponentType<any> }))
);

export const LazyAreaChart = lazy(() =>
  import('recharts').then(module => ({ default: module.AreaChart as ComponentType<any> }))
);

export const LazyPieChart = lazy(() =>
  import('recharts').then(module => ({ default: module.PieChart as ComponentType<any> }))
);

export const LazyComposedChart = lazy(() =>
  import('recharts').then(module => ({ default: module.ComposedChart as ComponentType<any> }))
);

// Wrapper component with Suspense
interface ChartContainerProps {
  children: React.ReactNode;
  fallbackHeight?: number | string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  fallbackHeight = 256
}) => (
  <Suspense fallback={<ChartFallback height={fallbackHeight} />}>
    {children}
  </Suspense>
);

// Re-export commonly used recharts components that are lightweight
export {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  Bar,
  Area,
  Pie,
  Cell,
  ReferenceLine,
  LabelList
} from 'recharts';
