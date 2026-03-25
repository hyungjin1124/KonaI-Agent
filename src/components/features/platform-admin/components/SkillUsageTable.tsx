import React from 'react';
import { Badge } from '../../../ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../ui/table';
import type { SkillUsageStat } from '../data/platformAdminTypes';

interface SkillUsageTableProps {
  data: SkillUsageStat[];
}

const SkillUsageTable: React.FC<SkillUsageTableProps> = ({ data }) => {
  const successBadge = (rate: number) => {
    const cls = rate >= 95
      ? 'bg-green-100 text-green-700 border-green-200'
      : rate >= 85
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-red-100 text-red-700 border-red-200';
    return <Badge variant="outline" className={`rounded-full text-xs ${cls}`}>{rate}%</Badge>;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">스킬별 사용 빈도</span>
        <span className="text-[11px] text-gray-400">이번 달 누계</span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-xs">스킬명</TableHead>
            <TableHead className="text-xs">카테고리</TableHead>
            <TableHead className="text-xs text-right">호출 수</TableHead>
            <TableHead className="text-xs text-right">평균 레이턴시</TableHead>
            <TableHead className="text-xs text-right">성공률</TableHead>
            <TableHead className="text-xs text-right">평균 비용</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((skill, idx) => (
            <TableRow key={skill.skillId} className={idx % 2 === 0 ? '' : 'bg-gray-50/30'}>
              <TableCell className="text-sm font-medium text-gray-900">{skill.skillName}</TableCell>
              <TableCell>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  {skill.category}
                </span>
              </TableCell>
              <TableCell className="text-sm text-right text-gray-900">
                {skill.callCount.toLocaleString()}
              </TableCell>
              <TableCell className="text-sm text-right text-gray-700">
                {skill.avgLatencyMs}ms
              </TableCell>
              <TableCell className="text-right">
                {successBadge(skill.successRate)}
              </TableCell>
              <TableCell className="text-sm text-right text-gray-700">
                ${skill.avgCost.toFixed(3)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SkillUsageTable;
