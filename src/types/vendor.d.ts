// Type declarations for third-party libraries without @types packages

declare module 'react-grid-layout' {
  import { Component, CSSProperties, ReactNode } from 'react';

  export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
    isBounded?: boolean;
  }

  export interface Layouts {
    [key: string]: Layout[];
  }

  export interface ResponsiveProps {
    className?: string;
    style?: CSSProperties;
    width?: number;
    autoSize?: boolean;
    cols?: { [key: string]: number };
    draggableCancel?: string;
    draggableHandle?: string;
    verticalCompact?: boolean;
    compactType?: 'horizontal' | 'vertical' | null;
    layouts?: Layouts;
    margin?: [number, number];
    containerPadding?: [number, number];
    rowHeight?: number;
    maxRows?: number;
    isBounded?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
    isDroppable?: boolean;
    preventCollision?: boolean;
    useCSSTransforms?: boolean;
    transformScale?: number;
    resizeHandles?: Array<'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'>;
    breakpoints?: { [key: string]: number };
    children?: ReactNode;
    onLayoutChange?: (currentLayout: Layout[], allLayouts: Layouts) => void;
    onBreakpointChange?: (newBreakpoint: string, newCols: number) => void;
    onWidthChange?: (containerWidth: number, margin: [number, number], cols: number, containerPadding: [number, number]) => void;
    onDragStart?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onDrag?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onDragStop?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onResizeStart?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onResize?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onResizeStop?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => void;
    onDrop?: (layout: Layout[], item: Layout, e: Event) => void;
  }

  export class Responsive extends Component<ResponsiveProps> {}

  export function WidthProvider<P>(component: React.ComponentType<P>): React.ComponentType<Omit<P, 'width'>>;
}

declare module 'lodash' {
  export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait?: number,
    options?: { leading?: boolean; maxWait?: number; trailing?: boolean }
  ): T & { cancel(): void; flush(): void };

  export function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait?: number,
    options?: { leading?: boolean; trailing?: boolean }
  ): T & { cancel(): void; flush(): void };

  export function cloneDeep<T>(value: T): T;
  export function isEqual(value: unknown, other: unknown): boolean;
  export function merge<TObject, TSource>(object: TObject, source: TSource): TObject & TSource;
  export function omit<T extends object, K extends keyof T>(object: T, ...paths: K[]): Omit<T, K>;
  export function pick<T extends object, K extends keyof T>(object: T, ...paths: K[]): Pick<T, K>;
  export function get<T>(object: object, path: string | string[], defaultValue?: T): T;
  export function set<T extends object>(object: T, path: string | string[], value: unknown): T;
  export function uniqueId(prefix?: string): string;

  const _: {
    debounce: typeof debounce;
    throttle: typeof throttle;
    cloneDeep: typeof cloneDeep;
    isEqual: typeof isEqual;
    merge: typeof merge;
    omit: typeof omit;
    pick: typeof pick;
    get: typeof get;
    set: typeof set;
    uniqueId: typeof uniqueId;
  };

  export default _;
}
