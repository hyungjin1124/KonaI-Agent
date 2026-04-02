'use client';

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AgentStatusSection } from './AgentStatusSection';
import { CostUsageSection } from './CostUsageSection';
import { ActivityReportSection } from './ActivityReportSection';
import { ModelSettingsModal } from './ModelSettingsModal';
import type { MonitoringPeriod } from '../types/admin.types';

// ── Component ─────────────────────────────────────────────────────────────────

export function MonitoringSection() {
  const [period, setPeriod] = useState<MonitoringPeriod>('최근 30일');
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">운영 현황</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            에이전트 실행 상태, 비용, 활동을 한눈에 확인합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as MonitoringPeriod)}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="최근 7일">최근 7일</SelectItem>
              <SelectItem value="최근 30일">최근 30일</SelectItem>
              <SelectItem value="최근 90일">최근 90일</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setIsModelSettingsOpen(true)}
          >
            <Settings className="h-3.5 w-3.5" />
            모델 설정
          </Button>
        </div>
      </div>

      {/* §1: Agent Status */}
      <AgentStatusSection />

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* §2: Cost & Usage */}
      <CostUsageSection />

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* §3: Activity Report */}
      <ActivityReportSection />

      {/* Model Settings Modal */}
      <ModelSettingsModal
        open={isModelSettingsOpen}
        onOpenChange={setIsModelSettingsOpen}
      />
    </div>
  );
}
