import { useMemo } from 'react';
import type { GenerativeUISpec, GenerativeUIUpdateSpec } from './types';
import { extractGenerativeUIFromMessage } from './parseGenerativeUI';

interface UseInlineGenerativeUIOptions {
  messageContent: string;
  messageId: string;
  /** 다른 메시지에서 온 동적 업데이트 목록 */
  updates?: GenerativeUIUpdateSpec[];
}

interface UseInlineGenerativeUIResult {
  /** 파싱된 spec (null이면 인라인 시각화 없음) */
  spec: GenerativeUISpec | null;
  /** 파싱 에러 메시지 (코드펜스는 있으나 파싱 실패) */
  error: string | null;
  /** 코드펜스 존재 여부 */
  hasCodeFence: boolean;
  /** 코드펜스를 제거한 텍스트 콘텐츠 */
  textContent: string;
}

const FENCE_PATTERN = /```generative-ui\s*\n[\s\S]*?```/g;

/**
 * 에이전트 메시지에서 generative-ui 코드펜스를 추출하고,
 * 동적 업데이트를 적용한 최종 spec을 반환하는 Hook.
 *
 * - 코드펜스가 없으면 spec=null (인라인 시각화 미표시)
 * - 코드펜스 파싱 실패 시 error 반환
 * - updates에 targetMessageId가 일치하는 업데이트가 있으면 spec에 머지
 */
export function useInlineGenerativeUI({
  messageContent,
  messageId,
  updates,
}: UseInlineGenerativeUIOptions): UseInlineGenerativeUIResult {
  return useMemo(() => {
    const hasCodeFence = FENCE_PATTERN.test(messageContent);
    // Reset lastIndex after test()
    FENCE_PATTERN.lastIndex = 0;

    const textContent = messageContent.replace(FENCE_PATTERN, '').trim();

    if (!hasCodeFence) {
      return { spec: null, error: null, hasCodeFence: false, textContent };
    }

    const result = extractGenerativeUIFromMessage(messageContent);

    if (!result) {
      return { spec: null, error: null, hasCodeFence: false, textContent };
    }

    if (!result.success) {
      return { spec: null, error: result.error, hasCodeFence: true, textContent };
    }

    let spec = result.spec;

    // 동적 업데이트 적용 (targetMessageId 일치하는 가장 최근 업데이트)
    if (updates && updates.length > 0) {
      const relevantUpdates = updates.filter((u) => u.targetMessageId === messageId);
      for (const update of relevantUpdates) {
        spec = {
          ...spec,
          ...update.update,
          // data는 deep merge 대신 전체 교체 (접근 1: 전체 교체)
          data: update.update.data ?? spec.data,
        };
      }
    }

    return { spec, error: null, hasCodeFence: true, textContent };
  }, [messageContent, messageId, updates]);
}
