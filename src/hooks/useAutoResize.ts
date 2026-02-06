import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook to automatically resize a textarea based on its content.
 * Uses requestAnimationFrame to batch DOM reads/writes and avoid
 * layout thrashing on rapid keystrokes.
 *
 * @param ref - Reference to the textarea element
 * @param value - The current value of the textarea
 * @param maxHeight - Optional maximum height in pixels (default: undefined - no max)
 */
export function useAutoResize(
  ref: RefObject<HTMLTextAreaElement>,
  value: string,
  maxHeight?: number
): void {
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;

    // Cancel any pending RAF to debounce rapid updates
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Calculate new height
      let newHeight = textarea.scrollHeight;

      // Apply max height if specified
      if (maxHeight && newHeight > maxHeight) {
        newHeight = maxHeight;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }

      textarea.style.height = `${newHeight}px`;
      rafId.current = null;
    });
  }, [value, ref, maxHeight]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);
}

/**
 * Hook to scroll an element to the bottom
 * @param ref - Reference to the element
 * @param dependencies - Array of dependencies that trigger scroll
 */
export function useScrollToBottom(
  ref: RefObject<HTMLElement>,
  dependencies: unknown[]
): void {
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, dependencies);
}
