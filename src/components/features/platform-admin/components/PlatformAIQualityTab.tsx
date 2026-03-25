/**
 * PlatformAIQualityTab — Platform Admin's AI Quality Management tab
 *
 * Full CRUD for system/safety prompts (mode="admin") + full feedback quality management.
 */

'use client';

import React, { useState } from 'react';
import { Sparkles, MessageSquare } from '../../../icons';
import { PromptManagementView } from '../../prompt-management';
import { FeedbackQualityView } from '../../feedback-quality';

type SubTab = 'prompts' | 'feedback';

function PlatformAIQualityTab() {
  const [subTab, setSubTab] = useState<SubTab>('prompts');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI 품질 관리</h3>
          <p className="text-sm text-gray-500 mt-0.5">시스템 프롬프트와 피드백 품질을 관리합니다.</p>
        </div>
      </div>

      {/* Sub-tab toggle */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit" role="tablist" aria-label="AI 품질 관리 하위 탭">
        <button
          role="tab"
          aria-selected={subTab === 'prompts'}
          onClick={() => setSubTab('prompts')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-md transition-colors ${
            subTab === 'prompts'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles size={14} aria-hidden="true" /> 프롬프트 관리
        </button>
        <button
          role="tab"
          aria-selected={subTab === 'feedback'}
          onClick={() => setSubTab('feedback')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-md transition-colors ${
            subTab === 'feedback'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare size={14} aria-hidden="true" /> 피드백 관리
        </button>
      </div>

      {/* Content */}
      <div role="tabpanel">
        {subTab === 'prompts' ? (
          <PromptManagementView mode="admin" />
        ) : (
          <FeedbackQualityView />
        )}
      </div>
    </div>
  );
}

export default PlatformAIQualityTab;
