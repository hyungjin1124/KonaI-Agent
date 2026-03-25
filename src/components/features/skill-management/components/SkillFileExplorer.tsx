'use client';

import React from 'react';
import {
  FileText, Code, Image as ImageIcon, File, Folder,
} from 'lucide-react';
import type { SkillAttachment } from '@/types/skill-management.types';

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

interface FileEntry {
  name: string;
  fileType: 'text' | 'script' | 'binary';
  isMain: boolean;
  attachment?: SkillAttachment;
}

type TreeNode =
  | { type: 'folder'; name: string; children: FileEntry[] }
  | { type: 'file'; entry: FileEntry };

function buildFileTree(files: FileEntry[]): TreeNode[] {
  const root: TreeNode[] = [];
  const folderMap = new Map<string, FileEntry[]>();

  for (const file of files) {
    if (file.isMain) {
      root.push({ type: 'file', entry: file });
      continue;
    }
    const fullPath = file.attachment?.path ?? file.name;
    const slashIdx = fullPath.indexOf('/');
    if (slashIdx === -1) {
      root.push({ type: 'file', entry: file });
    } else {
      const folderName = fullPath.slice(0, slashIdx);
      const existing = folderMap.get(folderName);
      if (existing) {
        existing.push(file);
      } else {
        const children: FileEntry[] = [file];
        folderMap.set(folderName, children);
        root.push({ type: 'folder', name: folderName, children });
      }
    }
  }

  return root;
}

function getFileIcon(fileType: FileEntry['fileType'], isMain: boolean) {
  if (isMain) return <FileText size={13} className="text-gray-500 shrink-0" />;
  if (fileType === 'script') return <Code size={13} className="text-amber-500 shrink-0" />;
  if (fileType === 'binary') return <ImageIcon size={13} className="text-violet-500 shrink-0" />;
  return <FileText size={13} className="text-blue-500 shrink-0" />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FileTree
// ─────────────────────────────────────────────────────────────────────────────

function FileTree({
  tree,
  selectedFile,
  onFileSelect,
}: {
  tree: TreeNode[];
  selectedFile: string;
  onFileSelect: (name: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {tree.map((node) => {
        if (node.type === 'folder') {
          return (
            <div key={node.name}>
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide select-none">
                <Folder size={11} className="shrink-0" />
                <span className="truncate">{node.name}</span>
              </div>
              {node.children.map((file) => (
                <button
                  key={file.name}
                  onClick={() => onFileSelect(file.name)}
                  className={[
                    'flex items-center gap-1.5 pl-6 pr-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left w-full',
                    selectedFile === file.name
                      ? 'bg-white text-gray-900 border border-gray-200'
                      : 'text-gray-500 hover:bg-white/70 hover:text-gray-700',
                  ].join(' ')}
                >
                  {selectedFile === file.name && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-900 shrink-0 -ml-1" />
                  )}
                  {getFileIcon(file.fileType, file.isMain)}
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>
          );
        }
        // Root-level file
        const file = node.entry;
        return (
          <button
            key={file.name}
            onClick={() => onFileSelect(file.name)}
            className={[
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left',
              selectedFile === file.name
                ? 'bg-white text-gray-900 border border-gray-200'
                : 'text-gray-500 hover:bg-white/70 hover:text-gray-700',
            ].join(' ')}
          >
            {selectedFile === file.name && (
              <span className="w-1.5 h-1.5 rounded-full bg-gray-900 shrink-0" />
            )}
            {getFileIcon(file.fileType, file.isMain)}
            <span className="truncate">{file.name}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FileContentView
// ─────────────────────────────────────────────────────────────────────────────

function FileContentView({
  instructionBody,
  attachments,
  selectedFile,
}: {
  instructionBody: string;
  attachments: SkillAttachment[];
  selectedFile: string;
}) {
  if (selectedFile === 'SKILL.md') {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-950 overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 border-b border-gray-700">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
          <span className="ml-auto text-xs text-gray-500 font-mono">SKILL.md</span>
        </div>
        <pre className="p-4 text-xs font-mono text-gray-200 leading-relaxed overflow-x-auto whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto custom-scrollbar">
          <code>{instructionBody}</code>
        </pre>
      </div>
    );
  }

  const attachment = attachments.find((a) => a.fileName === selectedFile);
  if (!attachment) return null;

  if (attachment.fileType === 'binary') {
    const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(attachment.fileName);
    if (isImage && attachment.content) {
      return (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <ImageIcon size={13} className="text-violet-500" />
            <span className="text-xs text-gray-600 font-mono">{attachment.fileName}</span>
          </div>
          <div className="p-4 bg-gray-50 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachment.content}
              alt={attachment.fileName}
              className="max-w-full max-h-64 rounded-lg"
            />
          </div>
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
            <File size={20} className="text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{attachment.fileName}</p>
            <p className="text-xs text-gray-400">
              {attachment.fileType} · {formatBytes(attachment.size)}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 italic">미리보기를 지원하지 않는 파일 형식입니다.</p>
      </div>
    );
  }

  // text or script
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-950 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-900 border-b border-gray-700">
        <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
        <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
        <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
        <span className="ml-auto text-xs text-gray-500 font-mono">{attachment.fileName}</span>
      </div>
      <pre
        className={[
          'p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto custom-scrollbar',
          attachment.fileType === 'script' ? 'text-amber-200' : 'text-gray-200',
        ].join(' ')}
      >
        <code>{attachment.content ?? '(내용 없음)'}</code>
      </pre>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SkillFileExplorer (exported)
// ─────────────────────────────────────────────────────────────────────────────

export interface SkillFileExplorerProps {
  instructionBody: string;
  attachments: SkillAttachment[];
  selectedFile: string;
  onFileSelect: (fileName: string) => void;
}

export function SkillFileExplorer({
  instructionBody,
  attachments,
  selectedFile,
  onFileSelect,
}: SkillFileExplorerProps) {
  const allFiles: FileEntry[] = [
    { name: 'SKILL.md', fileType: 'text', isMain: true },
    ...attachments.map((a) => ({
      name: a.fileName,
      fileType: a.fileType,
      isMain: false,
      attachment: a,
    })),
  ];
  const hasMultipleFiles = allFiles.length > 1;
  const tree = buildFileTree(allFiles);

  return (
    <>
      {/* File tree */}
      {hasMultipleFiles && (
        <div className="shrink-0 border-b border-gray-100 bg-gray-50/50 px-3 py-2">
          <FileTree tree={tree} selectedFile={selectedFile} onFileSelect={onFileSelect} />
        </div>
      )}

      {/* File content */}
      <div className="px-5 pt-4 pb-2">
        <FileContentView
          instructionBody={instructionBody}
          attachments={attachments}
          selectedFile={selectedFile}
        />
      </div>
    </>
  );
}
