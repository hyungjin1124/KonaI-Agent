'use client';

import React, { useState, useCallback } from 'react';
import { Settings, AlertTriangle, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MODEL_CONFIGS } from '../data/monitoringMockData';
import type { ModelConfig } from '../types/admin.types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ModelSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function apiKeyBadge(status: ModelConfig['apiKeyStatus'], daysToExpiry?: number) {
  switch (status) {
    case '정상':
      return (
        <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5">
          정상 {daysToExpiry != null && <span className="text-emerald-500 ml-1">({daysToExpiry}일)</span>}
        </Badge>
      );
    case '만료 임박':
      return (
        <Badge variant="outline" className="text-[11px] bg-amber-50 text-amber-700 border-amber-200 px-2 py-0.5">
          <AlertTriangle className="h-3 w-3 mr-0.5" />
          만료 임박 {daysToExpiry != null && <span className="text-amber-500 ml-1">({daysToExpiry}일)</span>}
        </Badge>
      );
    case '만료':
      return (
        <Badge variant="outline" className="text-[11px] bg-red-50 text-red-700 border-red-200 px-2 py-0.5">
          만료
        </Badge>
      );
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ModelSettingsModal({ open, onOpenChange }: ModelSettingsModalProps) {
  const [models, setModels] = useState<ModelConfig[]>(MODEL_CONFIGS);

  const activeCount = models.filter((m) => m.isActive).length;

  const toggleActive = useCallback((id: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m)),
    );
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-500" />
            모델 설정
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            AI 모델의 활성 상태와 API 키를 관리합니다.
          </DialogDescription>
        </DialogHeader>

        {/* Warning if no active models */}
        {activeCount === 0 && (
          <div className="mx-5 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="text-xs text-red-700 font-medium">
              활성 모델이 없습니다. 최소 1개 이상의 모델을 활성화하세요.
            </span>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-y-auto border-y border-gray-100 px-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">프로바이더</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">모델</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">API 키 상태</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-[60px] text-center">활성</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow
                  key={model.id}
                  className={[
                    'transition-colors',
                    model.apiKeyStatus === '만료 임박' ? 'bg-amber-50/30' : '',
                    model.apiKeyStatus === '만료' ? 'bg-red-50/30' : '',
                  ].join(' ')}
                >
                  <TableCell className="text-sm text-gray-600">{model.provider}</TableCell>
                  <TableCell className="text-sm font-medium text-gray-900">{model.modelName}</TableCell>
                  <TableCell>{apiKeyBadge(model.apiKeyStatus, model.daysToExpiry)}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={model.isActive}
                      onCheckedChange={() => toggleActive(model.id)}
                      className="data-[state=checked]:bg-[#FF3C42]"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            모델 추가
          </Button>
          <div className="text-xs text-gray-400">
            활성 모델: {activeCount}/{models.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
