import { ArtifactType, Artifact } from '../components/features/agent-chat/types';

// =============================================
// Artifact Library Types (Phase 2)
// =============================================

/** 라이브러리에 저장된 아티팩트 (Artifact 확장) */
export interface LibraryArtifact {
  id: string;
  title: string;
  type: ArtifactType;
  createdAt: Date;
  updatedAt: Date;
  messageId: string;
  conversationId: string;
  fileSize?: string;
  isFavorited: boolean;
  tags: string[];
  versionCount: number;
  lastAccessedAt: Date;
}

/** 아티팩트 버전 항목 */
export interface ArtifactVersion {
  id: string;
  artifactId: string;
  versionNumber: number;
  content: string;
  createdAt: Date;
  messageId?: string;
  changeDescription?: string;
}

/** 유형 필터 카테고리 */
export const ARTIFACT_TYPE_FILTERS: { label: string; types: ArtifactType[] }[] = [
  { label: '문서', types: ['document', 'markdown', 'docx'] },
  { label: '프레젠테이션', types: ['ppt', 'pptx', 'slide-outline'] },
  { label: '스프레드시트', types: ['xlsx', 'csv'] },
  { label: 'PDF', types: ['pdf'] },
  { label: '차트', types: ['chart'] },
  { label: '이미지', types: ['image'] },
];

/** 필터 상태 */
export interface ArtifactFilter {
  types: ArtifactType[];
  searchQuery: string;
  sortBy: 'created' | 'modified' | 'name' | 'accessed';
  sortDirection: 'asc' | 'desc';
  favoritesOnly: boolean;
}

/** 기본 필터 값 */
export const DEFAULT_ARTIFACT_FILTER: ArtifactFilter = {
  types: [],
  searchQuery: '',
  sortBy: 'modified',
  sortDirection: 'desc',
  favoritesOnly: false,
};

/** Library Context 값 */
export interface ArtifactLibraryContextValue {
  libraryArtifacts: LibraryArtifact[];
  versions: Record<string, ArtifactVersion[]>;
  filter: ArtifactFilter;
  setFilter: (filter: Partial<ArtifactFilter>) => void;
  filteredArtifacts: LibraryArtifact[];
  saveArtifact: (artifact: Artifact, content?: string, conversationId?: string) => void;
  deleteArtifact: (artifactId: string) => void;
  toggleFavorite: (artifactId: string) => void;
  saveVersion: (artifactId: string, content: string, changeDescription?: string) => void;
  restoreVersion: (artifactId: string, versionId: string) => void;
  getVersions: (artifactId: string) => ArtifactVersion[];
  getArtifactsByConversation: (conversationId: string) => LibraryArtifact[];
  getArtifactByMessageId: (messageId: string) => LibraryArtifact | undefined;
}

// =============================================
// Serialization Helpers (localStorage 용)
// =============================================

export interface SerializedLibraryArtifact extends Omit<LibraryArtifact, 'createdAt' | 'updatedAt' | 'lastAccessedAt'> {
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
}

export interface SerializedArtifactVersion extends Omit<ArtifactVersion, 'createdAt'> {
  createdAt: string;
}
