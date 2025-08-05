import type { TreeData } from '../types/TreeItem';

export const testData: TreeData = [
  {
    id: 'home',
    title: 'Home',
    children: [],
    metadata: { owner: 'system', type: 'page' }
  },
  {
    id: 'collections',
    title: 'Collections',
    collapsed: false,
    children: [
      {
        id: 'spring',
        title: 'Spring Collection',
        children: [
          {
            id: 'spring-items',
            title: 'Spring Items',
            children: [
              {
                id: 'spring-item-1',
                title: 'Item 1 (Depth 3)',
                children: [],
                metadata: { owner: 'john', editable: true }
              }
            ],
            metadata: { owner: 'john', editable: true }
          }
        ],
        metadata: { owner: 'currentUser', editable: true }
      },
      {
        id: 'summer',
        title: 'Summer Collection',
        children: [],
        metadata: { owner: 'alice', editable: false }
      }
    ],
    metadata: { owner: 'currentUser', editable: true }
  },
  {
    id: 'help',
    title: 'Help & Support',
    collapsed: true,
    children: [
      {
        id: 'faq',
        title: 'FAQ',
        children: [],
        metadata: { owner: 'admin', type: 'system' }
      },
      {
        id: 'contact',
        title: 'Contact Us',
        children: [],
        metadata: { owner: 'currentUser', editable: true }
      }
    ],
    metadata: { owner: 'admin', type: 'system' }
  }
];