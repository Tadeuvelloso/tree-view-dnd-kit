import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {
  type Announcements,
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  DragOverlay,
  type DragMoveEvent,
  type DragEndEvent,
  type DragOverEvent,
  MeasuringStrategy,
  type DropAnimation,
  type Modifier,
  defaultDropAnimation,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  buildTree,
  flattenTree,
  getProjection,
  getChildCount,
  removeChildrenOf,
} from './utilities.ts';
import { toggleTreeItemProperty } from '../../utils/treeUtils.ts';
import {sortableTreeKeyboardCoordinates} from './keyboardCoordinates.ts';
import {CSS} from '@dnd-kit/utilities';
import type { FlattenedItem, SensorContext } from './types.ts';
import type { TreeData } from '../../types/TreeItem';
import { SortableTreeItem } from '../TreeItem/index.ts';

type TreeItems = TreeData;

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimationConfig: DropAnimation = {
  keyframes({transform}) {
    return [
      {opacity: 1, transform: CSS.Transform.toString(transform.initial)},
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: 'ease-out',
  sideEffects({active}) {
    active.node.animate([{opacity: 0}, {opacity: 1}], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

interface Props {
  defaultItems: TreeData;
  indicator?: boolean;
  indentationWidth?: number;
  maxDepth?: number;
  canDrop?: (source: any, target: any) => boolean;
  canDrag?: (item: any) => boolean;
  canChangeParent?: boolean;
  renderItem?: (item: any, options: RenderItemOptions) => React.ReactNode;
}

interface RenderItemOptions {
  depth: number;
  isCollapsed: boolean;
  hasChildren: boolean;
  isDraggable: boolean;
  isBeingDragged: boolean;
  onCollapse?: () => void;
}

export function SortableTree({
  defaultItems,
  indicator = false,
  indentationWidth = 50,
  maxDepth,
  canDrop,
  canDrag,
  canChangeParent = true,
}: Props) {
  const [items, setItems] = useState(defaultItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: UniqueIdentifier | null;
    overId: UniqueIdentifier;
  } | null>(null);

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<UniqueIdentifier[]>(
      (acc, {children, collapsed, id}) =>
        collapsed && children.length ? [...acc, id] : acc,
      []
    );

    let filteredItems = removeChildrenOf(
      flattenedTree,
      activeId != null ? [activeId, ...collapsedItems] : collapsedItems
    );

    if (maxDepth !== undefined) {
      filteredItems = filteredItems.filter(item => item.depth <= maxDepth);
    }

    return filteredItems;
  }, [activeId, items, maxDepth]);
  const projected = activeId && overId ? getProjection(
    flattenedItems,
    activeId,
    overId,
    offsetLeft,
    indentationWidth
  ) : null;
  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });
  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth)
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const sortedIds = useMemo(() => flattenedItems.map(({id}) => id), [flattenedItems]);
  const activeItem = activeId
    ? flattenedItems.find(({id}) => id === activeId)
    : null;

  function isItemLocked(item: any): boolean {
    if (!item) return false;
    
    if (item.metadata?.editable === false) {
      return true;
    }
    
    if (item.metadata?.owner === 'system' || item.metadata?.owner === 'admin') {
      return true;
    }
    
    if (item.metadata?.type === 'system') {
      return true;
    }
    
    return false;
  }

  function findOriginalItem(items: TreeItems, targetId: UniqueIdentifier): any {
    for (const item of items) {
      if (item.id === targetId) return item;
      if (item.children.length > 0) {
        const found = findOriginalItem(item.children, targetId);
        if (found) return found;
      }
    }
    return null;
  }

  function handleCollapse(id: UniqueIdentifier) {
    setItems(prevItems => toggleTreeItemProperty(prevItems, id, 'collapsed'));
  }

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  const announcements: Announcements = {
    onDragStart({active}) {
      return `Picked up ${active.id}.`;
    },
    onDragMove({active, over}) {
      return getMovementAnnouncement('onDragMove', active.id, over?.id);
    },
    onDragOver({active, over}) {
      return getMovementAnnouncement('onDragOver', active.id, over?.id);
    },
    onDragEnd({active, over}) {
      return getMovementAnnouncement('onDragEnd', active.id, over?.id);
    },
    onDragCancel({active}) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`;
    },
  };

  return (
    <DndContext
      accessibility={{announcements}}
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        {flattenedItems.map(({id, collapsed, depth}) => {
          const originalItem = findOriginalItem(items, id);
          const hasOriginalChildren = originalItem && originalItem.children.length > 0;
          
          const isDraggable = canDrag ? canDrag(originalItem) : true;
          const isLocked = !isDraggable || isItemLocked(originalItem);
          
          return (
            <SortableTreeItem
              key={id}
              id={id}
              value={originalItem.title}
              depth={depth}
              indentationWidth={indentationWidth}
              indicator={indicator}
              collapsed={Boolean(collapsed)}
              childCount={originalItem?.children.length || 0}
              isDraggable={isDraggable}
              isLocked={isLocked}
              onCollapse={
                hasOriginalChildren
                  ? () => handleCollapse(id)
                  : undefined
              }
            />
          );
        })}
        {createPortal(
          <DragOverlay
            dropAnimation={dropAnimationConfig}
            modifiers={indicator ? [adjustTranslate] : undefined}
          >
            {activeId && activeItem ? (
              <SortableTreeItem
                id={activeId}
                depth={activeItem.depth}
                clone
                childCount={getChildCount(items, activeId) + 1}
                value={findOriginalItem(items, activeId)?.title || activeId.toString()}
                indentationWidth={indentationWidth}
                isLocked={(() => {
                  const originalItem = findOriginalItem(items, activeId);
                  const isDraggable = canDrag ? canDrag(originalItem) : true;
                  return !isDraggable || isItemLocked(originalItem);
                })()}
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </SortableContext>
    </DndContext>
  );

  function handleDragStart({active: {id: activeId}}: DragStartEvent) {
    if (canDrag) {
      const sourceItem = findOriginalItem(items, activeId);
      
      if (!canDrag(sourceItem)) {
        return;
      }
    }
    
    setActiveId(activeId);

    setOverId(activeId);

    const activeItem = flattenedItems.find(({id}) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }

    document.body.style.setProperty('cursor', 'grabbing');
  }

  function handleDragMove({delta}: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({over}: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({active, over}: DragEndEvent) {
    resetState();

    if (projected && over) {
      const {depth, parentId} = projected;
      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({id}) => id === over.id);
      const activeIndex = clonedItems.findIndex(({id}) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];
      const currentParentId = activeTreeItem.parentId;

      if (!canChangeParent && currentParentId !== parentId) {
        return; 
      }

      if (canDrop) {
        const sourceItem = findOriginalItem(items, active.id);
        const targetItem = findOriginalItem(items, over.id);
        
        if (!canDrop(sourceItem, targetItem)) {
          return; 
        }
      }

      if (maxDepth !== undefined && depth > maxDepth) {
        return; 
      }

      clonedItems[activeIndex] = {...activeTreeItem, depth, parentId};

      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      const newItems = buildTree(sortedItems);
      
      setItems(newItems as TreeData);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty('cursor', '');
  }

  function getMovementAnnouncement(
    eventName: string,
    activeId: UniqueIdentifier,
    overId?: UniqueIdentifier
  ) {
    if (overId && projected) {
      if (eventName !== 'onDragEnd') {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items))
      );
      const overIndex = clonedItems.findIndex(({id}) => id === overId);
      const activeIndex = clonedItems.findIndex(({id}) => id === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb = eventName === 'onDragEnd' ? 'dropped' : 'moved';
      const nestedVerb = eventName === 'onDragEnd' ? 'dropped' : 'nested';

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling: FlattenedItem | undefined = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId: UniqueIdentifier | null = previousSibling.parentId;
            previousSibling = sortedItems.find(({id}) => id === parentId);
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
          }
        }
      }

      return announcement;
    }

    return;
  }
}

const adjustTranslate: Modifier = ({transform}) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};