import React from 'react';
import type { Components } from 'react-markdown';
import { CodeBlock } from './CodeBlock';

/**
 * 공통 마크다운 커스텀 컴포넌트 정의
 * - chat_view, artifact_panel 등 모든 컨텍스트에서 사용
 * - compact 모드 여부에 따라 스타일 분기
 */

function createMarkdownComponents(compact: boolean): Components {
  return {
    // 제목
    h1: ({ children, ...props }) => (
      <h1
        className={`font-semibold text-gray-900 border-b border-gray-200 ${
          compact ? 'text-lg pb-2 mb-3' : 'text-2xl pb-3 mb-6'
        }`}
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2
        className={`font-semibold text-gray-900 ${
          compact ? 'text-base mt-4 mb-2' : 'text-xl mt-8 mb-4'
        }`}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        className={`font-semibold text-gray-900 ${
          compact ? 'text-sm mt-3 mb-1.5' : 'text-lg mt-6 mb-3'
        }`}
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4
        className={`font-semibold text-gray-900 ${
          compact ? 'text-sm mt-2 mb-1' : 'text-base mt-4 mb-2'
        }`}
        {...props}
      >
        {children}
      </h4>
    ),
    h5: ({ children, ...props }) => (
      <h5
        className={`text-sm font-semibold text-gray-900 ${
          compact ? 'mt-2 mb-1' : 'mt-3 mb-2'
        }`}
        {...props}
      >
        {children}
      </h5>
    ),
    h6: ({ children, ...props }) => (
      <h6
        className={`text-sm font-semibold text-gray-500 ${
          compact ? 'mt-2 mb-1' : 'mt-3 mb-2'
        }`}
        {...props}
      >
        {children}
      </h6>
    ),

    // 본문
    p: ({ children, ...props }) => (
      <p
        className={`text-gray-700 leading-relaxed ${
          compact ? 'mb-2 text-sm' : 'mb-4'
        }`}
        {...props}
      >
        {children}
      </p>
    ),

    // 강조
    strong: ({ children, ...props }) => (
      <strong className="font-semibold text-gray-900" {...props}>
        {children}
      </strong>
    ),

    // 코드 — 인라인 코드 vs 코드 블록 분기
    code: ({ children, className, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');

      // 코드 블록 (부모 pre 안에서 렌더링됨)
      if (match) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      // 인라인 코드
      return (
        <code
          className="text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded text-[0.85em] font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },

    // 코드 블록 래퍼 — CodeBlock 컴포넌트로 위임
    pre: ({ children, ...props }) => {
      // react-markdown은 code 요소를 커스텀 컴포넌트 함수로 대체하므로
      // type 비교 대신 props에서 className/children을 직접 추출
      const codeChild = React.Children.toArray(children).find(
        (child): child is React.ReactElement =>
          React.isValidElement(child) && !!child.props?.className
      );

      // className이 있는 code child → 언어 지정 코드 블록
      if (codeChild) {
        const className = codeChild.props.className || '';
        const match = /language-(\w+)/.exec(className);
        const language = match ? match[1] : undefined;

        return (
          <CodeBlock language={language} className={className}>
            {codeChild.props.children}
          </CodeBlock>
        );
      }

      // 언어 미지정 코드 블록 (```\ncode\n```)
      // children에서 code 요소를 찾아 CodeBlock으로 래핑
      const anyCodeChild = React.Children.toArray(children).find(
        (child): child is React.ReactElement =>
          React.isValidElement(child)
      );

      if (anyCodeChild) {
        return (
          <CodeBlock>
            {anyCodeChild.props.children}
          </CodeBlock>
        );
      }

      // 일반 pre 태그 폴백
      return (
        <pre
          className="bg-gray-50 text-gray-800 rounded-lg p-4 overflow-x-auto my-4 text-sm font-mono border border-gray-200"
          {...props}
        >
          {children}
        </pre>
      );
    },

    // 테이블
    table: ({ children, ...props }) => (
      <div className={`overflow-x-auto ${compact ? 'my-2' : 'my-4'}`}>
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
      <th
        className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700"
        {...props}
      >
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
      <ul
        className={`list-disc pl-6 space-y-1 ${compact ? 'my-2' : 'my-4'}`}
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        className={`list-decimal pl-6 space-y-1 ${compact ? 'my-2' : 'my-4'}`}
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className={`text-gray-700 ${compact ? 'text-sm' : ''}`} {...props}>
        {children}
      </li>
    ),

    // 인용문
    blockquote: ({ children, ...props }) => (
      <blockquote
        className={`border-l-4 border-gray-300 bg-gray-50 pl-4 py-2 italic text-gray-600 ${
          compact ? 'my-2' : 'my-4'
        }`}
        {...props}
      >
        {children}
      </blockquote>
    ),

    // 구분선
    hr: (props) => (
      <hr className={`border-gray-200 ${compact ? 'my-4' : 'my-8'}`} {...props} />
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

    // 이미지
    img: ({ src, alt, ...props }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || ''}
        className="max-w-full h-auto rounded-lg my-4"
        loading="lazy"
        {...props}
      />
    ),

    // 태스크 리스트 input (GFM)
    input: ({ checked, ...props }) => (
      <input
        type="checkbox"
        checked={checked}
        readOnly
        className="mr-2 rounded border-gray-300 text-blue-600 pointer-events-none"
        {...props}
      />
    ),

    // 취소선 (GFM)
    del: ({ children, ...props }) => (
      <del className="text-gray-400 line-through" {...props}>
        {children}
      </del>
    ),
  };
}

// 캐시된 컴포넌트 맵 (매 렌더마다 새 객체 생성 방지)
const normalComponents = createMarkdownComponents(false);
const compactComponents = createMarkdownComponents(true);

export function getMarkdownComponents(compact: boolean): Components {
  return compact ? compactComponents : normalComponents;
}

// 기본 export (비compact 모드) — MarkdownPreviewPanel 호환
export const markdownComponents = normalComponents;
