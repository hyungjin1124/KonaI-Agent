'use client';

import React, { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className,
  language,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text =
      typeof children === 'string'
        ? children
        : extractText(children);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API may not be available
    }
  }, [children]);

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-gray-200">
      {/* Header bar with language label and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <span className="text-xs font-medium text-gray-500 select-none">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={copied ? '복사됨' : '코드 복사'}
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-500" />
              <span className="text-green-500">복사됨</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>복사</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre
        className={`${className || ''} bg-gray-50 text-gray-800 p-4 overflow-x-auto text-sm font-mono leading-relaxed m-0 rounded-none`}
      >
        <code className="block">{children}</code>
      </pre>
    </div>
  );
};

/** Recursively extract text from React children */
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'props' in node) {
    return extractText((node as React.ReactElement).props.children);
  }
  return '';
}

export default CodeBlock;
