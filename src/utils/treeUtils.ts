import type { TreeData, TreeItem } from '../types/TreeItem';
import type { UniqueIdentifier } from '@dnd-kit/core';

/**
 * Toggles a boolean property of a specific item in a tree structure
 * @param items Tree data array
 * @param targetId ID of the item to toggle
 * @param property Property name to toggle
 * @returns New tree data with the property toggled
 */
export const toggleTreeItemProperty = <T extends keyof TreeItem>(
  items: TreeData,
  targetId: UniqueIdentifier,
  property: T
): TreeData => {
  return items.map(item => {
    if (item.id === targetId) {
      return {
        ...item,
        [property]: !item[property]
      };
    }
    
    if (item.children.length > 0) {
      return {
        ...item,
        children: toggleTreeItemProperty(item.children, targetId, property)
      };
    }
    
    return item;
  });
}; 