import type { UniqueIdentifier } from '@dnd-kit/core';
import type { ReactNode } from 'react';

export interface TreeItem {
  id: UniqueIdentifier;
  title: string;
  children: TreeItem[];
  collapsed?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  metadata?: Record<string, any>;
}

export interface FlattenedTreeItem extends TreeItem {
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
  path: string;
}

export type TreeData = TreeItem[]; 