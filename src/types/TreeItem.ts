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

export interface FlatTreeItem {
  id: string;
  title: string;
  parent: string | null;
  order: number;
  disabled?: boolean;
  icon?: string;
  metadata?: Record<string, any>;
}

export type TreeData = TreeItem[];
export type FlatTreeData = FlatTreeItem[];

export interface TreeViewConfig {
  allowReorder?: boolean;
  allowCollapse?: boolean;
  indentationWidth?: number;
  showIcons?: boolean;
  maxDepth?: number;
  multiSelect?: boolean;
}

export interface TreeEventHandlers {
  onItemMove?: (draggedId: UniqueIdentifier, targetId: UniqueIdentifier, position: 'before' | 'after' | 'inside') => void;
  onItemSelect?: (id: UniqueIdentifier, selected: boolean) => void;
  onItemToggle?: (id: UniqueIdentifier, collapsed: boolean) => void;
}

export interface TreeOperations {
  loadItems: () => Promise<FlatTreeData>;
  saveItems: (items: FlatTreeData) => Promise<void>;
} 