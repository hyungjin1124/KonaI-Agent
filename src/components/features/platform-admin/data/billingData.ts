import type { BillingSummary, TenantBillingRow, MonthlyRevenueData, PlanDistributionData } from './platformAdminTypes';

export const BILLING_SUMMARY: BillingSummary = {
  monthlyRevenue: { value: '₩48.2M', change: '↑ 12%' },
  outstanding: { value: '₩3.8M' },
  paidCount: { value: '20' },
  unpaidCount: { value: '4' },
};

export const MOCK_BILLING_ROWS: TenantBillingRow[] = [
  { tenantId: 'tnt_samsung', tenantName: '삼성전자', plan: 'Enterprise', baseFee: '₩15,000,000', overage: '₩2,340,000', total: '₩17,340,000', paymentStatus: 'paid' },
  { tenantId: 'tnt_hyundai', tenantName: '현대자동차', plan: 'Business', baseFee: '₩8,000,000', overage: '₩1,120,000', total: '₩9,120,000', paymentStatus: 'paid' },
  { tenantId: 'tnt_startup_a', tenantName: '스타트업 A', plan: 'Starter', baseFee: '₩0', overage: '₩0', total: '₩0', paymentStatus: 'trial' },
  { tenantId: 'tnt_b_corp', tenantName: 'B Corp', plan: 'Business', baseFee: '₩8,000,000', overage: '₩0', total: '₩8,000,000', paymentStatus: 'unpaid' },
];

export const MONTHLY_REVENUE: MonthlyRevenueData[] = [
  { month: '2025.10', enterprise: 28, business: 12, starter: 0.5 },
  { month: '2025.11', enterprise: 30, business: 13, starter: 0.5 },
  { month: '2025.12', enterprise: 32, business: 14, starter: 0.3 },
  { month: '2026.01', enterprise: 33, business: 15, starter: 0.5 },
  { month: '2026.02', enterprise: 35, business: 16, starter: 0.4 },
  { month: '2026.03', enterprise: 37, business: 18, starter: 0.5 },
];

export const PLAN_DISTRIBUTION: PlanDistributionData[] = [
  { name: 'Enterprise', value: 8, color: '#6366f1' },
  { name: 'Business', value: 12, color: '#8b5cf6' },
  { name: 'Starter', value: 4, color: '#a78bfa' },
];

export const MONTH_OPTIONS = ['2026년 3월', '2026년 2월', '2026년 1월'];
