import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface FullscreenPortalProps {
  children: React.ReactNode;
  onExit: () => void;
}

export function FullscreenPortal({ children, onExit }: FullscreenPortalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onExit();
      }
    },
    [onExit]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-white flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="풀스크린 문서 뷰어"
    >
      {children}
    </div>,
    document.body
  );
}
