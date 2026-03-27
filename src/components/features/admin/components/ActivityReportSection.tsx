'use client';

import React, { useState } from 'react';
import { ChevronRight, Users, Cpu, BarChart3, RefreshCw, FileText, Zap } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { KPICard } from '@/components/shared/atoms/KPICard';
import {
  ADOPTION_KPI,
  ACTIVE_USER_TREND,
  USER_ACTIVITIES,
  SKILL_KPI,
  SKILL_USAGE_RECORDS,
  SERVICE_METRICS,
  ARTIFACT_DISTRIBUTION,
} from '../data/activityReportData';
import type { ActivityLevel } from '../types/admin.types';

// ── Helpers ───────────────────────────────────────────────────────────────────

const LEVEL_STYLES: Record<ActivityLevel, string> = {
  '활발': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '보통': 'bg-amber-50 text-amber-700 border-amber-200',
  '미사용': 'bg-gray-100 text-gray-500 border-gray-200',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ActivityReportSection() {
  const [adoptionOpen, setAdoptionOpen] = useState(true);
  const [skillOpen, setSkillOpen] = useState(true);
  const [serviceOpen, setServiceOpen] = useState(true);

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-bold text-gray-900">활동 리포트</h3>

      {/* ── Group A: 도입 현황 ──────────────────────────────────────────── */}
      <Collapsible open={adoptionOpen} onOpenChange={setAdoptionOpen}>
        <CollapsibleTrigger className="w-full flex items-center gap-1.5 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors">
          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${adoptionOpen ? 'rotate-90' : ''}`} />
          <Users className="h-3.5 w-3.5" />
          도입 현황
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-1">
          {/* KPI */}
          <div className="grid grid-cols-2 gap-3">
            <KPICard
              title="활성 사용자"
              value={ADOPTION_KPI.activeUsers.value}
              subtitle={ADOPTION_KPI.activeUsers.subtitle}
              icon={<Users size={14} />}
            />
            <KPICard
              title="주간 활성일 평균"
              value={ADOPTION_KPI.avgWeeklyActiveDays.value}
              subtitle={ADOPTION_KPI.avgWeeklyActiveDays.subtitle}
              icon={<BarChart3 size={14} />}
            />
          </div>

          {/* Active user trend chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">활성 사용자 추이</h4>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ACTIVE_USER_TREND} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 'dataMax + 5']}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="활성 사용자"
                    stroke="#FF3C42"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 2 }}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User activity table */}
          <div className="rounded-md border border-gray-200 overflow-hidden max-h-[280px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 sticky top-0">
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">사용자</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">팀</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">최근 활동일</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">이번 주 대화</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider w-[70px]">상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {USER_ACTIVITIES.map((ua) => (
                  <TableRow key={ua.userName} className="hover:bg-gray-50/60 transition-colors">
                    <TableCell className="text-sm font-medium text-gray-700">{ua.userName}</TableCell>
                    <TableCell className="text-xs text-gray-500">{ua.team}</TableCell>
                    <TableCell className="text-xs text-gray-500 tabular-nums">{ua.lastActivityDate}</TableCell>
                    <TableCell className="text-xs text-gray-700 tabular-nums text-right font-medium">
                      {ua.weeklyConversations}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0.5 ${LEVEL_STYLES[ua.activityLevel]}`}
                      >
                        {ua.activityLevel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ── Group B: 스킬 활용 ──────────────────────────────────────────── */}
      <Collapsible open={skillOpen} onOpenChange={setSkillOpen}>
        <CollapsibleTrigger className="w-full flex items-center gap-1.5 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors">
          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${skillOpen ? 'rotate-90' : ''}`} />
          <Cpu className="h-3.5 w-3.5" />
          스킬 활용
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-1">
          {/* KPI */}
          <div className="grid grid-cols-2 gap-3">
            <KPICard
              title="스킬 생성/수정"
              value={SKILL_KPI.skillCount.value}
              subtitle={SKILL_KPI.skillCount.subtitle}
              icon={<Cpu size={14} />}
            />
            <KPICard
              title="스킬 생성 사용자"
              value={SKILL_KPI.creatorCount.value}
              subtitle={SKILL_KPI.creatorCount.subtitle}
              icon={<Users size={14} />}
            />
          </div>

          {/* Skill usage table */}
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">스킬 이름</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">사용 횟수</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">사용자 수</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">작성자</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">팀</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SKILL_USAGE_RECORDS.map((sr) => (
                  <TableRow key={sr.skillName} className="hover:bg-gray-50/60 transition-colors">
                    <TableCell className="text-sm font-medium text-gray-700">{sr.skillName}</TableCell>
                    <TableCell className="text-xs text-gray-700 tabular-nums text-right font-medium">{sr.callCount}</TableCell>
                    <TableCell className="text-xs text-gray-700 tabular-nums text-right">{sr.userCount}</TableCell>
                    <TableCell className="text-xs text-gray-500">{sr.author}</TableCell>
                    <TableCell className="text-xs text-gray-500">{sr.authorTeam}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ── Group C: 서비스 성과 ─────────────────────────────────────────── */}
      <Collapsible open={serviceOpen} onOpenChange={setServiceOpen}>
        <CollapsibleTrigger className="w-full flex items-center gap-1.5 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider hover:text-gray-900 transition-colors">
          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${serviceOpen ? 'rotate-90' : ''}`} />
          <BarChart3 className="h-3.5 w-3.5" />
          서비스 성과
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-1">
          {/* KPI */}
          <div className="grid grid-cols-3 gap-3">
            <KPICard
              title="재방문율"
              value={SERVICE_METRICS.returnRate.value}
              icon={<RefreshCw size={14} />}
            />
            <KPICard
              title="산출물 생성 수"
              value={SERVICE_METRICS.artifactCount.value}
              icon={<FileText size={14} />}
            />
            <KPICard
              title="스킬 실행 수"
              value={SERVICE_METRICS.skillExecutions.value}
              icon={<Zap size={14} />}
            />
          </div>

          {/* Artifact distribution bar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">산출물 유형별 분포</h4>
            <div className="space-y-2.5">
              {ARTIFACT_DISTRIBUTION.map((item) => (
                <div key={item.type} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-[80px] truncate shrink-0">{item.type}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-[30px] text-right tabular-nums">{item.percentage}%</span>
                  <span className="text-xs text-gray-500 w-[40px] text-right tabular-nums">{item.count}건</span>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
