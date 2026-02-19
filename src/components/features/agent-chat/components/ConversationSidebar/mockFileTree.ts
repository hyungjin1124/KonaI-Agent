import { FileTreeNode } from './types';

export const MOCK_FILE_TREE: FileTreeNode[] = [
  {
    id: 'folder-reports',
    name: '경영 보고서',
    type: 'folder',
    children: [
      {
        id: 'folder-2025-q4',
        name: '2025 Q4',
        type: 'folder',
        children: [
          { id: 'file-1', name: 'Q4_경영실적_보고서.pptx', type: 'file', extension: 'pptx', size: '4.2 MB', modifiedDate: '2025-12-28' },
          { id: 'file-2', name: 'Q4_매출분석_상세.xlsx', type: 'file', extension: 'xlsx', size: '1.8 MB', modifiedDate: '2025-12-27' },
          { id: 'file-3', name: 'Q4_사업부별_KPI.pdf', type: 'file', extension: 'pdf', size: '3.1 MB', modifiedDate: '2025-12-26' },
        ],
      },
      {
        id: 'folder-2025-q3',
        name: '2025 Q3',
        type: 'folder',
        children: [
          { id: 'file-4', name: 'Q3_실적보고서.pptx', type: 'file', extension: 'pptx', size: '3.8 MB', modifiedDate: '2025-10-05' },
          { id: 'file-5', name: 'Q3_원가분석.xlsx', type: 'file', extension: 'xlsx', size: '2.1 MB', modifiedDate: '2025-10-03' },
        ],
      },
    ],
  },
  {
    id: 'folder-contracts',
    name: '계약서',
    type: 'folder',
    children: [
      { id: 'file-6', name: 'A은행_납품계약서.pdf', type: 'file', extension: 'pdf', size: '890 KB', modifiedDate: '2025-12-10' },
      { id: 'file-7', name: 'B카드사_갱신계약.docx', type: 'file', extension: 'docx', size: '520 KB', modifiedDate: '2025-11-28' },
      { id: 'file-8', name: 'C카드_온보딩_MOU.pdf', type: 'file', extension: 'pdf', size: '1.2 MB', modifiedDate: '2025-11-15' },
    ],
  },
  {
    id: 'folder-analysis',
    name: '분석 자료',
    type: 'folder',
    children: [
      { id: 'file-9', name: '12월_매출심층분석.md', type: 'file', extension: 'md', size: '45 KB', modifiedDate: '2025-12-15' },
      { id: 'file-10', name: '원가율_추이_분석.xlsx', type: 'file', extension: 'xlsx', size: '980 KB', modifiedDate: '2025-12-12' },
      { id: 'file-11', name: '경쟁사_비교_데이터.csv', type: 'file', extension: 'csv', size: '320 KB', modifiedDate: '2025-10-05' },
      { id: 'file-12', name: 'DID_칩_수급현황.xlsx', type: 'file', extension: 'xlsx', size: '1.5 MB', modifiedDate: '2025-12-05' },
    ],
  },
  {
    id: 'folder-planning',
    name: '사업 기획',
    type: 'folder',
    children: [
      { id: 'file-13', name: '2026년_사업계획_초안.docx', type: 'file', extension: 'docx', size: '2.8 MB', modifiedDate: '2025-12-10' },
      { id: 'file-14', name: '해외지사_통합비용_시뮬레이션.xlsx', type: 'file', extension: 'xlsx', size: '1.1 MB', modifiedDate: '2025-11-20' },
      { id: 'file-15', name: '신규_플랫폼_기획안.md', type: 'file', extension: 'md', size: '28 KB', modifiedDate: '2025-12-20' },
    ],
  },
  { id: 'file-16', name: '조직도_2025.pdf', type: 'file', extension: 'pdf', size: '450 KB', modifiedDate: '2025-01-15' },
  { id: 'file-17', name: '회의록_12월.docx', type: 'file', extension: 'docx', size: '180 KB', modifiedDate: '2025-12-28' },
];
