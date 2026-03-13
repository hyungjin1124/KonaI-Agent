import React from 'react';
import { GenerativeUIRenderer } from '../../../../generative-ui';
import type { GenerativeUISpec } from '../../../../generative-ui';

export interface GenerativeUIRendererAdapterProps {
  spec?: GenerativeUISpec;
  onClose: () => void;
}

export const GenerativeUIRendererAdapter: React.FC<GenerativeUIRendererAdapterProps> = ({
  spec,
}) => {
  if (!spec) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>생성형 UI를 불러오는 중...</p>
      </div>
    );
  }

  return <GenerativeUIRenderer spec={spec} />;
};
