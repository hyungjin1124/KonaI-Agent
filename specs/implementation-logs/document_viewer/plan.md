# Plan: Document Viewer (docx/pdf/pptx)

## 파일 구조

| 파일 경로 | 역할 | 신규/수정 |
|-----------|------|-----------|
| `src/components/features/agent-chat/components/DocumentViewer/DocumentViewer.tsx` | 통합 문서 뷰어 (format 분기) | 신규 |
| `src/components/features/agent-chat/components/DocumentViewer/PDFViewer.tsx` | PDF 뷰어 (react-pdf) | 신규 |
| `src/components/features/agent-chat/components/DocumentViewer/DOCXViewer.tsx` | DOCX 뷰어 (docx-preview) | 신규 |
| `src/components/features/agent-chat/components/DocumentViewer/DocumentViewerToolbar.tsx` | 공통 뷰어 툴바 | 신규 |
| `src/components/features/agent-chat/components/DocumentViewer/index.ts` | 배럴 export | 신규 |
| `src/components/features/agent-chat/types.ts` | ArtifactType 확장 (`'pdf' \| 'docx'`) + AttachedFile binary 지원 | 수정 |
| `src/components/features/agent-chat/components/ArtifactPreviewPanel/ArtifactPreviewPanel.tsx` | `previewType: 'pdf' \| 'docx'` 분기 추가 | 수정 |
| `src/components/features/agent-chat/components/RightSidebar/ArtifactsSection.tsx` | PDF/DOCX 아이콘 추가 | 수정 |
| `src/components/features/agent-chat/components/ChatInputArea/ChatInputArea.tsx` | `.pdf, .docx` accept + binary 처리 | 수정 |

## Props Interface

```typescript
// DocumentViewer — 통합 진입점
interface DocumentViewerProps {
  fileData: ArrayBuffer;
  fileName: string;
  fileType: 'pdf' | 'docx';
  onClose: () => void;
}

// PDFViewer
interface PDFViewerProps {
  fileData: ArrayBuffer;
  fileName: string;
}

// DOCXViewer
interface DOCXViewerProps {
  fileData: ArrayBuffer;
  fileName: string;
}

// DocumentViewerToolbar
interface DocumentViewerToolbarProps {
  fileName: string;
  fileType: 'pdf' | 'docx';
  // PDF specific
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // Zoom
  zoom: number;
  onZoomChange: (zoom: number) => void;
  // Actions
  onDownload: () => void;
  onClose: () => void;
}
```

## 상태 설계

- **PDFViewer**: `numPages`, `currentPage`, `zoom` (useState)
- **DOCXViewer**: `isLoading`, `error` (useState), containerRef (useRef)
- **DocumentViewerToolbar**: stateless (상위에서 상태 전달)
- **ArtifactPreviewPanel**: 기존 previewType에 `'pdf' | 'docx'` 추가, `documentData?: ArrayBuffer` 필드 추가

## 통합 지점

1. **ArtifactPreviewPanel** — `previewType: 'pdf' | 'docx'` 분기 추가, DocumentViewer 렌더링
2. **ArtifactsSection** — `getArtifactIcon()` switch에 pdf/docx 아이콘 추가
3. **ChatInputArea** — file accept에 `.pdf, .docx` 추가, binary 파일은 `readAsArrayBuffer` 사용
4. **types.ts** — `ArtifactType`에 `'pdf' | 'docx'` 추가, `AttachedFile`에 `arrayBuffer?: ArrayBuffer` 추가

## Acceptance Criteria 매핑

| # | Criteria | 구현 위치 |
|---|----------|-----------|
| 1 | ArtifactPreviewPanel에 `previewType: 'pdf'` 분기 추가 + PDF 렌더링 | ArtifactPreviewPanel.tsx + PDFViewer.tsx |
| 2 | PDF 페이지 내비게이션 (이전/다음/점프), 줌 (fit-to-page/width), 다운로드 | DocumentViewerToolbar.tsx + PDFViewer.tsx |
| 3 | ChatInputArea에서 `.pdf` 드래그앤드롭 및 파일 선택기 업로드 | ChatInputArea.tsx |
| 4 | ArtifactType에 `'pdf'` 추가, ArtifactsSection PDF 아이콘 | types.ts + ArtifactsSection.tsx |
| 5 | `docx-preview`로 DOCX 스타일/테이블/이미지 렌더링 | DOCXViewer.tsx |
| 6 | 접근성: aria 속성, 스크린 리더 | DocumentViewerToolbar.tsx |

## 라이브러리

- `react-pdf` (v9.x) — PDF 렌더링 (MIT)
- `pdfjs-dist` — react-pdf의 PDF.js 엔진 (Apache 2.0)
- `docx-preview` — DOCX → HTML 렌더링 (MIT)
