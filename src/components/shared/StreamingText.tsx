import React from 'react';
import { useTextStreaming } from '../../hooks/useTextStreaming';
import TypingCursor from './TypingCursor';

interface StreamingTextProps {
  content: string;
  className?: string;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'strong';
  typingSpeed?: number;
  startDelay?: number;
  showCursor?: boolean;
  cursorColor?: string;
  cursorHeight?: string;
  enabled?: boolean;
  onComplete?: () => void;
  children?: React.ReactNode;
}

const StreamingText: React.FC<StreamingTextProps> = ({
  content,
  className = '',
  as: Component = 'span',
  typingSpeed = 30,
  startDelay = 0,
  showCursor = true,
  cursorColor = 'bg-[#FF3C42]',
  cursorHeight = 'h-4',
  enabled = true,
  onComplete,
  children
}) => {
  const { displayedText, isStreaming, cursorVisible } = useTextStreaming({
    content,
    typingSpeed,
    startDelay,
    enabled,
    onComplete
  });

  return (
    <Component className={className}>
      {displayedText}
      {showCursor && isStreaming && (
        <TypingCursor visible={cursorVisible} color={cursorColor} height={cursorHeight} />
      )}
      {!isStreaming && children}
    </Component>
  );
};

export default StreamingText;
