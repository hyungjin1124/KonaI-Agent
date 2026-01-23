import { useEffect, RefObject } from 'react';

/**
 * Hook to automatically resize a textarea based on its content
 * @param ref - Reference to the textarea element
 * @param value - The current value of the textarea
 * @param maxHeight - Optional maximum height in pixels (default: undefined - no max)
 */
export function useAutoResize(
  ref: RefObject<HTMLTextAreaElement>,
  value: string,
  maxHeight?: number
): void {
  useEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;

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
  }, [value, ref, maxHeight]);
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
