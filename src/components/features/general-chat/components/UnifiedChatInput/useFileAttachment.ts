import { useState, useRef, useCallback, useEffect } from 'react';
import type { AttachedFile } from '../../../agent-chat/types';
import { ARTIFACT_DRAG_MIME_TYPE, FILE_TREE_DRAG_MIME_TYPE } from '../../../agent-chat/types';
import {
  MAX_FILES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
  ALLOWED_EXTENSIONS,
  getFileType,
  isBinaryFile,
  isImageFile,
} from './constants';

interface UseFileAttachmentOptions {
  onValidationError?: (message: string) => void;
}

interface UseFileAttachmentReturn {
  attachedFiles: AttachedFile[];
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dragHandlers: {
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
}

function validateFile(
  file: File,
  currentCount: number,
  onError?: (message: string) => void,
): boolean {
  // Check max files
  if (currentCount >= MAX_FILES) {
    onError?.(`최대 ${MAX_FILES}개의 파일만 첨부할 수 있습니다.`);
    return false;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    onError?.(`파일 크기가 ${MAX_FILE_SIZE_LABEL}을 초과합니다: ${file.name}`);
    return false;
  }

  // Check file extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    // Also accept image MIME types (for clipboard pastes that may have generic names)
    if (!file.type.startsWith('image/')) {
      onError?.(`지원하지 않는 파일 형식입니다: ${file.name}`);
      return false;
    }
  }

  return true;
}

function readFile(file: File): Promise<AttachedFile> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const isImage = isImageFile(file.name) || file.type.startsWith('image/');

    if (isBinaryFile(file.name)) {
      reader.onload = (e) => {
        resolve({
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          type: getFileType(file.name),
          content: '',
          size: file.size,
          lastModified: new Date(file.lastModified),
          arrayBuffer: e.target?.result as ArrayBuffer,
        });
      };
      reader.readAsArrayBuffer(file);
    } else if (isImage) {
      reader.onload = (e) => {
        resolve({
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name || `image-${Date.now()}.png`,
          type: 'image',
          content: e.target?.result as string, // data URL for preview
          size: file.size,
          lastModified: new Date(file.lastModified),
        });
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (e) => {
        resolve({
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          type: getFileType(file.name),
          content: e.target?.result as string,
          size: file.size,
          lastModified: new Date(file.lastModified),
        });
      };
      reader.readAsText(file);
    }
  });
}

export function useFileAttachment(
  options: UseFileAttachmentOptions = {},
): UseFileAttachmentReturn {
  const { onValidationError } = options;
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounterRef = useRef(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];

      for (const file of fileArray) {
        if (validateFile(file, attachedFiles.length + validFiles.length, onValidationError)) {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      const readPromises = validFiles.map(readFile);
      const newAttachedFiles = await Promise.all(readPromises);

      setAttachedFiles((prev) => [...prev, ...newAttachedFiles]);
    },
    [attachedFiles.length, onValidationError],
  );

  const removeFile = useCallback((id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setAttachedFiles([]);
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        addFiles(imageFiles);
      }
      // If no images, let the default paste behavior handle text
    },
    [addFiles],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      e.target.value = '';
    },
    [addFiles],
  );

  const handleImageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      e.target.value = '';
    },
    [addFiles],
  );

  // Drag & Drop handlers (counter-based flicker prevention)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      // 1) App internal artifact drag
      const artifactDataStr = e.dataTransfer.getData(ARTIFACT_DRAG_MIME_TYPE);
      if (artifactDataStr) {
        try {
          const data = JSON.parse(artifactDataStr);
          const artifactFile: AttachedFile = {
            id: `artifact-${Date.now()}`,
            name: data.title,
            type: data.type === 'markdown' ? 'markdown' : 'other',
            content: '',
            size: 0,
            lastModified: new Date(),
            sourceArtifactId: data.id,
            artifactType: data.type,
          };
          setAttachedFiles((prev) => {
            if (prev.length >= MAX_FILES) {
              onValidationError?.(`최대 ${MAX_FILES}개의 파일만 첨부할 수 있습니다.`);
              return prev;
            }
            return [...prev, artifactFile];
          });
          return;
        } catch {
          /* fallthrough to file tree or native */
        }
      }

      // 2) File tree drag
      const fileTreeDataStr = e.dataTransfer.getData(FILE_TREE_DRAG_MIME_TYPE);
      if (fileTreeDataStr) {
        try {
          const data = JSON.parse(fileTreeDataStr) as { id: string; name: string; extension: string };
          const treeFile: AttachedFile = {
            id: `filetree-${Date.now()}`,
            name: data.name,
            type: getFileType(data.name),
            content: '',
            size: 0,
            lastModified: new Date(),
          };
          setAttachedFiles((prev) => {
            if (prev.length >= MAX_FILES) {
              onValidationError?.(`최대 ${MAX_FILES}개의 파일만 첨부할 수 있습니다.`);
              return prev;
            }
            return [...prev, treeFile];
          });
          return;
        } catch {
          /* fallthrough to native */
        }
      }

      // 3) OS native file drop
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles, onValidationError],
  );

  // Cleanup drag counter on unmount
  useEffect(() => {
    return () => {
      dragCounterRef.current = 0;
    };
  }, []);

  return {
    attachedFiles,
    isDragging,
    fileInputRef,
    imageInputRef,
    addFiles,
    removeFile,
    clearFiles,
    handlePaste,
    handleFileInputChange,
    handleImageInputChange,
    dragHandlers: {
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
