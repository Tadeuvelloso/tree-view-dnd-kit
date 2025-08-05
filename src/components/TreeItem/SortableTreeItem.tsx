import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TreeItem, type Props as TreeItemProps } from './TreeItem';
import type { UniqueIdentifier } from '@dnd-kit/core';

interface Props extends TreeItemProps {
  id: UniqueIdentifier;
}

export function SortableTreeItem({ id, depth, isDraggable = true, ...props }: Props) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    disabled: !isDraggable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      ghost={isDragging}
      disableSelection={false}
      disableInteraction={isSorting}
      isDraggable={isDraggable}
      handleProps={isDraggable ? { ...attributes, ...listeners } : {}}
      {...props}
    />
  );
}