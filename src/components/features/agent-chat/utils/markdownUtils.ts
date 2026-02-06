// Mock 수정된 마크다운 생성 함수: 원본 보존 + 테이블 컬럼 삽입
export function generateMockModifiedMarkdown(originalContent: string, userRequest: string): string {
  if (!originalContent) return originalContent;

  // Q3 비교 컬럼 추가 요청인지 판별
  const isQ3ColumnRequest = /3분기|Q3|비교\s*컬럼/.test(userRequest);
  if (!isQ3ColumnRequest) return originalContent;

  // Q3 Mock 데이터: 실적 + QoQ 증감
  const q3Data: Record<string, { value: string; change: string }> = {
    '매출액':     { value: '1,198억원', change: '+5.0%' },
    '영업이익':   { value: '156억원',   change: '+21.2%' },
    '영업이익률': { value: '13.0%',     change: '+2.0%p' },
    '순이익':     { value: '117억원',   change: '+23.1%' },
    '당기순이익': { value: '117억원',   change: '+23.1%' },
  };

  const isTableRow = (line: string) => {
    const trimmed = line.trim();
    return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|');
  };
  const isSeparatorRow = (line: string) =>
    /^\|[\s\-:|]+(\|[\s\-:|]+)+\|$/.test(line.trim());

  const lines = originalContent.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;
  let inTargetSection = false;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // 코드블록 내부 스킵
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      i++;
      continue;
    }
    if (inCodeBlock) {
      result.push(line);
      i++;
      continue;
    }

    // 섹션 감지: "### 주요 성과 KPI" 진입/이탈
    if (/^###\s+주요 성과 KPI/.test(line.trim())) {
      inTargetSection = true;
      result.push(line);
      i++;
      continue;
    }
    if (inTargetSection && (/^#{1,3}\s/.test(line.trim()) || line.trim() === '---')) {
      inTargetSection = false;
    }

    // GFM 테이블 감지: inTargetSection일 때만 Q3 컬럼 삽입
    if (inTargetSection && isTableRow(line) && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      // 헤더행에 Q3 실적 + QoQ 증감 2컬럼 추가
      result.push(line.replace(/\|(\s*)$/, '| Q3 실적 | QoQ 증감 |'));
      i++;
      // 구분행에 2컬럼 추가
      result.push(lines[i].replace(/\|(\s*)$/, '|-----------|----------|'));
      i++;
      // 데이터행 처리
      while (i < lines.length && isTableRow(lines[i]) && !isSeparatorRow(lines[i])) {
        const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
        const metricName = (cells[0] || '').replace(/\*\*/g, '');
        const entry = q3Data[metricName];
        result.push(lines[i].replace(/\|(\s*)$/, `| ${entry?.value ?? '-'} | ${entry?.change ?? '-'} |`));
        i++;
      }
      continue;
    }

    result.push(line);
    i++;
  }

  return result.join('\n');
}
