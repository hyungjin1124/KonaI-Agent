import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { CreditCard } from '../../../icons';
import { KPICard } from '../../../shared/atoms/KPICard';
import { ChartWidget } from '../../../shared/molecules/ChartWidget';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { ConfirmDialog } from '../../../ui/confirm-dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../ui/table';
import {
  BILLING_SUMMARY, MOCK_BILLING_ROWS, MONTHLY_REVENUE, PLAN_DISTRIBUTION, MONTH_OPTIONS,
} from '../data/billingData';

const paymentBadge = (status: string) => {
  const style = status === 'paid'
    ? 'bg-green-100 text-green-700 border-green-200'
    : status === 'trial'
    ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-red-100 text-red-700 border-red-200';
  const label = status === 'paid' ? '완료' : status === 'trial' ? '체험판' : '미결제';
  return <Badge variant="outline" className={`rounded-full text-xs font-medium ${style}`}>{label}</Badge>;
};

interface BillingTabProps {
  onTenantClick?: (tenantName: string) => void;
}

const BillingTab: React.FC<BillingTabProps> = ({ onTenantClick }) => {
  const [batchConfirmOpen, setBatchConfirmOpen] = useState(false);
  const [batchToast, setBatchToast] = useState('');

  return (
    <div>
      {/* Data freshness */}
      <div className="flex justify-end mb-2">
        <span className="text-[11px] text-gray-400">마지막 업데이트: {new Date().toLocaleString('ko-KR')}</span>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard title="이번 달 총 매출" value={BILLING_SUMMARY.monthlyRevenue.value} change={BILLING_SUMMARY.monthlyRevenue.change} trend="up" icon={<CreditCard size={14} />} />
        <KPICard title="미수금" value={BILLING_SUMMARY.outstanding.value} />
        <KPICard title="결제 완료" value={BILLING_SUMMARY.paidCount.value} />
        <KPICard title="미결제" value={BILLING_SUMMARY.unpaidCount.value} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <select aria-label="청구 월 선택" className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700">
          {MONTH_OPTIONS.map(m => <option key={m}>{m}</option>)}
        </select>
        <Button size="sm" className="h-8 text-xs bg-[#534AB7] hover:bg-[#4339a0]" onClick={() => setBatchConfirmOpen(true)}>청구서 일괄 발행</Button>
      </div>

      {/* Billing table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/30">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">테넌트별 과금 현황</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs">테넌트</TableHead>
              <TableHead className="text-xs">요금제</TableHead>
              <TableHead className="text-xs">기본료</TableHead>
              <TableHead className="text-xs">초과 사용</TableHead>
              <TableHead className="text-xs">합계</TableHead>
              <TableHead className="text-xs">결제 상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_BILLING_ROWS.map(row => (
              <TableRow key={row.tenantId}>
                <TableCell className="text-sm font-medium">
                  {onTenantClick ? (
                    <button
                      onClick={() => onTenantClick(row.tenantName)}
                      className="text-[#534AB7] hover:text-[#4339a0] underline underline-offset-2 decoration-[#534AB7]/30 hover:decoration-[#534AB7] transition-colors"
                    >
                      {row.tenantName}
                    </button>
                  ) : (
                    row.tenantName
                  )}
                </TableCell>
                <TableCell className="text-sm">{row.plan}</TableCell>
                <TableCell className="text-sm">{row.baseFee}</TableCell>
                <TableCell className="text-sm">{row.overage}</TableCell>
                <TableCell className="text-sm font-medium">{row.total}</TableCell>
                <TableCell>{paymentBadge(row.paymentStatus)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartWidget title="월별 매출 추이" height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_REVENUE} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => `${v}M`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="enterprise" name="Enterprise" stackId="a" fill="#6366f1" />
              <Bar dataKey="business" name="Business" stackId="a" fill="#8b5cf6" />
              <Bar dataKey="starter" name="Starter" stackId="a" fill="#a78bfa" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWidget>

        <ChartWidget title="요금제별 비중" height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={PLAN_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                style={{ fontSize: 10 }}
              >
                {PLAN_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartWidget>
      </div>

      {/* Batch Invoice Confirm */}
      <ConfirmDialog
        open={batchConfirmOpen}
        title="청구서 일괄 발행"
        description={`미결제 상태인 ${MOCK_BILLING_ROWS.filter(r => r.paymentStatus === 'unpaid').length}개 테넌트에 청구서를 일괄 발행하시겠습니까?`}
        confirmLabel="발행"
        onConfirm={() => {
          setBatchConfirmOpen(false);
          setBatchToast('청구서가 일괄 발행되었습니다.');
          setTimeout(() => setBatchToast(''), 3000);
        }}
        onCancel={() => setBatchConfirmOpen(false)}
      />

      {/* Toast */}
      {batchToast && (
        <div role="alert" className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-green-600 text-white text-sm rounded-lg shadow-lg animate-fade-in-up">
          {batchToast}
        </div>
      )}
    </div>
  );
};

export default BillingTab;
