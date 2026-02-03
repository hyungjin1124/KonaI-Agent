import React from 'react';
import type { ToolCallStatusIndicatorProps } from './types';

/**
 * 도구 호출 상태 표시기 (미사용 - 텍스트 기호 제거됨)
 * 하위 호환성을 위해 빈 fragment 반환
 */
const ToolCallStatusIndicator: React.FC<ToolCallStatusIndicatorProps> = () => {
  return null;
};

export default React.memo(ToolCallStatusIndicator);
