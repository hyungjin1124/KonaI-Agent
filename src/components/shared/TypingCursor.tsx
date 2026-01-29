import React from 'react';

interface TypingCursorProps {
  visible: boolean;
  color?: string;
  height?: string;
}

const TypingCursor: React.FC<TypingCursorProps> = ({
  visible,
  color = 'bg-[#FF3C42]',
  height = 'h-5'
}) => (
  <span
    className={`inline-block w-0.5 ${height} ${color} ml-0.5 ${visible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}
  />
);

export default TypingCursor;
