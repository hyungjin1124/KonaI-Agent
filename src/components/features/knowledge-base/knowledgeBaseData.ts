/**
 * Knowledge Base Management — Types & Mock Data
 *
 * Collection-based knowledge store with documents, metadata, and status tracking.
 */

// --- Types ---

export type DocumentStatus = 'indexed' | 'processing' | 'failed' | 'pending';
export type DocumentType = 'pdf' | 'docx' | 'xlsx' | 'csv' | 'txt' | 'md' | 'pptx' | 'html';

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: DocumentType;
  size: number; // bytes
  uploadedAt: string;
  uploadedBy: string;
  status: DocumentStatus;
  chunks?: number;
}

export interface KnowledgeCollection {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  totalSize: number; // bytes
  status: 'active' | 'updating' | 'error';
  accessLevel: 'public' | 'private' | 'restricted';
  lastUpdated: string;
  createdBy: string;
  color: string;
  documents: KnowledgeDocument[];
}

// --- Helpers ---

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    pdf: 'PDF',
    docx: 'Word',
    xlsx: 'Excel',
    csv: 'CSV',
    txt: 'Text',
    md: 'Markdown',
    pptx: 'PowerPoint',
    html: 'HTML',
  };
  return labels[type];
}

export function filterDocuments(
  documents: KnowledgeDocument[],
  search: string,
  typeFilter: string,
): KnowledgeDocument[] {
  return documents.filter(doc => {
    const matchesSearch = !search || doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });
}

// --- Mock Data ---

const HR_DOCUMENTS: KnowledgeDocument[] = [
  { id: 'hr-1', name: '2026년 취업규칙.pdf', type: 'pdf', size: 2_450_000, uploadedAt: '2026-02-15', uploadedBy: '김인사', status: 'indexed', chunks: 48 },
  { id: 'hr-2', name: '연차휴가 규정.docx', type: 'docx', size: 340_000, uploadedAt: '2026-02-15', uploadedBy: '김인사', status: 'indexed', chunks: 12 },
  { id: 'hr-3', name: '급여 체계 안내.xlsx', type: 'xlsx', size: 1_200_000, uploadedAt: '2026-02-20', uploadedBy: '박급여', status: 'indexed', chunks: 28 },
  { id: 'hr-4', name: '복리후생 가이드.pdf', type: 'pdf', size: 890_000, uploadedAt: '2026-03-01', uploadedBy: '김인사', status: 'indexed', chunks: 20 },
  { id: 'hr-5', name: '신입사원 온보딩 매뉴얼.pdf', type: 'pdf', size: 5_600_000, uploadedAt: '2026-03-05', uploadedBy: '이교육', status: 'processing' },
  { id: 'hr-6', name: '퇴직금 산정 기준.docx', type: 'docx', size: 180_000, uploadedAt: '2026-03-08', uploadedBy: '박급여', status: 'indexed', chunks: 8 },
  { id: 'hr-7', name: '직원 행동 강령.pdf', type: 'pdf', size: 420_000, uploadedAt: '2026-03-10', uploadedBy: '김인사', status: 'pending' },
];

const TECH_DOCUMENTS: KnowledgeDocument[] = [
  { id: 'tech-1', name: 'API 설계 가이드라인.md', type: 'md', size: 85_000, uploadedAt: '2026-01-20', uploadedBy: '최개발', status: 'indexed', chunks: 15 },
  { id: 'tech-2', name: '시스템 아키텍처 문서.pdf', type: 'pdf', size: 3_800_000, uploadedAt: '2026-02-01', uploadedBy: '최개발', status: 'indexed', chunks: 64 },
  { id: 'tech-3', name: '데이터베이스 스키마 v3.2.xlsx', type: 'xlsx', size: 560_000, uploadedAt: '2026-02-10', uploadedBy: '정DBA', status: 'indexed', chunks: 22 },
  { id: 'tech-4', name: '배포 프로세스 매뉴얼.docx', type: 'docx', size: 720_000, uploadedAt: '2026-02-18', uploadedBy: '이데옵스', status: 'indexed', chunks: 18 },
  { id: 'tech-5', name: 'Kubernetes 운영 가이드.pdf', type: 'pdf', size: 4_200_000, uploadedAt: '2026-02-25', uploadedBy: '이데옵스', status: 'indexed', chunks: 72 },
  { id: 'tech-6', name: '보안 점검 체크리스트.xlsx', type: 'xlsx', size: 290_000, uploadedAt: '2026-03-03', uploadedBy: '한보안', status: 'indexed', chunks: 10 },
  { id: 'tech-7', name: '장애 대응 절차서.pdf', type: 'pdf', size: 1_100_000, uploadedAt: '2026-03-07', uploadedBy: '최개발', status: 'indexed', chunks: 24 },
  { id: 'tech-8', name: 'CI/CD 파이프라인 설정.md', type: 'md', size: 45_000, uploadedAt: '2026-03-09', uploadedBy: '이데옵스', status: 'processing' },
  { id: 'tech-9', name: '모니터링 대시보드 구성.html', type: 'html', size: 32_000, uploadedAt: '2026-03-11', uploadedBy: '이데옵스', status: 'failed' },
];

const PRODUCT_DOCUMENTS: KnowledgeDocument[] = [
  { id: 'prod-1', name: '제품 카탈로그 2026.pdf', type: 'pdf', size: 12_400_000, uploadedAt: '2026-01-15', uploadedBy: '박마케팅', status: 'indexed', chunks: 156 },
  { id: 'prod-2', name: 'DID 솔루션 소개서.pptx', type: 'pptx', size: 8_900_000, uploadedAt: '2026-02-01', uploadedBy: '박마케팅', status: 'indexed', chunks: 42 },
  { id: 'prod-3', name: '고객 FAQ 목록.csv', type: 'csv', size: 420_000, uploadedAt: '2026-02-20', uploadedBy: '김CS', status: 'indexed', chunks: 85 },
  { id: 'prod-4', name: '경쟁사 분석 리포트.pdf', type: 'pdf', size: 6_700_000, uploadedAt: '2026-03-01', uploadedBy: '이전략', status: 'indexed', chunks: 98 },
  { id: 'prod-5', name: '기능 비교표.xlsx', type: 'xlsx', size: 380_000, uploadedAt: '2026-03-05', uploadedBy: '박마케팅', status: 'indexed', chunks: 16 },
  { id: 'prod-6', name: '릴리즈 노트 v2.4.md', type: 'md', size: 28_000, uploadedAt: '2026-03-10', uploadedBy: '최개발', status: 'indexed', chunks: 6 },
];

const COMPLIANCE_DOCUMENTS: KnowledgeDocument[] = [
  { id: 'comp-1', name: 'ISMS-P 인증 기준.pdf', type: 'pdf', size: 7_800_000, uploadedAt: '2026-01-10', uploadedBy: '한보안', status: 'indexed', chunks: 120 },
  { id: 'comp-2', name: '개인정보 처리방침.docx', type: 'docx', size: 560_000, uploadedAt: '2026-02-01', uploadedBy: '한보안', status: 'indexed', chunks: 18 },
  { id: 'comp-3', name: '정보보호 정책.pdf', type: 'pdf', size: 3_200_000, uploadedAt: '2026-02-15', uploadedBy: '한보안', status: 'indexed', chunks: 54 },
  { id: 'comp-4', name: '내부 감사 보고서 2025.pdf', type: 'pdf', size: 4_500_000, uploadedAt: '2026-02-28', uploadedBy: '강감사', status: 'indexed', chunks: 76 },
  { id: 'comp-5', name: '데이터 보존 기준.txt', type: 'txt', size: 15_000, uploadedAt: '2026-03-02', uploadedBy: '한보안', status: 'indexed', chunks: 4 },
  { id: 'comp-6', name: '접근 통제 매트릭스.xlsx', type: 'xlsx', size: 210_000, uploadedAt: '2026-03-08', uploadedBy: '한보안', status: 'processing' },
  { id: 'comp-7', name: 'AI 윤리 가이드라인.pdf', type: 'pdf', size: 1_900_000, uploadedAt: '2026-03-10', uploadedBy: '강감사', status: 'pending' },
  { id: 'comp-8', name: '개인정보 영향평가서.docx', type: 'docx', size: 890_000, uploadedAt: '2026-03-11', uploadedBy: '한보안', status: 'pending' },
];

export const MOCK_COLLECTIONS: KnowledgeCollection[] = [
  {
    id: 'col-hr',
    name: '인사/HR 정책',
    description: '취업규칙, 급여, 복리후생, 온보딩 관련 문서',
    documentCount: HR_DOCUMENTS.length,
    totalSize: HR_DOCUMENTS.reduce((sum, d) => sum + d.size, 0),
    status: 'active',
    accessLevel: 'restricted',
    lastUpdated: '2026-03-10',
    createdBy: '김인사',
    color: '#3B82F6',
    documents: HR_DOCUMENTS,
  },
  {
    id: 'col-tech',
    name: '기술 문서',
    description: 'API, 아키텍처, 배포, 보안, 인프라 운영 문서',
    documentCount: TECH_DOCUMENTS.length,
    totalSize: TECH_DOCUMENTS.reduce((sum, d) => sum + d.size, 0),
    status: 'updating',
    accessLevel: 'private',
    lastUpdated: '2026-03-11',
    createdBy: '최개발',
    color: '#10B981',
    documents: TECH_DOCUMENTS,
  },
  {
    id: 'col-product',
    name: '제품/영업 자료',
    description: '제품 카탈로그, 소개서, FAQ, 경쟁 분석, 릴리즈 노트',
    documentCount: PRODUCT_DOCUMENTS.length,
    totalSize: PRODUCT_DOCUMENTS.reduce((sum, d) => sum + d.size, 0),
    status: 'active',
    accessLevel: 'public',
    lastUpdated: '2026-03-10',
    createdBy: '박마케팅',
    color: '#F59E0B',
    documents: PRODUCT_DOCUMENTS,
  },
  {
    id: 'col-compliance',
    name: '컴플라이언스/보안',
    description: 'ISMS-P, 개인정보, 정보보호, 감사 관련 문서',
    documentCount: COMPLIANCE_DOCUMENTS.length,
    totalSize: COMPLIANCE_DOCUMENTS.reduce((sum, d) => sum + d.size, 0),
    status: 'active',
    accessLevel: 'restricted',
    lastUpdated: '2026-03-11',
    createdBy: '한보안',
    color: '#EF4444',
    documents: COMPLIANCE_DOCUMENTS,
  },
];

export const DOCUMENT_TYPES: DocumentType[] = ['pdf', 'docx', 'xlsx', 'csv', 'txt', 'md', 'pptx', 'html'];
