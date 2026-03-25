/**
 * AIQualitySummaryTab — Admin's AI Quality tab
 *
 * Renders FeedbackSummaryView directly (no sub-tabs).
 * Prompt management is only available in PlatformAdmin.
 */

'use client';

import React from 'react';
import { FeedbackSummaryView } from '../feedback-quality/FeedbackSummaryView';

export function AIQualitySummaryTab() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">AI 피드백 현황</h3>
        <p className="text-sm text-gray-500 mt-0.5">AI 에이전트 응답 품질에 대한 피드백 현황을 확인합니다.</p>
      </div>

      <FeedbackSummaryView />
    </div>
  );
}
