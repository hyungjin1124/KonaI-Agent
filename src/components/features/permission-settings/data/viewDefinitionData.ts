import type { ViewDefinition, AccessLevel, DomainAccessMatrix } from '../../../../types';

// ============================================================================
// 345 ERP Database View Definitions — 43 subcategories
// Note: VIEW_DEFINITIONS total = sum of all subcategory viewCount values (316
//       views as defined per subcategory in viewTableData.ts). The canonical
//       count authority is the per-subcategory viewCount fields.
// ============================================================================

export const VIEW_DEFINITIONS: ViewDefinition[] = [
  // ── AC_01 전표 (7) ─────────────────────────────────────────────────────────
  { id: 'mv_slip_universal',          subcategoryId: 'AC_01', viewName: 'mv_slip_universal',          displayName: '통합전표조회' },
  { id: 'mv_slip_daily_summary',      subcategoryId: 'AC_01', viewName: 'mv_slip_daily_summary',      displayName: '일별전표집계' },
  { id: 'v_slip_daily_by_account',    subcategoryId: 'AC_01', viewName: 'v_slip_daily_by_account',    displayName: '계정별일별전표' },
  { id: 'v_slip_monthly_by_account',  subcategoryId: 'AC_01', viewName: 'v_slip_monthly_by_account',  displayName: '계정별월별전표' },
  { id: 'v_slip_monthly_summary',     subcategoryId: 'AC_01', viewName: 'v_slip_monthly_summary',     displayName: '월별전표집계' },
  { id: 'view_slip_detail',           subcategoryId: 'AC_01', viewName: 'view_slip_detail',           displayName: '전표상세(잔액드릴다운)' },
  { id: 'v_account_master',           subcategoryId: 'AC_01', viewName: 'v_account_master',           displayName: '계정과목마스터' },

  // ── AC_02 재무상태표 B/S (10) ──────────────────────────────────────────────
  { id: 'v_bs_yearly',                subcategoryId: 'AC_02', viewName: 'v_bs_yearly',                displayName: '연간재무상태표' },
  { id: 'v_bs_quarterly',             subcategoryId: 'AC_02', viewName: 'v_bs_quarterly',             displayName: '분기재무상태표' },
  { id: 'v_bs_monthly',               subcategoryId: 'AC_02', viewName: 'v_bs_monthly',               displayName: '월별재무상태표' },
  { id: 'v_bs_comparative',           subcategoryId: 'AC_02', viewName: 'v_bs_comparative',           displayName: '비교재무상태표' },
  { id: 'v_bs_consolidated',          subcategoryId: 'AC_02', viewName: 'v_bs_consolidated',          displayName: '연결재무상태표' },
  { id: 'v_bs_by_division',           subcategoryId: 'AC_02', viewName: 'v_bs_by_division',           displayName: '사업부별재무상태표' },
  { id: 'v_bs_by_dept',               subcategoryId: 'AC_02', viewName: 'v_bs_by_dept',               displayName: '부서별재무상태표' },
  { id: 'v_bs_detail',                subcategoryId: 'AC_02', viewName: 'v_bs_detail',                displayName: '재무상태표상세' },
  { id: 'v_bs_trend',                 subcategoryId: 'AC_02', viewName: 'v_bs_trend',                 displayName: '재무상태표추세' },
  { id: 'mv_bs_summary',              subcategoryId: 'AC_02', viewName: 'mv_bs_summary',              displayName: '재무상태표요약' },

  // ── AC_03 손익계산서 P/L (6) ───────────────────────────────────────────────
  { id: 'v_pl_yearly',                subcategoryId: 'AC_03', viewName: 'v_pl_yearly',                displayName: '연간손익계산서' },
  { id: 'v_pl_quarterly',             subcategoryId: 'AC_03', viewName: 'v_pl_quarterly',             displayName: '분기손익계산서' },
  { id: 'v_pl_monthly',               subcategoryId: 'AC_03', viewName: 'v_pl_monthly',               displayName: '월별손익계산서' },
  { id: 'v_pl_by_division',           subcategoryId: 'AC_03', viewName: 'v_pl_by_division',           displayName: '사업부별손익계산서' },
  { id: 'v_pl_comparative',           subcategoryId: 'AC_03', viewName: 'v_pl_comparative',           displayName: '비교손익계산서' },
  { id: 'mv_pl_summary',              subcategoryId: 'AC_03', viewName: 'mv_pl_summary',              displayName: '손익계산서요약' },

  // ── AC_04 예산관리 (17) ────────────────────────────────────────────────────
  { id: 'v_budget_annual',            subcategoryId: 'AC_04', viewName: 'v_budget_annual',            displayName: '연간예산현황' },
  { id: 'v_budget_quarterly',         subcategoryId: 'AC_04', viewName: 'v_budget_quarterly',         displayName: '분기예산현황' },
  { id: 'v_budget_monthly',           subcategoryId: 'AC_04', viewName: 'v_budget_monthly',           displayName: '월별예산현황' },
  { id: 'v_budget_by_dept',           subcategoryId: 'AC_04', viewName: 'v_budget_by_dept',           displayName: '부서별예산현황' },
  { id: 'v_budget_by_project',        subcategoryId: 'AC_04', viewName: 'v_budget_by_project',        displayName: '프로젝트별예산현황' },
  { id: 'v_budget_execution',         subcategoryId: 'AC_04', viewName: 'v_budget_execution',         displayName: '예산집행현황' },
  { id: 'v_budget_variance',          subcategoryId: 'AC_04', viewName: 'v_budget_variance',          displayName: '예산차이분석' },
  { id: 'v_budget_approval',          subcategoryId: 'AC_04', viewName: 'v_budget_approval',          displayName: '예산승인현황' },
  { id: 'v_budget_transfer',          subcategoryId: 'AC_04', viewName: 'v_budget_transfer',          displayName: '예산전용현황' },
  { id: 'v_budget_carry_forward',     subcategoryId: 'AC_04', viewName: 'v_budget_carry_forward',     displayName: '예산이월현황' },
  { id: 'v_budget_status',            subcategoryId: 'AC_04', viewName: 'v_budget_status',            displayName: '예산현황조회' },
  { id: 'v_budget_utilization',       subcategoryId: 'AC_04', viewName: 'v_budget_utilization',       displayName: '예산사용률' },
  { id: 'mv_budget_summary',          subcategoryId: 'AC_04', viewName: 'mv_budget_summary',          displayName: '예산종합요약' },
  { id: 'v_budget_by_account',        subcategoryId: 'AC_04', viewName: 'v_budget_by_account',        displayName: '계정별예산현황' },
  { id: 'v_budget_forecast',          subcategoryId: 'AC_04', viewName: 'v_budget_forecast',          displayName: '예산예측' },
  { id: 'v_budget_closing',           subcategoryId: 'AC_04', viewName: 'v_budget_closing',           displayName: '예산마감현황' },
  { id: 'v_budget_history',           subcategoryId: 'AC_04', viewName: 'v_budget_history',           displayName: '예산변경이력' },

  // ── AC_05 고정자산 (13) ────────────────────────────────────────────────────
  { id: 'v_asset_register',           subcategoryId: 'AC_05', viewName: 'v_asset_register',           displayName: '고정자산대장' },
  { id: 'v_asset_depreciation',       subcategoryId: 'AC_05', viewName: 'v_asset_depreciation',       displayName: '감가상각현황' },
  { id: 'v_asset_acquisition',        subcategoryId: 'AC_05', viewName: 'v_asset_acquisition',        displayName: '자산취득현황' },
  { id: 'v_asset_disposal',           subcategoryId: 'AC_05', viewName: 'v_asset_disposal',           displayName: '자산처분현황' },
  { id: 'v_asset_transfer',           subcategoryId: 'AC_05', viewName: 'v_asset_transfer',           displayName: '자산이관현황' },
  { id: 'v_asset_revaluation',        subcategoryId: 'AC_05', viewName: 'v_asset_revaluation',        displayName: '자산재평가' },
  { id: 'v_asset_by_category',        subcategoryId: 'AC_05', viewName: 'v_asset_by_category',        displayName: '자산유형별현황' },
  { id: 'v_asset_by_location',        subcategoryId: 'AC_05', viewName: 'v_asset_by_location',        displayName: '자산위치별현황' },
  { id: 'v_asset_by_dept',            subcategoryId: 'AC_05', viewName: 'v_asset_by_dept',            displayName: '부서별자산현황' },
  { id: 'v_asset_schedule',           subcategoryId: 'AC_05', viewName: 'v_asset_schedule',           displayName: '자산상각일정' },
  { id: 'v_asset_insurance',          subcategoryId: 'AC_05', viewName: 'v_asset_insurance',          displayName: '자산보험현황' },
  { id: 'mv_asset_summary',           subcategoryId: 'AC_05', viewName: 'mv_asset_summary',           displayName: '고정자산종합요약' },
  { id: 'v_asset_inventory',          subcategoryId: 'AC_05', viewName: 'v_asset_inventory',          displayName: '자산실사현황' },

  // ── AC_06 자금/어음 (7) ────────────────────────────────────────────────────
  { id: 'v_fund_note_receivable',     subcategoryId: 'AC_06', viewName: 'v_fund_note_receivable',     displayName: '받을어음현황' },
  { id: 'v_fund_note_payable',        subcategoryId: 'AC_06', viewName: 'v_fund_note_payable',        displayName: '지급어음현황' },
  { id: 'v_fund_note_discount',       subcategoryId: 'AC_06', viewName: 'v_fund_note_discount',       displayName: '어음할인현황' },
  { id: 'v_fund_note_maturity',       subcategoryId: 'AC_06', viewName: 'v_fund_note_maturity',       displayName: '어음만기현황' },
  { id: 'v_fund_daily_balance',       subcategoryId: 'AC_06', viewName: 'v_fund_daily_balance',       displayName: '일별자금잔액' },
  { id: 'mv_fund_summary',            subcategoryId: 'AC_06', viewName: 'mv_fund_summary',            displayName: '자금종합요약' },
  { id: 'v_fund_note_status',         subcategoryId: 'AC_06', viewName: 'v_fund_note_status',         displayName: '어음현황조회' },

  // ── AC_07 원장/시산표 (9) ──────────────────────────────────────────────────
  { id: 'v_gl_ledger',                subcategoryId: 'AC_07', viewName: 'v_gl_ledger',                displayName: '총계정원장' },
  { id: 'v_gl_trial_balance',         subcategoryId: 'AC_07', viewName: 'v_gl_trial_balance',         displayName: '시산표' },
  { id: 'v_gl_by_account',            subcategoryId: 'AC_07', viewName: 'v_gl_by_account',            displayName: '계정별원장' },
  { id: 'v_gl_by_dept',               subcategoryId: 'AC_07', viewName: 'v_gl_by_dept',               displayName: '부서별원장' },
  { id: 'v_gl_monthly',               subcategoryId: 'AC_07', viewName: 'v_gl_monthly',               displayName: '월별원장' },
  { id: 'v_gl_detail',                subcategoryId: 'AC_07', viewName: 'v_gl_detail',                displayName: '원장상세조회' },
  { id: 'v_gl_closing',               subcategoryId: 'AC_07', viewName: 'v_gl_closing',               displayName: '결산원장' },
  { id: 'mv_gl_summary',              subcategoryId: 'AC_07', viewName: 'mv_gl_summary',              displayName: '원장종합요약' },
  { id: 'v_gl_subledger',             subcategoryId: 'AC_07', viewName: 'v_gl_subledger',             displayName: '보조원장' },

  // ── AC_08 채권채무/수금 (10) ───────────────────────────────────────────────
  { id: 'v_ar_aging',                 subcategoryId: 'AC_08', viewName: 'v_ar_aging',                 displayName: '채권연령분석' },
  { id: 'v_ar_by_customer',           subcategoryId: 'AC_08', viewName: 'v_ar_by_customer',           displayName: '거래처별채권현황' },
  { id: 'v_ar_collection',            subcategoryId: 'AC_08', viewName: 'v_ar_collection',            displayName: '수금현황' },
  { id: 'v_ap_aging',                 subcategoryId: 'AC_08', viewName: 'v_ap_aging',                 displayName: '채무연령분석' },
  { id: 'v_ap_by_vendor',             subcategoryId: 'AC_08', viewName: 'v_ap_by_vendor',             displayName: '거래처별채무현황' },
  { id: 'v_ap_payment',               subcategoryId: 'AC_08', viewName: 'v_ap_payment',               displayName: '지급현황' },
  { id: 'v_ar_ap_offset',             subcategoryId: 'AC_08', viewName: 'v_ar_ap_offset',             displayName: '채권채무상계현황' },
  { id: 'mv_ar_summary',              subcategoryId: 'AC_08', viewName: 'mv_ar_summary',              displayName: '채권종합요약' },
  { id: 'mv_ap_summary',              subcategoryId: 'AC_08', viewName: 'mv_ap_summary',              displayName: '채무종합요약' },
  { id: 'v_collection_status',        subcategoryId: 'AC_08', viewName: 'v_collection_status',        displayName: '수금진행현황' },

  // ── AC_09 비용/배부 (12) ───────────────────────────────────────────────────
  { id: 'v_expense_by_dept',          subcategoryId: 'AC_09', viewName: 'v_expense_by_dept',          displayName: '부서별비용현황' },
  { id: 'v_expense_by_account',       subcategoryId: 'AC_09', viewName: 'v_expense_by_account',       displayName: '계정별비용현황' },
  { id: 'v_expense_monthly',          subcategoryId: 'AC_09', viewName: 'v_expense_monthly',          displayName: '월별비용현황' },
  { id: 'v_expense_allocation',       subcategoryId: 'AC_09', viewName: 'v_expense_allocation',       displayName: '비용배부현황' },
  { id: 'v_expense_by_project',       subcategoryId: 'AC_09', viewName: 'v_expense_by_project',       displayName: '프로젝트별비용현황' },
  { id: 'v_expense_budget_compare',   subcategoryId: 'AC_09', viewName: 'v_expense_budget_compare',   displayName: '비용예산대비' },
  { id: 'v_expense_approval',         subcategoryId: 'AC_09', viewName: 'v_expense_approval',         displayName: '비용승인현황' },
  { id: 'v_expense_detail',           subcategoryId: 'AC_09', viewName: 'v_expense_detail',           displayName: '비용상세내역' },
  { id: 'v_cost_allocation_rule',     subcategoryId: 'AC_09', viewName: 'v_cost_allocation_rule',     displayName: '원가배부기준' },
  { id: 'v_cost_allocation_result',   subcategoryId: 'AC_09', viewName: 'v_cost_allocation_result',   displayName: '원가배부결과' },
  { id: 'mv_expense_summary',         subcategoryId: 'AC_09', viewName: 'mv_expense_summary',         displayName: '비용종합요약' },
  { id: 'v_expense_trend',            subcategoryId: 'AC_09', viewName: 'v_expense_trend',            displayName: '비용추세분석' },

  // ── AC_10 경비/현금출납 (6) ────────────────────────────────────────────────
  { id: 'v_petty_cash',               subcategoryId: 'AC_10', viewName: 'v_petty_cash',               displayName: '소액현금현황' },
  { id: 'v_cash_receipt',             subcategoryId: 'AC_10', viewName: 'v_cash_receipt',             displayName: '현금수입현황' },
  { id: 'v_cash_disbursement',        subcategoryId: 'AC_10', viewName: 'v_cash_disbursement',        displayName: '현금지출현황' },
  { id: 'v_cash_daily',               subcategoryId: 'AC_10', viewName: 'v_cash_daily',               displayName: '일별현금출납장' },
  { id: 'mv_cash_summary',            subcategoryId: 'AC_10', viewName: 'mv_cash_summary',            displayName: '현금출납종합요약' },
  { id: 'v_expense_report',           subcategoryId: 'AC_10', viewName: 'v_expense_report',           displayName: '경비정산보고서' },

  // ── AC_11 외화관리 (3) ─────────────────────────────────────────────────────
  { id: 'v_fx_transaction',           subcategoryId: 'AC_11', viewName: 'v_fx_transaction',           displayName: '외화거래현황' },
  { id: 'v_fx_valuation',             subcategoryId: 'AC_11', viewName: 'v_fx_valuation',             displayName: '외화평가현황' },
  { id: 'v_fx_gain_loss',             subcategoryId: 'AC_11', viewName: 'v_fx_gain_loss',             displayName: '외환손익현황' },

  // ── CFS_01 연결B/S·P/L (6) ────────────────────────────────────────────────
  { id: 'v_cfs_bs_consolidated',      subcategoryId: 'CFS_01', viewName: 'v_cfs_bs_consolidated',    displayName: '연결재무상태표' },
  { id: 'v_cfs_pl_consolidated',      subcategoryId: 'CFS_01', viewName: 'v_cfs_pl_consolidated',    displayName: '연결손익계산서' },
  { id: 'v_cfs_elimination',          subcategoryId: 'CFS_01', viewName: 'v_cfs_elimination',        displayName: '내부거래제거' },
  { id: 'v_cfs_subsidiary',           subcategoryId: 'CFS_01', viewName: 'v_cfs_subsidiary',         displayName: '종속회사현황' },
  { id: 'v_cfs_intercompany',         subcategoryId: 'CFS_01', viewName: 'v_cfs_intercompany',       displayName: '계열사간거래현황' },
  { id: 'mv_cfs_summary',             subcategoryId: 'CFS_01', viewName: 'mv_cfs_summary',           displayName: '연결재무종합요약' },

  // ── SL_01 매출/수주/출하 (8) ──────────────────────────────────────────────
  { id: 'v_sales_order',              subcategoryId: 'SL_01', viewName: 'v_sales_order',              displayName: '수주현황' },
  { id: 'v_sales_delivery',           subcategoryId: 'SL_01', viewName: 'v_sales_delivery',           displayName: '출하현황' },
  { id: 'v_sales_invoice',            subcategoryId: 'SL_01', viewName: 'v_sales_invoice',            displayName: '매출계산서현황' },
  { id: 'v_sales_return',             subcategoryId: 'SL_01', viewName: 'v_sales_return',             displayName: '매출반품현황' },
  { id: 'v_sales_by_customer',        subcategoryId: 'SL_01', viewName: 'v_sales_by_customer',        displayName: '거래처별매출현황' },
  { id: 'v_sales_by_product',         subcategoryId: 'SL_01', viewName: 'v_sales_by_product',         displayName: '제품별매출현황' },
  { id: 'mv_sales_summary',           subcategoryId: 'SL_01', viewName: 'mv_sales_summary',           displayName: '매출종합요약' },
  { id: 'v_sales_backlog',            subcategoryId: 'SL_01', viewName: 'v_sales_backlog',            displayName: '미처리수주잔량' },

  // ── SL_02 수출관리 (3) ─────────────────────────────────────────────────────
  { id: 'v_export_order',             subcategoryId: 'SL_02', viewName: 'v_export_order',             displayName: '수출오더현황' },
  { id: 'v_export_lc',                subcategoryId: 'SL_02', viewName: 'v_export_lc',                displayName: '신용장현황' },
  { id: 'v_export_shipping',          subcategoryId: 'SL_02', viewName: 'v_export_shipping',          displayName: '수출선적현황' },

  // ── SL_03 영업실적/Tier1 (11) ─────────────────────────────────────────────
  { id: 'v_sales_perf_monthly',       subcategoryId: 'SL_03', viewName: 'v_sales_perf_monthly',       displayName: '월별영업실적' },
  { id: 'v_sales_perf_quarterly',     subcategoryId: 'SL_03', viewName: 'v_sales_perf_quarterly',     displayName: '분기영업실적' },
  { id: 'v_sales_perf_by_rep',        subcategoryId: 'SL_03', viewName: 'v_sales_perf_by_rep',        displayName: '영업담당자별실적' },
  { id: 'v_sales_perf_by_region',     subcategoryId: 'SL_03', viewName: 'v_sales_perf_by_region',     displayName: '지역별영업실적' },
  { id: 'v_sales_perf_by_channel',    subcategoryId: 'SL_03', viewName: 'v_sales_perf_by_channel',    displayName: '채널별영업실적' },
  { id: 'v_sales_target_actual',      subcategoryId: 'SL_03', viewName: 'v_sales_target_actual',      displayName: '영업목표대비실적' },
  { id: 'v_sales_pipeline',           subcategoryId: 'SL_03', viewName: 'v_sales_pipeline',           displayName: '영업파이프라인' },
  { id: 'v_sales_forecast',           subcategoryId: 'SL_03', viewName: 'v_sales_forecast',           displayName: '영업예측' },
  { id: 'mv_sales_perf_summary',      subcategoryId: 'SL_03', viewName: 'mv_sales_perf_summary',      displayName: '영업실적종합요약' },
  { id: 'v_sales_ranking',            subcategoryId: 'SL_03', viewName: 'v_sales_ranking',            displayName: '영업실적순위' },
  { id: 'v_sales_tier1_analysis',     subcategoryId: 'SL_03', viewName: 'v_sales_tier1_analysis',     displayName: '영업Tier1분석' },

  // ── AP_01 입출금/자금집행 (8) ─────────────────────────────────────────────
  { id: 'v_payment_daily',            subcategoryId: 'AP_01', viewName: 'v_payment_daily',            displayName: '일별지급현황' },
  { id: 'v_payment_by_vendor',        subcategoryId: 'AP_01', viewName: 'v_payment_by_vendor',        displayName: '거래처별지급현황' },
  { id: 'v_payment_approval',         subcategoryId: 'AP_01', viewName: 'v_payment_approval',         displayName: '지급승인현황' },
  { id: 'v_payment_schedule',         subcategoryId: 'AP_01', viewName: 'v_payment_schedule',         displayName: '지급예정현황' },
  { id: 'v_receipt_daily',            subcategoryId: 'AP_01', viewName: 'v_receipt_daily',            displayName: '일별수금현황' },
  { id: 'v_receipt_by_source',        subcategoryId: 'AP_01', viewName: 'v_receipt_by_source',        displayName: '수금원천별현황' },
  { id: 'mv_payment_summary',         subcategoryId: 'AP_01', viewName: 'mv_payment_summary',         displayName: '지급종합요약' },
  { id: 'v_fund_execution',           subcategoryId: 'AP_01', viewName: 'v_fund_execution',           displayName: '자금집행현황' },

  // ── AP_02 자금Tier1 (6) ────────────────────────────────────────────────────
  { id: 'v_fund_position',            subcategoryId: 'AP_02', viewName: 'v_fund_position',            displayName: '자금포지션' },
  { id: 'v_fund_forecast',            subcategoryId: 'AP_02', viewName: 'v_fund_forecast',            displayName: '자금예측' },
  { id: 'v_fund_liquidity',           subcategoryId: 'AP_02', viewName: 'v_fund_liquidity',           displayName: '유동성현황' },
  { id: 'v_fund_investment',          subcategoryId: 'AP_02', viewName: 'v_fund_investment',          displayName: '자금운용현황' },
  { id: 'mv_fund_tier1_summary',      subcategoryId: 'AP_02', viewName: 'mv_fund_tier1_summary',      displayName: '자금Tier1종합요약' },
  { id: 'v_fund_cashflow',            subcategoryId: 'AP_02', viewName: 'v_fund_cashflow',            displayName: '자금흐름현황' },

  // ── CF_01 CFS운영 (10) ────────────────────────────────────────────────────
  { id: 'v_cashflow_operating',       subcategoryId: 'CF_01', viewName: 'v_cashflow_operating',       displayName: '영업활동현금흐름' },
  { id: 'v_cashflow_investing',       subcategoryId: 'CF_01', viewName: 'v_cashflow_investing',       displayName: '투자활동현금흐름' },
  { id: 'v_cashflow_financing',       subcategoryId: 'CF_01', viewName: 'v_cashflow_financing',       displayName: '재무활동현금흐름' },
  { id: 'v_cashflow_direct',          subcategoryId: 'CF_01', viewName: 'v_cashflow_direct',          displayName: '직접법현금흐름표' },
  { id: 'v_cashflow_indirect',        subcategoryId: 'CF_01', viewName: 'v_cashflow_indirect',        displayName: '간접법현금흐름표' },
  { id: 'v_cashflow_monthly',         subcategoryId: 'CF_01', viewName: 'v_cashflow_monthly',         displayName: '월별현금흐름' },
  { id: 'v_cashflow_quarterly',       subcategoryId: 'CF_01', viewName: 'v_cashflow_quarterly',       displayName: '분기현금흐름' },
  { id: 'v_cashflow_by_entity',       subcategoryId: 'CF_01', viewName: 'v_cashflow_by_entity',       displayName: '법인별현금흐름' },
  { id: 'mv_cashflow_summary',        subcategoryId: 'CF_01', viewName: 'mv_cashflow_summary',        displayName: '현금흐름종합요약' },
  { id: 'v_cashflow_variance',        subcategoryId: 'CF_01', viewName: 'v_cashflow_variance',        displayName: '현금흐름차이분석' },

  // ── CF_02 자금계획 (8) ────────────────────────────────────────────────────
  { id: 'v_fund_plan_annual',         subcategoryId: 'CF_02', viewName: 'v_fund_plan_annual',         displayName: '연간자금계획' },
  { id: 'v_fund_plan_monthly',        subcategoryId: 'CF_02', viewName: 'v_fund_plan_monthly',        displayName: '월별자금계획' },
  { id: 'v_fund_plan_weekly',         subcategoryId: 'CF_02', viewName: 'v_fund_plan_weekly',         displayName: '주별자금계획' },
  { id: 'v_fund_plan_daily',          subcategoryId: 'CF_02', viewName: 'v_fund_plan_daily',          displayName: '일별자금계획' },
  { id: 'v_fund_plan_variance',       subcategoryId: 'CF_02', viewName: 'v_fund_plan_variance',       displayName: '자금계획차이분석' },
  { id: 'v_fund_plan_approval',       subcategoryId: 'CF_02', viewName: 'v_fund_plan_approval',       displayName: '자금계획승인현황' },
  { id: 'mv_fund_plan_summary',       subcategoryId: 'CF_02', viewName: 'mv_fund_plan_summary',       displayName: '자금계획종합요약' },
  { id: 'v_fund_plan_forecast',       subcategoryId: 'CF_02', viewName: 'v_fund_plan_forecast',       displayName: '자금계획예측' },

  // ── CR_01 보고서 (4) ──────────────────────────────────────────────────────
  { id: 'v_report_financial',         subcategoryId: 'CR_01', viewName: 'v_report_financial',         displayName: '재무보고서' },
  { id: 'v_report_management',        subcategoryId: 'CR_01', viewName: 'v_report_management',        displayName: '경영보고서' },
  { id: 'v_report_regulatory',        subcategoryId: 'CR_01', viewName: 'v_report_regulatory',        displayName: '법정보고서' },
  { id: 'v_report_custom',            subcategoryId: 'CR_01', viewName: 'v_report_custom',            displayName: '사용자정의보고서' },

  // ── PU_01 발주/입고 (4) ───────────────────────────────────────────────────
  { id: 'v_po_order',                 subcategoryId: 'PU_01', viewName: 'v_po_order',                 displayName: '구매발주현황' },
  { id: 'v_po_receipt',               subcategoryId: 'PU_01', viewName: 'v_po_receipt',               displayName: '구매입고현황' },
  { id: 'v_po_status',                subcategoryId: 'PU_01', viewName: 'v_po_status',                displayName: '발주진행현황' },
  { id: 'mv_po_summary',              subcategoryId: 'PU_01', viewName: 'mv_po_summary',              displayName: '발주입고종합요약' },

  // ── PU_02 매입관리 (8) ────────────────────────────────────────────────────
  { id: 'v_purchase_invoice',         subcategoryId: 'PU_02', viewName: 'v_purchase_invoice',         displayName: '매입세금계산서현황' },
  { id: 'v_purchase_by_vendor',       subcategoryId: 'PU_02', viewName: 'v_purchase_by_vendor',       displayName: '거래처별매입현황' },
  { id: 'v_purchase_by_item',         subcategoryId: 'PU_02', viewName: 'v_purchase_by_item',         displayName: '품목별매입현황' },
  { id: 'v_purchase_return',          subcategoryId: 'PU_02', viewName: 'v_purchase_return',          displayName: '매입반품현황' },
  { id: 'v_purchase_price_compare',   subcategoryId: 'PU_02', viewName: 'v_purchase_price_compare',   displayName: '구매단가비교' },
  { id: 'v_purchase_contract',        subcategoryId: 'PU_02', viewName: 'v_purchase_contract',        displayName: '구매계약현황' },
  { id: 'mv_purchase_summary',        subcategoryId: 'PU_02', viewName: 'mv_purchase_summary',        displayName: '매입종합요약' },
  { id: 'v_purchase_approval',        subcategoryId: 'PU_02', viewName: 'v_purchase_approval',        displayName: '구매승인현황' },

  // ── TA_01 부가세/세금계산서 (14) ──────────────────────────────────────────
  { id: 'v_tax_invoice_issued',       subcategoryId: 'TA_01', viewName: 'v_tax_invoice_issued',       displayName: '매출세금계산서발행' },
  { id: 'v_tax_invoice_received',     subcategoryId: 'TA_01', viewName: 'v_tax_invoice_received',     displayName: '매입세금계산서수취' },
  { id: 'v_vat_report',               subcategoryId: 'TA_01', viewName: 'v_vat_report',               displayName: '부가세신고서' },
  { id: 'v_vat_monthly',              subcategoryId: 'TA_01', viewName: 'v_vat_monthly',              displayName: '월별부가세현황' },
  { id: 'v_vat_quarterly',            subcategoryId: 'TA_01', viewName: 'v_vat_quarterly',            displayName: '분기부가세현황' },
  { id: 'v_tax_invoice_status',       subcategoryId: 'TA_01', viewName: 'v_tax_invoice_status',       displayName: '세금계산서현황' },
  { id: 'v_tax_invoice_matching',     subcategoryId: 'TA_01', viewName: 'v_tax_invoice_matching',     displayName: '세금계산서매칭' },
  { id: 'v_vat_adjustment',           subcategoryId: 'TA_01', viewName: 'v_vat_adjustment',           displayName: '부가세수정신고' },
  { id: 'v_tax_invoice_electronic',   subcategoryId: 'TA_01', viewName: 'v_tax_invoice_electronic',   displayName: '전자세금계산서현황' },
  { id: 'v_vat_refund',               subcategoryId: 'TA_01', viewName: 'v_vat_refund',               displayName: '부가세환급현황' },
  { id: 'v_tax_summary',              subcategoryId: 'TA_01', viewName: 'v_tax_summary',              displayName: '세금현황요약' },
  { id: 'mv_vat_summary',             subcategoryId: 'TA_01', viewName: 'mv_vat_summary',             displayName: '부가세종합요약' },
  { id: 'v_tax_invoice_error',        subcategoryId: 'TA_01', viewName: 'v_tax_invoice_error',        displayName: '세금계산서오류현황' },
  { id: 'v_vat_filing',               subcategoryId: 'TA_01', viewName: 'v_vat_filing',               displayName: '부가세신고이력' },

  // ── TA_02 원천세 (2) ──────────────────────────────────────────────────────
  { id: 'v_withholding_tax',          subcategoryId: 'TA_02', viewName: 'v_withholding_tax',          displayName: '원천세현황' },
  { id: 'v_withholding_report',       subcategoryId: 'TA_02', viewName: 'v_withholding_report',       displayName: '원천세납부신고서' },

  // ── PD_01 작업지시/실적 (5) ───────────────────────────────────────────────
  { id: 'v_work_order',               subcategoryId: 'PD_01', viewName: 'v_work_order',               displayName: '작업지시현황' },
  { id: 'v_work_result',              subcategoryId: 'PD_01', viewName: 'v_work_result',              displayName: '생산실적현황' },
  { id: 'v_work_schedule',            subcategoryId: 'PD_01', viewName: 'v_work_schedule',            displayName: '작업일정현황' },
  { id: 'v_work_efficiency',          subcategoryId: 'PD_01', viewName: 'v_work_efficiency',          displayName: '작업효율분석' },
  { id: 'mv_work_summary',            subcategoryId: 'PD_01', viewName: 'mv_work_summary',            displayName: '생산실적종합요약' },

  // ── PD_02 생산원가 (12) ───────────────────────────────────────────────────
  { id: 'v_prod_cost_material',       subcategoryId: 'PD_02', viewName: 'v_prod_cost_material',       displayName: '재료비현황' },
  { id: 'v_prod_cost_labor',          subcategoryId: 'PD_02', viewName: 'v_prod_cost_labor',          displayName: '노무비현황' },
  { id: 'v_prod_cost_overhead',       subcategoryId: 'PD_02', viewName: 'v_prod_cost_overhead',       displayName: '제조간접비현황' },
  { id: 'v_prod_cost_by_product',     subcategoryId: 'PD_02', viewName: 'v_prod_cost_by_product',     displayName: '제품별생산원가' },
  { id: 'v_prod_cost_by_line',        subcategoryId: 'PD_02', viewName: 'v_prod_cost_by_line',        displayName: '라인별생산원가' },
  { id: 'v_prod_cost_monthly',        subcategoryId: 'PD_02', viewName: 'v_prod_cost_monthly',        displayName: '월별생산원가' },
  { id: 'v_prod_cost_variance',       subcategoryId: 'PD_02', viewName: 'v_prod_cost_variance',       displayName: '원가차이분석' },
  { id: 'v_prod_cost_standard',       subcategoryId: 'PD_02', viewName: 'v_prod_cost_standard',       displayName: '표준원가현황' },
  { id: 'v_prod_cost_actual',         subcategoryId: 'PD_02', viewName: 'v_prod_cost_actual',         displayName: '실제원가현황' },
  { id: 'v_prod_cost_wip',            subcategoryId: 'PD_02', viewName: 'v_prod_cost_wip',            displayName: '재공품원가현황' },
  { id: 'mv_prod_cost_summary',       subcategoryId: 'PD_02', viewName: 'mv_prod_cost_summary',       displayName: '생산원가종합요약' },
  { id: 'v_prod_cost_trend',          subcategoryId: 'PD_02', viewName: 'v_prod_cost_trend',          displayName: '생산원가추세' },

  // ── PD_03 외주/BOM/Tier1 (10) ─────────────────────────────────────────────
  { id: 'v_outsource_order',          subcategoryId: 'PD_03', viewName: 'v_outsource_order',          displayName: '외주발주현황' },
  { id: 'v_outsource_receipt',        subcategoryId: 'PD_03', viewName: 'v_outsource_receipt',        displayName: '외주입고현황' },
  { id: 'v_outsource_cost',           subcategoryId: 'PD_03', viewName: 'v_outsource_cost',           displayName: '외주비용현황' },
  { id: 'v_bom_master',               subcategoryId: 'PD_03', viewName: 'v_bom_master',               displayName: 'BOM마스터' },
  { id: 'v_bom_by_product',           subcategoryId: 'PD_03', viewName: 'v_bom_by_product',           displayName: '제품별BOM' },
  { id: 'v_bom_cost_rollup',          subcategoryId: 'PD_03', viewName: 'v_bom_cost_rollup',          displayName: 'BOM원가롤업' },
  { id: 'v_bom_revision',             subcategoryId: 'PD_03', viewName: 'v_bom_revision',             displayName: 'BOM개정이력' },
  { id: 'mv_outsource_summary',       subcategoryId: 'PD_03', viewName: 'mv_outsource_summary',       displayName: '외주종합요약' },
  { id: 'v_bom_where_used',           subcategoryId: 'PD_03', viewName: 'v_bom_where_used',           displayName: 'BOM역전개조회' },
  { id: 'v_prod_tier1_analysis',      subcategoryId: 'PD_03', viewName: 'v_prod_tier1_analysis',      displayName: '생산Tier1분석' },

  // ── LG_01 입출고/재고 (6) ─────────────────────────────────────────────────
  { id: 'v_stock_receipt',            subcategoryId: 'LG_01', viewName: 'v_stock_receipt',            displayName: '입고현황' },
  { id: 'v_stock_issue',              subcategoryId: 'LG_01', viewName: 'v_stock_issue',              displayName: '출고현황' },
  { id: 'v_stock_balance',            subcategoryId: 'LG_01', viewName: 'v_stock_balance',            displayName: '재고잔량현황' },
  { id: 'v_stock_movement',           subcategoryId: 'LG_01', viewName: 'v_stock_movement',           displayName: '재고이동현황' },
  { id: 'v_stock_aging',              subcategoryId: 'LG_01', viewName: 'v_stock_aging',              displayName: '재고연령분석' },
  { id: 'mv_stock_summary',           subcategoryId: 'LG_01', viewName: 'mv_stock_summary',           displayName: '재고종합요약' },

  // ── LG_02 창고관리 (12) ───────────────────────────────────────────────────
  { id: 'v_wh_stock_by_location',     subcategoryId: 'LG_02', viewName: 'v_wh_stock_by_location',     displayName: '로케이션별재고현황' },
  { id: 'v_wh_stock_by_item',         subcategoryId: 'LG_02', viewName: 'v_wh_stock_by_item',         displayName: '품목별창고재고' },
  { id: 'v_wh_transfer',              subcategoryId: 'LG_02', viewName: 'v_wh_transfer',              displayName: '창고이동현황' },
  { id: 'v_wh_adjustment',            subcategoryId: 'LG_02', viewName: 'v_wh_adjustment',            displayName: '재고조정현황' },
  { id: 'v_wh_cycle_count',           subcategoryId: 'LG_02', viewName: 'v_wh_cycle_count',           displayName: '순환재고실사' },
  { id: 'v_wh_capacity',              subcategoryId: 'LG_02', viewName: 'v_wh_capacity',              displayName: '창고용량현황' },
  { id: 'v_wh_utilization',           subcategoryId: 'LG_02', viewName: 'v_wh_utilization',           displayName: '창고가동률' },
  { id: 'v_wh_picking',               subcategoryId: 'LG_02', viewName: 'v_wh_picking',               displayName: '피킹현황' },
  { id: 'v_wh_packing',               subcategoryId: 'LG_02', viewName: 'v_wh_packing',               displayName: '패킹현황' },
  { id: 'v_wh_shipping',              subcategoryId: 'LG_02', viewName: 'v_wh_shipping',              displayName: '창고출하현황' },
  { id: 'mv_wh_summary',              subcategoryId: 'LG_02', viewName: 'mv_wh_summary',              displayName: '창고관리종합요약' },
  { id: 'v_wh_inventory_valuation',   subcategoryId: 'LG_02', viewName: 'v_wh_inventory_valuation',   displayName: '재고평가액현황' },

  // ── PJ_01 프로젝트현황 (8) ────────────────────────────────────────────────
  { id: 'v_project_status',           subcategoryId: 'PJ_01', viewName: 'v_project_status',           displayName: '프로젝트현황' },
  { id: 'v_project_progress',         subcategoryId: 'PJ_01', viewName: 'v_project_progress',         displayName: '프로젝트진행률' },
  { id: 'v_project_cost',             subcategoryId: 'PJ_01', viewName: 'v_project_cost',             displayName: '프로젝트비용현황' },
  { id: 'v_project_resource',         subcategoryId: 'PJ_01', viewName: 'v_project_resource',         displayName: '프로젝트인력현황' },
  { id: 'v_project_milestone',        subcategoryId: 'PJ_01', viewName: 'v_project_milestone',        displayName: '마일스톤현황' },
  { id: 'v_project_risk',             subcategoryId: 'PJ_01', viewName: 'v_project_risk',             displayName: '프로젝트리스크현황' },
  { id: 'mv_project_summary',         subcategoryId: 'PJ_01', viewName: 'mv_project_summary',         displayName: '프로젝트종합요약' },
  { id: 'v_project_timeline',         subcategoryId: 'PJ_01', viewName: 'v_project_timeline',         displayName: '프로젝트일정현황' },

  // ── PJ_02 프로젝트Tier1 (7) ───────────────────────────────────────────────
  { id: 'v_project_portfolio',        subcategoryId: 'PJ_02', viewName: 'v_project_portfolio',        displayName: '프로젝트포트폴리오' },
  { id: 'v_project_roi',              subcategoryId: 'PJ_02', viewName: 'v_project_roi',              displayName: '프로젝트ROI분석' },
  { id: 'v_project_comparison',       subcategoryId: 'PJ_02', viewName: 'v_project_comparison',       displayName: '프로젝트비교분석' },
  { id: 'v_project_budget_actual',    subcategoryId: 'PJ_02', viewName: 'v_project_budget_actual',    displayName: '프로젝트예산실적' },
  { id: 'v_project_tier1_kpi',        subcategoryId: 'PJ_02', viewName: 'v_project_tier1_kpi',        displayName: '프로젝트Tier1KPI' },
  { id: 'mv_project_tier1_summary',   subcategoryId: 'PJ_02', viewName: 'mv_project_tier1_summary',   displayName: '프로젝트Tier1종합요약' },
  { id: 'v_project_resource_plan',    subcategoryId: 'PJ_02', viewName: 'v_project_resource_plan',    displayName: '프로젝트인력계획' },

  // ── HR_01 인사/발령/근태 (7) ──────────────────────────────────────────────
  { id: 'v_hr_employee',              subcategoryId: 'HR_01', viewName: 'v_hr_employee',              displayName: '사원정보' },
  { id: 'v_hr_appointment',           subcategoryId: 'HR_01', viewName: 'v_hr_appointment',           displayName: '인사발령현황' },
  { id: 'v_hr_attendance',            subcategoryId: 'HR_01', viewName: 'v_hr_attendance',            displayName: '근태현황' },
  { id: 'v_hr_leave',                 subcategoryId: 'HR_01', viewName: 'v_hr_leave',                 displayName: '휴가현황' },
  { id: 'v_hr_headcount',             subcategoryId: 'HR_01', viewName: 'v_hr_headcount',             displayName: '인원현황' },
  { id: 'mv_hr_summary',              subcategoryId: 'HR_01', viewName: 'mv_hr_summary',              displayName: '인사종합요약' },
  { id: 'v_hr_organization',          subcategoryId: 'HR_01', viewName: 'v_hr_organization',          displayName: '조직도' },

  // ── PR_01 급여/상여 (5) ───────────────────────────────────────────────────
  { id: 'view_pr_pay_result',         subcategoryId: 'PR_01', viewName: 'view_pr_pay_result',         displayName: '급여지급결과' },
  { id: 'view_payroll_monthly',       subcategoryId: 'PR_01', viewName: 'view_payroll_monthly',       displayName: '월별급여현황' },
  { id: 'v_payroll_bonus',            subcategoryId: 'PR_01', viewName: 'v_payroll_bonus',            displayName: '상여금현황' },
  { id: 'v_payroll_deduction',        subcategoryId: 'PR_01', viewName: 'v_payroll_deduction',        displayName: '급여공제현황' },
  { id: 'mv_payroll_summary',         subcategoryId: 'PR_01', viewName: 'mv_payroll_summary',         displayName: '급여종합요약' },

  // ── DA_01 환율 (2) ────────────────────────────────────────────────────────
  { id: 'v_exchange_rate',            subcategoryId: 'DA_01', viewName: 'v_exchange_rate',            displayName: '환율마스터' },
  { id: 'v_exchange_rate_history',    subcategoryId: 'DA_01', viewName: 'v_exchange_rate_history',    displayName: '환율변동이력' },

  // ── ESM_01 원가분석 (6) ───────────────────────────────────────────────────
  { id: 'v_cost_analysis_product',    subcategoryId: 'ESM_01', viewName: 'v_cost_analysis_product',  displayName: '제품별원가분석' },
  { id: 'v_cost_analysis_dept',       subcategoryId: 'ESM_01', viewName: 'v_cost_analysis_dept',     displayName: '부서별원가분석' },
  { id: 'v_cost_analysis_monthly',    subcategoryId: 'ESM_01', viewName: 'v_cost_analysis_monthly',  displayName: '월별원가분석' },
  { id: 'v_cost_variance_analysis',   subcategoryId: 'ESM_01', viewName: 'v_cost_variance_analysis', displayName: '원가차이분석' },
  { id: 'mv_cost_analysis_summary',   subcategoryId: 'ESM_01', viewName: 'mv_cost_analysis_summary', displayName: '원가분석종합요약' },
  { id: 'v_cost_driver_analysis',     subcategoryId: 'ESM_01', viewName: 'v_cost_driver_analysis',   displayName: '원가동인분석' },

  // ── ABC_01 수익성지표 (4) ─────────────────────────────────────────────────
  { id: 'v_profitability_product',    subcategoryId: 'ABC_01', viewName: 'v_profitability_product',  displayName: '제품별수익성' },
  { id: 'v_profitability_customer',   subcategoryId: 'ABC_01', viewName: 'v_profitability_customer', displayName: '고객별수익성' },
  { id: 'v_profitability_channel',    subcategoryId: 'ABC_01', viewName: 'v_profitability_channel',  displayName: '채널별수익성' },
  { id: 'mv_profitability_summary',   subcategoryId: 'ABC_01', viewName: 'mv_profitability_summary', displayName: '수익성종합요약' },

  // ── EIS_01 경영대시보드 (12) ──────────────────────────────────────────────
  { id: 'v_eis_revenue',              subcategoryId: 'EIS_01', viewName: 'v_eis_revenue',             displayName: '매출현황(경영)' },
  { id: 'v_eis_profit',               subcategoryId: 'EIS_01', viewName: 'v_eis_profit',              displayName: '손익현황(경영)' },
  { id: 'v_eis_cost',                 subcategoryId: 'EIS_01', viewName: 'v_eis_cost',                displayName: '비용현황(경영)' },
  { id: 'v_eis_cashflow',             subcategoryId: 'EIS_01', viewName: 'v_eis_cashflow',            displayName: '현금흐름(경영)' },
  { id: 'v_eis_headcount',            subcategoryId: 'EIS_01', viewName: 'v_eis_headcount',           displayName: '인원현황(경영)' },
  { id: 'v_eis_production',           subcategoryId: 'EIS_01', viewName: 'v_eis_production',          displayName: '생산현황(경영)' },
  { id: 'v_eis_sales',                subcategoryId: 'EIS_01', viewName: 'v_eis_sales',               displayName: '영업현황(경영)' },
  { id: 'v_eis_inventory',            subcategoryId: 'EIS_01', viewName: 'v_eis_inventory',           displayName: '재고현황(경영)' },
  { id: 'v_eis_receivable',           subcategoryId: 'EIS_01', viewName: 'v_eis_receivable',          displayName: '채권현황(경영)' },
  { id: 'v_eis_payable',              subcategoryId: 'EIS_01', viewName: 'v_eis_payable',             displayName: '채무현황(경영)' },
  { id: 'mv_eis_dashboard',           subcategoryId: 'EIS_01', viewName: 'mv_eis_dashboard',          displayName: '경영대시보드종합요약' },
  { id: 'v_eis_kpi',                  subcategoryId: 'EIS_01', viewName: 'v_eis_kpi',                 displayName: '경영KPI현황' },

  // ── EIS_02 영업분석 (7) ───────────────────────────────────────────────────
  { id: 'v_eis_sales_trend',          subcategoryId: 'EIS_02', viewName: 'v_eis_sales_trend',         displayName: '영업추세분석' },
  { id: 'v_eis_sales_by_region',      subcategoryId: 'EIS_02', viewName: 'v_eis_sales_by_region',     displayName: '지역별영업분석' },
  { id: 'v_eis_sales_by_product',     subcategoryId: 'EIS_02', viewName: 'v_eis_sales_by_product',    displayName: '제품별영업분석' },
  { id: 'v_eis_sales_forecast',       subcategoryId: 'EIS_02', viewName: 'v_eis_sales_forecast',      displayName: '영업예측분석' },
  { id: 'v_eis_customer_analysis',    subcategoryId: 'EIS_02', viewName: 'v_eis_customer_analysis',   displayName: '고객분석' },
  { id: 'mv_eis_sales_summary',       subcategoryId: 'EIS_02', viewName: 'mv_eis_sales_summary',      displayName: '영업분석종합요약' },
  { id: 'v_eis_sales_margin',         subcategoryId: 'EIS_02', viewName: 'v_eis_sales_margin',        displayName: '영업마진분석' },

  // ── EIS_03 구매분석 (5) ───────────────────────────────────────────────────
  { id: 'v_eis_purchase_trend',       subcategoryId: 'EIS_03', viewName: 'v_eis_purchase_trend',      displayName: '구매추세분석' },
  { id: 'v_eis_purchase_by_vendor',   subcategoryId: 'EIS_03', viewName: 'v_eis_purchase_by_vendor',  displayName: '거래처별구매분석' },
  { id: 'v_eis_purchase_cost',        subcategoryId: 'EIS_03', viewName: 'v_eis_purchase_cost',       displayName: '구매비용분석' },
  { id: 'mv_eis_purchase_summary',    subcategoryId: 'EIS_03', viewName: 'mv_eis_purchase_summary',   displayName: '구매분석종합요약' },
  { id: 'v_eis_purchase_saving',      subcategoryId: 'EIS_03', viewName: 'v_eis_purchase_saving',     displayName: '구매절감분석' },

  // ── EIS_04 재무분석 (4) ───────────────────────────────────────────────────
  { id: 'v_eis_financial_ratio',      subcategoryId: 'EIS_04', viewName: 'v_eis_financial_ratio',     displayName: '재무비율분석' },
  { id: 'v_eis_financial_trend',      subcategoryId: 'EIS_04', viewName: 'v_eis_financial_trend',     displayName: '재무추세분석' },
  { id: 'v_eis_financial_benchmark',  subcategoryId: 'EIS_04', viewName: 'v_eis_financial_benchmark', displayName: '재무벤치마크분석' },
  { id: 'mv_eis_financial_summary',   subcategoryId: 'EIS_04', viewName: 'mv_eis_financial_summary',  displayName: '재무분석종합요약' },

  // ── EIS_05 카드/외주/인사 (7) ────────────────────────────────────────────
  { id: 'v_eis_card_usage',           subcategoryId: 'EIS_05', viewName: 'v_eis_card_usage',          displayName: '법인카드사용현황' },
  { id: 'v_eis_card_by_dept',         subcategoryId: 'EIS_05', viewName: 'v_eis_card_by_dept',        displayName: '부서별카드사용분석' },
  { id: 'v_eis_outsource_cost',       subcategoryId: 'EIS_05', viewName: 'v_eis_outsource_cost',      displayName: '외주비용현황' },
  { id: 'v_eis_outsource_trend',      subcategoryId: 'EIS_05', viewName: 'v_eis_outsource_trend',     displayName: '외주추세분석' },
  { id: 'v_eis_hr_turnover',          subcategoryId: 'EIS_05', viewName: 'v_eis_hr_turnover',         displayName: '인력이탈률분석' },
  { id: 'v_eis_hr_recruitment',       subcategoryId: 'EIS_05', viewName: 'v_eis_hr_recruitment',      displayName: '채용현황' },
  { id: 'mv_eis_misc_summary',        subcategoryId: 'EIS_05', viewName: 'mv_eis_misc_summary',       displayName: '카드외주인사종합요약' },

  // ── BNK_01 은행잔고/카드 (3) ─────────────────────────────────────────────
  { id: 'v_bank_balance',             subcategoryId: 'BNK_01', viewName: 'v_bank_balance',            displayName: '은행잔고현황' },
  { id: 'v_bank_transaction',         subcategoryId: 'BNK_01', viewName: 'v_bank_transaction',        displayName: '은행거래내역' },
  { id: 'v_card_statement',           subcategoryId: 'BNK_01', viewName: 'v_card_statement',          displayName: '카드명세현황' },

  // ── KOD_01 수출입 (2) ─────────────────────────────────────────────────────
  { id: 'v_import_customs',           subcategoryId: 'KOD_01', viewName: 'v_import_customs',          displayName: '수입통관현황' },
  { id: 'v_export_customs',           subcategoryId: 'KOD_01', viewName: 'v_export_customs',          displayName: '수출통관현황' },
];

// ============================================================================
// Lookup: subcategoryId → ViewDefinition[]
// ============================================================================

export const VIEWS_BY_SUBCATEGORY: Record<string, ViewDefinition[]> = {};
for (const view of VIEW_DEFINITIONS) {
  if (!VIEWS_BY_SUBCATEGORY[view.subcategoryId]) {
    VIEWS_BY_SUBCATEGORY[view.subcategoryId] = [];
  }
  VIEWS_BY_SUBCATEGORY[view.subcategoryId].push(view);
}

// ============================================================================
// Helper: resolve effective access level for a single view
// ============================================================================

/**
 * Resolve the effective access level for a view within a given role's matrix.
 * Per-view override takes precedence over the subcategory-level default.
 *
 * @param matrix   - The DomainAccessMatrix for the target role.
 * @param subcategoryId - The subcategory the view belongs to.
 * @param viewId   - The technical view id (e.g. 'mv_slip_universal').
 * @returns An object with the resolved `level` and an `isOverride` flag.
 */
export function resolveViewAccessLevel(
  matrix: DomainAccessMatrix,
  subcategoryId: string,
  viewId: string,
): { level: AccessLevel; isOverride: boolean } {
  const override = matrix.viewOverrides[viewId];
  if (override !== undefined) {
    return { level: override, isOverride: true };
  }
  const subcatLevel = matrix.subcategoryAccess[subcategoryId] ?? 'no_access';
  return { level: subcatLevel, isOverride: false };
}
