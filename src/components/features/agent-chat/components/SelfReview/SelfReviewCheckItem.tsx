import React from 'react';
import {
  Circle,
  Loader2,
  Check,
  AlertTriangle,
  X,
  FileText,
  Code,
  Image,
  Database,
} from 'lucide-react';
import type { SelfReviewCheckItemProps, ReviewItemStatus, ReviewEvidence } from './types';

/** 상태별 아이콘 */
function StatusIcon({ status, size = 14 }: { status: ReviewItemStatus; size?: number }) {
  switch (status) {
    case 'checking':
      return <Loader2 size={size} className="text-blue-500 animate-spin flex-shrink-0" aria-label="확인 중" />;
    case 'pass':
      return <Check size={size} className="text-green-500 flex-shrink-0" aria-label="통과" />;
    case 'warning':
      return <AlertTriangle size={size} className="text-amber-500 flex-shrink-0" aria-label="경고" />;
    case 'fail':
      return <X size={size} className="text-red-500 flex-shrink-0" aria-label="실패" />;
    case 'pending':
    default:
      return <Circle size={size} className="text-gray-300 flex-shrink-0" aria-label="대기" />;
  }
}

/** 증거 타입별 아이콘 */
function EvidenceIcon({ type }: { type: ReviewEvidence['type'] }) {
  const iconClass = 'text-gray-400 flex-shrink-0';
  switch (type) {
    case 'log':
      return <FileText size={12} className={iconClass} />;
    case 'diff':
      return <Code size={12} className={iconClass} />;
    case 'screenshot':
      return <Image size={12} className={iconClass} />;
    case 'data':
      return <Database size={12} className={iconClass} />;
  }
}

/** 상태별 텍스트 색상 */
function getStatusTextClass(status: ReviewItemStatus): string {
  switch (status) {
    case 'pass':
      return 'text-gray-700';
    case 'warning':
      return 'text-amber-700';
    case 'fail':
      return 'text-red-700';
    case 'checking':
      return 'text-blue-700';
    default:
      return 'text-gray-400';
  }
}

const SelfReviewCheckItem: React.FC<SelfReviewCheckItemProps> = ({ item, isActive }) => {
  return (
    <div
      className={`flex flex-col gap-1 py-1.5 ${
        isActive ? 'bg-blue-50/50 -mx-2 px-2 rounded' : ''
      }`}
    >
      {/* 메인 행: 아이콘 + 라벨 */}
      <div className="flex items-center gap-2">
        <StatusIcon status={item.status} />
        <span className={`text-xs font-medium leading-tight ${getStatusTextClass(item.status)}`}>
          {item.label}
        </span>
      </div>

      {/* 설명 (pass/warning/fail 상태에서만 표시) */}
      {item.description && item.status !== 'pending' && item.status !== 'checking' && (
        <p className="text-[11px] text-gray-500 ml-[22px] leading-snug">
          {item.description}
        </p>
      )}

      {/* 증거 링크 (있을 때만 표시) */}
      {item.evidence && item.status !== 'pending' && item.status !== 'checking' && (
        <div className="flex items-center gap-1.5 ml-[22px]">
          <EvidenceIcon type={item.evidence.type} />
          <span className="text-[11px] text-gray-400 underline decoration-dotted cursor-default">
            {item.evidence.label}
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(SelfReviewCheckItem);
