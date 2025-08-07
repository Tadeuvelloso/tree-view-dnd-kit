import React from 'react';
import classNames from 'classnames';
import { Action } from '../Action';
import styles from './TreeItem.module.css';

export interface Props extends Omit<React.HTMLAttributes<HTMLLIElement>, 'id'> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: any;
  indicator?: boolean;
  indentationWidth: number;
  isDraggable?: boolean;

  customIcon?: React.ReactNode;
  style?: React.CSSProperties;
  value: string;
  wrapperRef?(node: HTMLLIElement): void;
  onCollapse?(): void;
}

export const TreeItem = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      collapsed,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indicator,
      indentationWidth,
      value,
      onCollapse,
      style,
      wrapperRef,
      customIcon,
      isDraggable = true,
      ...props
    },
    ref
  ) => {
    const hasChildren = (childCount ?? 0) > 0;
    const canCollapse = hasChildren && onCollapse;

    const handleClick = () => {
      
    };

    const handleCollapseClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (onCollapse) {
        onCollapse();
      }
    };

    const renderIcon = () => {
      if (customIcon) return customIcon;
      
      return hasChildren ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.75 2A1.75 1.75 0 0 0 0 3.75v8.5C0 13.216.784 14 1.75 14h12.5A1.75 1.75 0 0 0 16 12.25v-6.5A1.75 1.75 0 0 0 14.25 4H9.586a1 1 0 0 1-.707-.293L7.293 2.121A1 1 0 0 0 6.586 2H1.75z"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25V1.75z"/>
        </svg>
      );
    };


    
    return (
      <li
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction,
          !isDraggable && styles.notDraggable
        )}
        ref={wrapperRef}
        style={
          {
            '--spacing': `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <div 
          className={classNames(styles.TreeItem, !isDraggable && styles.notDraggable)}
          ref={ref}
          style={style}
          data-tree-item="true"
          {... handleProps}
          onClick={handleClick}
        >
          <div className={styles.IconContainer}>
            {renderIcon()}
          </div>
          <span className={styles.Text}>{value}</span>
          {canCollapse && (
            <Action
              className={styles.Collapse}
              onClick={handleCollapseClick}
              data-collapse-button="true"
            >
              {collapsed ? '▼' : '▶'}
            </Action>
          )}
       
        </div>
      </li>
    );
  }
);
