import React from 'react';
import { FileText, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SkillDraftPreviewProps {
  title: string;
  description: string;
  triggerCondition: string;
  outputFormat: string;
  tags: string[];
}

const SkillDraftPreview: React.FC<SkillDraftPreviewProps> = ({
  title,
  description,
  triggerCondition,
  outputFormat,
  tags,
}) => {
  const [copied, setCopied] = React.useState(false);

  const draftContent = `---
title: "${title || '새 스킬'}"
description: "${description || ''}"
trigger: "${triggerCondition || ''}"
output_format: "${outputFormat || ''}"
tags: [${tags.map((t) => `"${t}"`).join(', ')}]
---

# ${title || '새 스킬'}

## 설명
${description || '(설명을 입력하세요)'}

## 트리거 조건
${triggerCondition || '(인터뷰에서 정의됩니다)'}

## 출력 형식
${outputFormat || '(인터뷰에서 정의됩니다)'}
`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draftContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasContent = title || description || triggerCondition || outputFormat;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-500">SKILL.md 프리뷰</span>
        </div>
        {hasContent && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs gap-1"
            onClick={handleCopy}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? '복사됨' : '복사'}
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {hasContent ? (
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
            {draftContent}
          </pre>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs text-gray-400 text-center">
              인터뷰를 진행하면 여기에<br />SKILL.md 초안이 표시됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillDraftPreview;
