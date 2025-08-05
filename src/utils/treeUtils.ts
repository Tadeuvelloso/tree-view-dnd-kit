import type { 
  TreeItem, 
  TreeData, 
  FlatTreeData, 
  FlattenedTreeItem 
} from '../types/TreeItem';
import type { UniqueIdentifier } from '@dnd-kit/core';

/**
 * Converte uma flat list com propriedade parent para uma estrutura de árvore hierárquica
 * @param flatItems Array de itens planos com referência ao parent
 * @returns Array de itens organizados em árvore com children
 */
export const flatToTree = (flatItems: FlatTreeData): TreeData => {
  const itemMap = new Map<string, TreeItem>();
  const tree: TreeData = [];

  flatItems.forEach(item => {
    itemMap.set(item.id, { 
      id: item.id,
      title: item.title,
      children: [],
      disabled: item.disabled,
      metadata: item.metadata,
      icon: item.icon ? undefined : undefined
    });
  });

  flatItems.forEach(item => {
    const treeItem = itemMap.get(item.id);
    if (!treeItem) return;

    if (item.parent === null) {
      tree.push(treeItem);
    } else {
      const parent = itemMap.get(item.parent);
      if (parent) {
        parent.children.push(treeItem);
      }
    }
  });

  // Terceiro, ordenar cada nível pelos seus orders
  const sortChildren = (items: TreeData) => {
    // Criar um mapa de order para cada item
    const orderMap = new Map();
    flatItems.forEach(flatItem => {
      orderMap.set(flatItem.id, flatItem.order);
    });

    items.sort((a, b) => {
      const orderA = orderMap.get(a.id.toString()) || 0;
      const orderB = orderMap.get(b.id.toString()) || 0;
      return orderA - orderB;
    });
    
    items.forEach(item => {
      if (item.children.length > 0) {
        sortChildren(item.children);
      }
    });
  };

  sortChildren(tree);
  return tree;
};

/**
 * Converte uma estrutura de árvore hierárquica para uma flat list com propriedade parent
 * @param treeItems Array de itens organizados em árvore
 * @returns Array de itens planos com referência ao parent
 */
export const treeToFlat = (treeItems: TreeData): FlatTreeData => {
  const flatItems: FlatTreeData = [];
  
  const traverse = (items: TreeData, parentId: string | null = null) => {
    items.forEach((item, index) => {
      flatItems.push({
        id: item.id.toString(),
        title: item.title,
        parent: parentId,
        order: index,
        disabled: item.disabled,
        metadata: item.metadata,
        // Convert ReactNode icon to string if needed
        icon: undefined // You might want to implement icon serializer here
      });
      
      if (item.children && item.children.length > 0) {
        traverse(item.children, item.id.toString());
      }
    });
  };
  
  traverse(treeItems);
  return flatItems;
};

/**
 * Converts TreeData to FlattenedTreeItem array for dnd-kit operations
 * @param items Tree structure
 * @returns Flattened items with depth and hierarchy info
 */
export const flattenTree = (items: TreeData): FlattenedTreeItem[] => {
  const flatten = (
    items: TreeData,
    parentId: UniqueIdentifier | null = null,
    depth = 0,
    path = ''
  ): FlattenedTreeItem[] => {
    return items.reduce<FlattenedTreeItem[]>((acc, item, index) => {
      const currentPath = path ? `${path}.${index}` : index.toString();
      
      return [
        ...acc,
        {
          ...item,
          parentId,
          depth,
          index,
          path: currentPath
        },
        ...flatten(item.children, item.id, depth + 1, currentPath),
      ];
    }, []);
  };

  return flatten(items);
};

/**
 * Builds tree structure from flattened items
 * @param flattenedItems Array of flattened items
 * @returns Tree structure
 */
export const buildTree = (flattenedItems: FlattenedTreeItem[]): TreeData => {
  const root: TreeItem = { id: 'root', title: 'Root', children: [] };
  const nodes: Record<string, TreeItem> = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, children } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId.toString()] ?? findItem(items, parentId);

    nodes[id.toString()] = { 
      id, 
      title: item.title,
      children,
      disabled: item.disabled,
      icon: item.icon,
      metadata: item.metadata,
      collapsed: item.collapsed
    };
    parent.children.push(item);
  }

  return root.children;
};

/**
 * Atualiza as ordens dos itens na flat list, mantendo a hierarquia por parent
 * @param flatItems Array de itens planos
 * @returns Array de itens com ordens atualizadas
 */
export const updateFlatItemOrders = (flatItems: FlatTreeData): FlatTreeData => {
  // Agrupar por parent
  const groupedByParent = flatItems.reduce((acc, item) => {
    const parentKey = item.parent || 'root';
    if (!acc[parentKey]) {
      acc[parentKey] = [];
    }
    acc[parentKey].push(item);
    return acc;
  }, {} as Record<string, FlatTreeData>);

  // Atualizar ordem dentro de cada grupo
  const updatedItems: FlatTreeData = [];
  Object.keys(groupedByParent).forEach(parentKey => {
    const items = groupedByParent[parentKey];
    items.forEach((item, index) => {
      updatedItems.push({
        ...item,
        order: index
      });
    });
  });

  return updatedItems;
};

/**
 * Encontra um item na árvore pelo ID
 * @param items Array de itens da árvore
 * @param id ID do item procurado
 * @returns Item encontrado ou null
 */
export const findItemById = (items: TreeData, id: UniqueIdentifier): TreeItem | null => {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.children.length > 0) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Finds an item in flattened array
 */
export const findItem = (items: FlattenedTreeItem[], itemId: UniqueIdentifier): TreeItem | undefined => {
  return items.find(({ id }) => id === itemId);
};

/**
 * Conta o total de itens na árvore (incluindo children)
 * @param items Array de itens da árvore
 * @returns Número total de itens
 */
export const countTreeItems = (items: TreeData): number => {
  let count = 0;
  items.forEach(item => {
    count += 1;
    if (item.children.length > 0) {
      count += countTreeItems(item.children);
    }
  });
  return count;
};

/**
 * Gets the path to an item in the tree
 * @param items Tree data
 * @param targetId ID of target item
 * @returns Array of parent IDs leading to the target
 */
export const getItemPath = (items: TreeData, targetId: UniqueIdentifier): UniqueIdentifier[] => {
  const findPath = (items: TreeData, targetId: UniqueIdentifier, currentPath: UniqueIdentifier[] = []): UniqueIdentifier[] | null => {
    for (const item of items) {
      const newPath = [...currentPath, item.id];
      
      if (item.id === targetId) {
        return newPath;
      }
      
      if (item.children.length > 0) {
        const found = findPath(item.children, targetId, newPath);
        if (found) return found;
      }
    }
    return null;
  };

  return findPath(items, targetId) || [];
};

/**
 * Removes children of specified items from flattened array
 */
export const removeChildrenOf = (
  items: FlattenedTreeItem[],
  ids: UniqueIdentifier[]
): FlattenedTreeItem[] => {
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children.length) {
        excludeParentIds.push(item.id);
      }
      return false;
    }

    return true;
  });
};

/**
 * Sets a property on a tree item
 */
export const setProperty = <T extends keyof TreeItem>(
  items: TreeData,
  id: UniqueIdentifier,
  property: T,
  setter: (value: TreeItem[T]) => TreeItem[T]
): TreeData => {
  return items.map(item => {
    if (item.id === id) {
      return {
        ...item,
        [property]: setter(item[property])
      };
    }

    if (item.children.length) {
      return {
        ...item,
        children: setProperty(item.children, id, property, setter)
      };
    }

    return item;
  });
};

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

/**
 * Gets child count for an item
 */
export const getChildCount = (items: TreeData, id: UniqueIdentifier): number => {
  const item = findItemById(items, id);
  return item ? countTreeItems(item.children) : 0;
}; 