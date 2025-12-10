import React, { useEffect, useRef } from 'react';
import {
  Clipboard,
  Copy,
  Download,
  Edit3,
  Eye,
  FolderPlus,
  Info,
  Move,
  Plus,
  Scissors,
  Trash2,
} from 'lucide-react';
import type { FileNode } from '../../types/state';
import { IconWrapper as IconWrapper } from '@/components/atoms/Icon';
import './contextMenu.css';

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  action: string;
  shortcut?: string;
  danger?: boolean;
}

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  targetFile?: FileNode;
  onAction: (action: string, file?: FileNode) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  targetFile,
  onAction,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems: (MenuItem | 'separator')[] = targetFile
    ? [

        {
          icon: Edit3,
          label: 'Rename',
          action: 'rename',
          shortcut: 'F2',
        },
        {
          icon: Copy,
          label: 'Copy',
          action: 'copy',
          shortcut: 'Ctrl+C',
        },
        {
          icon: Scissors,
          label: 'Cut',
          action: 'cut',
          shortcut: 'Ctrl+X',
        },
        {
          icon: Clipboard,
          label: 'Paste',
          action: 'paste',
          shortcut: 'Ctrl+V',
        },
        'separator',
        {
          icon: Move,
          label: 'Move to...',
          action: 'move',
          shortcut: 'Ctrl+M',
        },
        {
          icon: Trash2,
          label: 'Delete',
          action: 'delete',
          shortcut: 'Del',
          danger: true,
        },
        'separator',
        ...(targetFile.type === 'file'
          ? [
              {
                icon: Eye,
                label: 'Preview',
                action: 'preview',
              },
              {
                icon: Download,
                label: 'Download',
                action: 'download',
              },
            ]
          : []),
        {
          icon: Info,
          label: 'Properties',
          action: 'properties',
        },
      ]
    : [

        {
          icon: Plus,
          label: 'New File',
          action: 'newFile',
        },
        {
          icon: FolderPlus,
          label: 'New Folder',
          action: 'newFolder',
        },
      ];


  const vpW = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const vpH = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const menuW = 220;
  const menuH = (menuItems.length || 1) * 36 + 12;
  const left = Math.min(position.x, Math.max(8, vpW - menuW - 8));
  const top = Math.min(position.y, Math.max(8, vpH - menuH - 8));

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={targetFile ? 'File actions menu' : 'Workspace actions menu'}
      style={{
        position: 'fixed',
        top,
        left,
        zIndex: 1000,
        minWidth: '200px',
        padding: '6px 4px',
      }}
      className="fe-menu"
      onKeyDown={(e) => {
        const current = document.activeElement as HTMLElement | null;
        if (!current) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); (current.nextElementSibling as HTMLElement | null)?.focus?.(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); (current.previousElementSibling as HTMLElement | null)?.focus?.(); }
        if (e.key === 'Home') { e.preventDefault(); const first = (e.currentTarget.querySelector('[role="menuitem"]') as HTMLElement | null); first?.focus(); }
        if (e.key === 'End') { e.preventDefault(); const items = e.currentTarget.querySelectorAll('[role="menuitem"]'); const last = items.item(items.length - 1) as HTMLElement | null; last?.focus(); }
      }}
    >
      {menuItems.map((item, index) => {
        if (item === 'separator') {
          return (
            <div
              key={`separator-${index}`}
              role="separator"
              aria-orientation="horizontal"
              style={{
                height: '1px',
                background: 'var(--color-divider)',
                margin: '6px 4px',
              }}
            />
          );
        }

  const menuItem = item as MenuItem;
        return (
      <div
            key={menuItem.action}
            role="menuitem"
            className="ctx-pro-item"
            onClick={() => {
              onAction(menuItem.action, targetFile);
              onClose();
            }}
            tabIndex={0}
            style={{
        padding: '0 10px',
        display: 'flex',
        alignItems: 'center',
        height: 32,
        gap: '10px',
        cursor: 'pointer',
        color: menuItem.danger ? '#FF6B6B' : 'var(--text-primary,#e6e9ef)',
        transition: 'all 0.2s ease',
        userSelect: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = menuItem.danger
                ? 'rgba(255, 107, 107, 0.1)'
                : 'color-mix(in oklab, var(--brand-primary), transparent 88%)';
              e.currentTarget.style.color = menuItem.danger ? '#FF8A8A' : 'var(--brand-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = menuItem.danger ? '#FF6B6B' : 'var(--color-text-high)';
            }}
            onFocus={e => {
              e.currentTarget.style.background = menuItem.danger
                ? 'rgba(255, 107, 107, 0.1)'
                : 'color-mix(in oklab, var(--brand-primary), transparent 88%)';
              e.currentTarget.style.color = menuItem.danger ? '#FF8A8A' : 'var(--brand-primary)';
              e.currentTarget.style.outline = '2px solid var(--focus-color)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = menuItem.danger ? '#FF6B6B' : 'var(--color-text-high)';
              e.currentTarget.style.outline = 'none';
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onAction(menuItem.action, targetFile);
                onClose();
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = (e.currentTarget.nextSibling as HTMLElement) || null;
                next?.focus();
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = (e.currentTarget.previousSibling as HTMLElement) || null;
                prev?.focus();
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
          >
            {}
            <IconWrapper icon={menuItem.icon as unknown as any} size={16} />
            <span style={{ flex: 1 }}>{menuItem.label}</span>
            {menuItem.shortcut ? <span
                style={{
                  fontSize: '11px',
                  opacity: 0.6,
                  color: 'var(--color-text-low)',
                }}
              >
                {menuItem.shortcut}
              </span> : null}
          </div>
        );
      })}
    </div>
  );
};
