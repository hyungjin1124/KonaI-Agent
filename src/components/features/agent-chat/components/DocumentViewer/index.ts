export { DocumentViewer } from './DocumentViewer';
// PDFViewer, XLSXViewer, CSVViewer are intentionally NOT re-exported here.
// They use libraries that crash during SSR, so they must only be loaded via
// dynamic(() => import(...), { ssr: false }) inside DocumentViewer.
export { DOCXViewer } from './DOCXViewer';
export { PPTXInfoCard } from './PPTXInfoCard';
export { DocumentViewerToolbar } from './DocumentViewerToolbar';
export { DocumentTOCSidebar } from './DocumentTOCSidebar';
export { CitationSidePanel } from './CitationSidePanel';
export { FullscreenPortal } from './FullscreenPortal';
export { useDocumentTOC } from './useDocumentTOC';
export type { TOCItem, Citation, ViewMode } from './types';
