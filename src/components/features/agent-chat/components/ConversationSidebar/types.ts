export type SidebarMode = 'chat-history' | 'file-directory';

export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: string;
  modifiedDate?: string;
  children?: FileTreeNode[];
}

export const FILE_TREE_DRAG_MIME_TYPE = 'application/x-konai-filetree';
