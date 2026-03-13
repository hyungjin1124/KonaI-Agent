import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { InlineGenerativeUIProps, GenerativeUIUpdateSpec } from './types';
import { GenerativeUIRenderer } from './GenerativeUIRenderer';
import { GenerativeUIFallback } from './GenerativeUIFallback';
import { useInlineGenerativeUI } from './useInlineGenerativeUI';

interface InlineGenerativeUIInternalProps extends InlineGenerativeUIProps {
  /** 동적 업데이트 목록 (다른 메시지에서 전달) */
  updates?: GenerativeUIUpdateSpec[];
}

/**
 * 메시지 버블 내 인라인 Ephemeral 시각화 컴포넌트.
 *
 * 에이전트 메시지에 generative-ui 코드펜스가 포함되어 있으면
 * 대화 흐름 내에서 직접 인터랙티브 차트/테이블/KPI를 렌더링한다.
 * Claude Inline Visuals 패턴의 "화이트보드 스케치" 메타포를 따른다.
 *
 * - Ephemeral: 메시지 턴에 종속, 별도 저장 전까지 임시
 * - "Artifact로 저장" 버튼으로 Persistent 전환 가능
 * - 동적 업데이트: updates prop으로 후속 메시지의 수정 반영
 */
export const InlineGenerativeUI: React.FC<InlineGenerativeUIInternalProps> = ({
  messageContent,
  messageId,
  onSaveToArtifact,
  className = '',
  updates,
}) => {
  const { spec, error, hasCodeFence } = useInlineGenerativeUI({
    messageContent,
    messageId,
    updates,
  });

  // 코드펜스 없으면 렌더링 안 함
  if (!hasCodeFence) return null;

  // 파싱 에러
  if (error) {
    return (
      <div
        className={`mt-3 rounded-xl overflow-hidden border border-gray-200 ${className}`}
        data-testid="inline-generative-ui-error"
      >
        <GenerativeUIFallback error={error} />
      </div>
    );
  }

  // spec 없으면 렌더링 안 함
  if (!spec) return null;

  return (
    <div
      className={`mt-3 rounded-xl overflow-hidden border border-gray-200 bg-white ${className}`}
      data-testid="inline-generative-ui"
    >
      {/* 시각화 영역 — compact 모드, 최대 높이 제한 */}
      <div className="max-h-80 overflow-hidden">
        <div className="h-80">
          <GenerativeUIRenderer
            spec={spec}
            compact
          />
        </div>
      </div>

      {/* 하단 액션 바 */}
      {onSaveToArtifact && (
        <div className="flex items-center justify-end px-3 py-1.5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => onSaveToArtifact(spec)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Artifact로 저장"
            data-testid="save-to-artifact-button"
          >
            <ExternalLink size={12} />
            Artifact로 저장
          </button>
        </div>
      )}
    </div>
  );
};
