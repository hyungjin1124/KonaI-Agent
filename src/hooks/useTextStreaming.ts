import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTextStreamingConfig {
  content: string;
  typingSpeed?: number;      // ms per character (default: 30)
  cursorBlinkSpeed?: number; // ms (default: 500)
  startDelay?: number;       // ms (default: 0)
  enabled?: boolean;         // default: true
  onComplete?: () => void;
}

export interface UseTextStreamingReturn {
  displayedText: string;
  isStreaming: boolean;
  cursorVisible: boolean;
  progress: number;
  reset: () => void;
}

export function useTextStreaming({
  content,
  typingSpeed = 30,
  cursorBlinkSpeed = 500,
  startDelay = 0,
  enabled = true,
  onComplete
}: UseTextStreamingConfig): UseTextStreamingReturn {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  const charIndexRef = useRef(0);
  const contentRef = useRef(content);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const delayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Update onComplete ref
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (delayTimeoutRef.current) {
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = null;
    }
  }, []);

  // Reset function
  const reset = useCallback(() => {
    cleanup();
    charIndexRef.current = 0;
    setDisplayedText('');
    setIsStreaming(enabled);
  }, [enabled, cleanup]);

  // Main typing effect
  useEffect(() => {
    if (!enabled || !content) {
      setDisplayedText(content || '');
      setIsStreaming(false);
      return;
    }

    // Reset if content changed
    if (content !== contentRef.current) {
      contentRef.current = content;
      charIndexRef.current = 0;
      setDisplayedText('');
    }

    const startTyping = () => {
      setIsStreaming(true);

      typingIntervalRef.current = setInterval(() => {
        if (charIndexRef.current >= content.length) {
          cleanup();
          setIsStreaming(false);
          onCompleteRef.current?.();
          return;
        }

        charIndexRef.current++;
        setDisplayedText(content.slice(0, charIndexRef.current));
      }, typingSpeed);
    };

    delayTimeoutRef.current = setTimeout(startTyping, startDelay);

    return cleanup;
  }, [content, typingSpeed, startDelay, enabled, cleanup]);

  // Cursor blink effect
  useEffect(() => {
    if (!isStreaming) {
      setCursorVisible(false);
      return;
    }

    const blinkInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, cursorBlinkSpeed);

    return () => clearInterval(blinkInterval);
  }, [isStreaming, cursorBlinkSpeed]);

  const progress = content.length > 0
    ? Math.round((displayedText.length / content.length) * 100)
    : 100;

  return {
    displayedText,
    isStreaming,
    cursorVisible,
    progress,
    reset
  };
}
