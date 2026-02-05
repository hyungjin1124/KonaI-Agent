import React from 'react';
import type { Components } from 'react-markdown';

/**
 * ReactMarkdown용 커스텀 컴포넌트 정의
 * - Tailwind CDN 환경에서 prose 클래스 대신 직접 스타일 적용
 * - 참조 이미지 기준 깔끔한 타이포그래피 구현
 */
export const markdownComponents: Components = {
  // 제목
  h1: ({ children, ...props }) => (
    <h1 className="text-2xl font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-6" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-base font-semibold text-gray-900 mt-4 mb-2" {...props}>
      {children}
    </h4>
  ),

  // 본문
  p: ({ children, ...props }) => (
    <p className="text-gray-700 leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),

  // 강조
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-gray-900" {...props}>
      {children}
    </strong>
  ),

  // 인라인 코드 및 코드 블록
  code: ({ children, className, ...props }) => {
    // 코드 블록인지 확인 (language- 클래스가 있으면 코드 블록)
    const isCodeBlock = className?.includes('language-');

    if (isCodeBlock) {
      return (
        <code className={`${className || ''} block text-sm`} {...props}>
          {children}
        </code>
      );
    }

    // 인라인 코드
    return (
      <code className="text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },

  // 코드 블록 래퍼
  pre: ({ children, ...props }) => (
    <pre className="bg-gray-100 text-gray-800 rounded-lg p-4 overflow-x-auto my-4 text-sm font-mono" {...props}>
      {children}
    </pre>
  ),

  // 테이블
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-100" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-gray-200 px-4 py-2 text-gray-600" {...props}>
      {children}
    </td>
  ),
  tr: ({ children, ...props }) => (
    <tr className="even:bg-gray-50" {...props}>
      {children}
    </tr>
  ),

  // 리스트
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-6 my-4 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-6 my-4 space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-gray-700" {...props}>
      {children}
    </li>
  ),

  // 인용문
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-gray-300 bg-gray-50 pl-4 py-2 my-4 italic text-gray-600" {...props}>
      {children}
    </blockquote>
  ),

  // 구분선
  hr: (props) => (
    <hr className="border-gray-200 my-8" {...props} />
  ),

  // 링크
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-blue-600 hover:text-blue-800 underline underline-offset-2"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
};
