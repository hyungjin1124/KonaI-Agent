import type { AttachedFile } from '../../../agent-chat/types';

export const MAX_FILES = 5;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE_LABEL = '10MB';

export const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
export const ALLOWED_DOCUMENT_EXTENSIONS = [
  '.pdf', '.docx', '.xlsx', '.xls', '.csv', '.txt', '.md', '.json', '.yaml', '.yml', '.pptx', '.ppt',
];
export const ALLOWED_EXTENSIONS = [...ALLOWED_IMAGE_EXTENSIONS, ...ALLOWED_DOCUMENT_EXTENSIONS];

export const BINARY_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.xls', '.pptx', '.ppt'];

export const ALLOWED_MIME_IMAGES = 'image/png,image/jpeg,image/gif,image/webp';
export const ALLOWED_ACCEPT_ALL = [
  ...ALLOWED_EXTENSIONS,
  ALLOWED_MIME_IMAGES,
].join(',');

export const getFileType = (filename: string): AttachedFile['type'] => {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.md')) return 'markdown';
  if (lower.endsWith('.txt') || lower.endsWith('.json') || lower.endsWith('.yaml') || lower.endsWith('.yml')) return 'text';
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx';
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) return 'pptx';
  if (ALLOWED_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))) return 'image';
  return 'other';
};

export const isBinaryFile = (filename: string): boolean =>
  BINARY_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));

export const isImageFile = (filename: string): boolean =>
  ALLOWED_IMAGE_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
