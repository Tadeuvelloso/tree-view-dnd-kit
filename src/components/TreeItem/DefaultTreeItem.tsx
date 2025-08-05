import React from 'react';
import styles from './TreeItem.module.css';

// Ícones padrão (você pode substituir por ícones de uma lib)
const FolderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M1.75 2A1.75 1.75 0 0 0 0 3.75v8.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-6.5A1.75 1.75 0 0 0 14.25 4H9.586a1 1 0 0 1-.707-.293L7.293 2.121A1 1 0 0 0 6.586 2H1.75z"/>
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25V1.75z"/>
  </svg>
);

interface DefaultTreeItemProps {
  item: any;
  depth: number;
  isCollapsed: boolean;
  hasChildren: boolean;
  isDraggable: boolean;
  isBeingDragged: boolean;
  onCollapse?: () => void;
  onItemClick?: (item: any) => void;
}

export const DefaultTreeItem: React.FC<DefaultTreeItemProps> = ({
  item,
  depth,
  isCollapsed,
  hasChildren,
  isDraggable,
  isBeingDragged,
  onCollapse,
  onItemClick,
}) => {
  const handleItemClick = (e: React.MouseEvent) => {
    // Se clicou no botão de collapse, não executar onItemClick
    if ((e.target as HTMLElement).closest(`.${styles.Collapse}`)) {
      return;
    }
    
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleCollapseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onCollapse) {
      onCollapse();
    }
  };

  return (
    <div 
      className={styles.DefaultTreeItem}
      onClick={handleItemClick}
      style={{ 
        paddingLeft: `${depth * 20}px`,
        opacity: isBeingDragged ? 0.5 : 1,
        cursor: 'pointer' // Como um link - sempre clicável
      }}
    >
      <div className={styles.IconContainer}>
        {hasChildren ? <FolderIcon /> : <FileIcon />}
      </div>
      
      <span className={styles.Text} title={item.title}>
        {item.title}
      </span>
      
      {hasChildren && (
        <button
          className={`${styles.Collapse} ${isCollapsed ? styles.collapsed : ''}`}
          onClick={handleCollapseClick}
          data-collapse-button="true"
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '▶' : '▼'}
        </button>
      )}
      
      {!isDraggable && (
        <span className={styles.PermissionInfo} title="Este item não pode ser movido">
          🔒
        </span>
      )}
    </div>
  );
}; 