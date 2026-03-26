'use client';

import React from 'react';
import { ChevronRight, FileText, BarChart2, Image, File, Presentation, FileDown, Table2 } from 'lucide-react';
import { ArtifactType } from '../../types';

interface ArtifactBreadcrumbProps {
  type: ArtifactType;
  title: string;
  versionCount?: number;
  currentVersion?: number;
}

function getTypeIcon(type: ArtifactType) {
  const iconClass = 'w-3.5 h-3.5';
  switch (type) {
    case 'ppt': case 'pptx': return <Presentation className={`${iconClass} text-orange-500`} />;
    case 'chart': return <BarChart2 className={`${iconClass} text-blue-500`} />;
    case 'pdf': return <FileDown className={`${iconClass} text-red-500`} />;
    case 'docx': return <FileText className={`${iconClass} text-blue-600`} />;
    case 'document': case 'markdown': return <FileText className={`${iconClass} text-purple-500`} />;
    case 'image': return <Image className={`${iconClass} text-green-500`} />;
    case 'xlsx': case 'csv': return <Table2 className={`${iconClass} text-green-600`} />;
    default: return <File className={`${iconClass} text-gray-400`} />;
  }
}

function getTypeLabel(type: ArtifactType): string {
  const map: Record<string, string> = {
    document: '문서', markdown: '마크다운', ppt: 'PPT', chart: '차트',
    image: '이미지', pdf: 'PDF', docx: 'Word', xlsx: 'Excel',
    csv: 'CSV', pptx: 'PPTX', 'slide-outline': '슬라이드',
  };
  return map[type] || type;
}

export const ArtifactBreadcrumb: React.FC<ArtifactBreadcrumbProps> = ({
  type,
  title,
  versionCount,
  currentVersion,
}) => {
  return (
    <nav className="flex items-center gap-1 text-xs text-gray-500" aria-label="아티팩트 경로">
      {getTypeIcon(type)}
      <span className="text-gray-600">{getTypeLabel(type)}</span>
      <ChevronRight className="w-3 h-3 text-gray-400" />
      <span className="text-gray-900 font-medium truncate max-w-[120px]" title={title}>
        {title}
      </span>
      {versionCount && versionCount > 1 && currentVersion && (
        <>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-500">v{currentVersion}</span>
        </>
      )}
    </nav>
  );
};

export default React.memo(ArtifactBreadcrumb);
