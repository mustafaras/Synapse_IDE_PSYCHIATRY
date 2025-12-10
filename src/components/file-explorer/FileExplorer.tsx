import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  Copy,
  Edit3,
  Folder,
  FolderOpen,
  FolderPlus,
  Info,
  Move,
  Plus,
  Trash2,
  X,
} from 'lucide-react';


import { useTabActions } from '../../stores/editorStore';
import { useFileExplorerStore } from '../../stores/fileExplorerStore';
import type { FileNode } from '../../types/state';
import { FileIcon } from './FileIcon';
import { FileExplorerHeader } from './FileExplorerHeader';
import HeaderPro from './pro/HeaderPro';
import './pro/headerPro.css';
import InlineRename from './InlineRename';
import './items.css';
import { useClipboard } from '@/hooks/useClipboard';
import { useContextMenu } from '@/hooks/useContextMenu';
import { getTemplateContentByLanguage as getGlobalTemplateContent } from '../../templates/templateContent';


const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


const REFINED_COLORS = {

  bgDark: '#121212',
  bgSecondary: '#1A1A1A',
  bgTertiary: '#252525',


  textPrimary: '#E8E8E8',
  textSecondary: '#AAB2BD',
  textTertiary: '#6B7280',


  goldPrimary: '#00A6D7',
  goldSecondary: '#5FD6F5',
  goldHover: '#00A6D7',


  blueGray: '#AAB2BD',
  blueGrayHover: '#B8C0CC',


  success: '#22C55E',
  warning: '#00A6D7',
  error: '#EF4444',


  border: 'rgba(255, 255, 255, 0.06)',
  borderSubtle: 'rgba(255, 255, 255, 0.04)',
  hover: 'rgba(0, 166, 215, 0.10)',
  selected: 'rgba(0, 166, 215, 0.18)',
  divider: 'rgba(255, 255, 255, 0.08)',


  shadowSoft: '0 1px 3px rgba(0, 0, 0, 0.2)',
  shadowElevated: '0 2px 6px rgba(0, 0, 0, 0.15)',
  shadowModal: '0 3px 12px rgba(0, 0, 0, 0.25)',
};


const REFINED_MOTION = {
  duration: {
    instant: '50ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    linear: 'linear',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    ease: 'ease-out',
  },
} as const;


const IDE_TYPOGRAPHY = {
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace",
  fontSize: {
    small: '12px',
    base: '13px',
    medium: '14px',
    large: '16px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};


const getRefinedDuration = (duration: string) => {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? '50ms' : duration;
};

const getRefinedTransition = (
  properties: string,
  duration: string = REFINED_MOTION.duration.fast
) => {
  return `${properties} ${getRefinedDuration(duration)} ${REFINED_MOTION.easing.smooth}`;
};


const ACCESSIBILITY_FEATURES = {
  FOCUS_OUTLINE: `2px solid ${REFINED_COLORS.goldPrimary}`,
  HIGH_CONTRAST: '4.5:1',

  respectsReducedMotion: () => {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  },

  getFolderIconRotation: (isExpanded: boolean) => {
    const rotation = isExpanded ? 'rotate(90deg)' : 'rotate(0deg)';
    const duration = getRefinedDuration(REFINED_MOTION.duration.fast);
    return {
      transform: rotation,
      transition: `transform ${duration} ${REFINED_MOTION.easing.smooth}`,
    };
  },

  getNewItemAnimation: (isNewlyCreated: boolean) => {
    if (!isNewlyCreated) return {};
    const duration = getRefinedDuration(REFINED_MOTION.duration.normal);
    return {
      animation: ACCESSIBILITY_FEATURES.respectsReducedMotion()
        ? `refinedFadeIn ${duration} ease-out`
        : `refinedFadeInUp ${duration} ${REFINED_MOTION.easing.smooth}`,
    };
  },
};


const injectRefinedAnimationStyles = () => {
  const styleId = 'refined-file-explorer-animations';
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 50ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 50ms !important;
        scroll-behavior: auto !important;
      }
    }

    @keyframes refinedFadeInUp {
      0% {
        opacity: 0;
        transform: translateY(8px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes refinedFadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }

    @keyframes refinedSlideIn {
      0% {
        opacity: 0;
        transform: translateY(-4px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes refinedScaleIn {
      0% {
        opacity: 0;
        transform: scale(0.96);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes refinedHighlight {
      0% {
        background: transparent;
      }
      25% {
        background: rgba(194, 167, 110, 0.15);
        transform: scale(1.02);
      }
      50% {
        background: rgba(194, 167, 110, 0.2);
        transform: scale(1.01);
      }
      100% {
        background: transparent;
        transform: scale(1);
      }
    }

    @keyframes refinedDropZoneGlow {
      0% {
        box-shadow: 0 0 0 rgba(194, 167, 110, 0);
      }
      50% {
        box-shadow: 0 0 8px rgba(194, 167, 110, 0.4);
      }
      100% {
        box-shadow: 0 0 0 rgba(194, 167, 110, 0);
      }
    }

    @keyframes refinedDragPreview {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0.7;
        transform: scale(0.95);
      }
    }

    @keyframes refinedShake {
      0% { transform: translateX(0); }
      20% { transform: translateX(-2px); }
      40% { transform: translateX(2px); }
      60% { transform: translateX(-2px); }
      80% { transform: translateX(2px); }
      100% { transform: translateX(0); }
    }


    .refined-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(194, 167, 110, 0.6) transparent;
    }

    .refined-scrollbar::-webkit-scrollbar {
      width: 4px;
      background: transparent;
    }

    .refined-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }

    .refined-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, rgba(194, 167, 110, 0.6), rgba(170, 178, 189, 0.4));
      border-radius: 2px;
      border: none;
    }

    .refined-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(194, 167, 110, 0.8), rgba(170, 178, 189, 0.6));
    }


    .file-name-hover {
      position: relative;
    }

    .file-name-hover::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 0%;
      height: 1px;
  background: #00A6D7;
      transition: width 0.2s ease-in-out;
    }

    .file-name-hover:hover::after {
      width: 100%;
    }


    .drag-preview {
  pointer-events: none;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(32,32,32,0.9);
  border: 1px solid rgba(255,255,255,0.08);
  color: #E8E8E8;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.35);
  transform: scale(0.92);
  opacity: 0.8;
  animation: refinedDragPreview 0.15s ease-out forwards;
    }

    .drop-zone-active {
      animation: refinedDropZoneGlow 1s ease-in-out infinite;
    }

    .file-item-dragging {
      opacity: 0.5;
      transform: scale(0.98);
      transition: all 0.2s ease-out;
    }

    .drop-target-valid {
      position: relative;
      background: rgba(194, 167, 110, 0.08) !important;
      border: 1px dashed rgba(194, 167, 110, 0.6) !important;
      border-radius: 6px !important;
      transform: scale(1.02);
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 0 0 0 rgba(194, 167, 110, 0);
    }

    .drop-target-valid.drop-zone-active {
      box-shadow: 0 0 10px 0 rgba(194, 167, 110, 0.35);
    }

    .drop-target-invalid {
      background: rgba(239, 68, 68, 0.06) !important;
      border: 1px dashed rgba(239, 68, 68, 0.45) !important;
      border-radius: 6px !important;
      animation: refinedShake 0.35s ease-in-out;
    }


    .refined-toast {
      position: fixed;
      right: 16px;
      bottom: 16px;
      background: linear-gradient(135deg, rgba(37,37,37,0.95), rgba(24,24,24,0.95));
      border: 1px solid rgba(255,255,255,0.08);
      color: #E8E8E8;
      padding: 10px 12px;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      font-family: ${IDE_TYPOGRAPHY.fontFamily};
      font-size: 12px;
      z-index: 100000;
      animation: refinedFadeIn ${getRefinedDuration(REFINED_MOTION.duration.fast)} ${REFINED_MOTION.easing.smooth};
    }


    .file-tree-item {
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: left center;
    }
    .file-tree-item:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 14px rgba(194, 167, 110, 0.18);
    }
    .file-tree-item:focus-visible {
      outline: 2px solid ${REFINED_COLORS.goldPrimary};
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .file-tree-item { transition: none; }
      .file-tree-item:hover { transform: none; box-shadow: none; }
    }
  `;
  document.head.appendChild(style);
};


if (typeof window !== 'undefined') {
  injectRefinedAnimationStyles();
}


const useRefinedStyles = (sidebarWidth: number = 375) => {
  return useMemo(
    () => ({

      container: {
        width: `${sidebarWidth}px`,
        height: '100%',
        minHeight: 'calc(100vh - 120px)',
        background: REFINED_COLORS.bgDark,
        backdropFilter: 'blur(6px)',
        border: `1px solid ${REFINED_COLORS.border}`,
        borderRadius: '0px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column' as const,
        position: 'relative' as const,
        boxShadow: REFINED_COLORS.shadowSoft,
        transition: getRefinedTransition('all', REFINED_MOTION.duration.normal),
      },


      header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: REFINED_COLORS.bgSecondary,
        backdropFilter: 'blur(6px)',
        borderBottom: `1px solid ${REFINED_COLORS.divider}`,
        boxShadow: REFINED_COLORS.shadowSoft,
        gap: '8px',
        minHeight: '44px',
      },


      headerBrand: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flex: '0 0 auto',
        minWidth: '100px',
      },

      brandIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
        color: REFINED_COLORS.goldPrimary,
        opacity: 0.9,
      },

      brandTitle: {
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
        fontSize: '11px',
        fontWeight: IDE_TYPOGRAPHY.fontWeight.semibold,
        lineHeight: IDE_TYPOGRAPHY.lineHeight.tight,
        color: REFINED_COLORS.textPrimary,
        letterSpacing: '0.5px',
        textTransform: 'uppercase' as const,
        userSelect: 'none' as const,
      },


      searchSection: {
        display: 'flex',
        alignItems: 'center',
        flex: '1 1 auto',
        gap: '6px',
        position: 'relative' as const,
      },

      searchInput: {
        width: '100%',
        height: '28px',
        padding: '0 8px 0 28px',
        background: REFINED_COLORS.bgTertiary,
        border: `1px solid ${REFINED_COLORS.border}`,
        borderRadius: '6px',
        color: REFINED_COLORS.textPrimary,
        fontSize: IDE_TYPOGRAPHY.fontSize.small,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
        outline: 'none',
        transition: getRefinedTransition('all'),
        '&:focus': {
          border: `1px solid ${REFINED_COLORS.goldPrimary}`,
          background: REFINED_COLORS.bgSecondary,
        },
        '&::placeholder': {
          color: REFINED_COLORS.textTertiary,
          fontSize: '11px',
        },
      },

      searchIcon: {
        position: 'absolute' as const,
        left: '6px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '14px',
        height: '14px',
        color: REFINED_COLORS.textTertiary,
        pointerEvents: 'none' as const,
      },

      clearSearchButton: {
        position: 'absolute' as const,
        right: '4px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        borderRadius: '3px',
        color: REFINED_COLORS.textTertiary,
        cursor: 'pointer',
        opacity: 0.7,
        transition: getRefinedTransition('all'),
        '&:hover': {
          opacity: 1,
          background: REFINED_COLORS.hover,
          color: REFINED_COLORS.textSecondary,
        },
      },


      actionButtons: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flex: '0 0 auto',
      },

      actionButton: {
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        borderRadius: '6px',
        color: REFINED_COLORS.textSecondary,
        cursor: 'pointer',
        transition: getRefinedTransition('all'),
        '&:hover': {
          background: REFINED_COLORS.hover,
          color: REFINED_COLORS.goldPrimary,
          transform: 'scale(1.05)',
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
      },


      content: {
        flex: '1 1 auto',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column' as const,
      },

      scrollableContent: {
        flex: '1 1 auto',
        overflowY: 'auto' as const,
        overflowX: 'hidden' as const,

        transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
      },


      fileTree: {
        padding: '8px 0',
      },


      fileItem: (depth: number, isSelected: boolean, isHovered: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        padding: '6px 8px',
        paddingLeft: `${8 + depth * 16}px`,
        cursor: 'pointer',
        position: 'relative' as const,
        background: isSelected ? REFINED_COLORS.selected : 'transparent',
        color: REFINED_COLORS.textPrimary,
        fontSize: IDE_TYPOGRAPHY.fontSize.small,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
        lineHeight: IDE_TYPOGRAPHY.lineHeight.normal,
        userSelect: 'none' as const,
        borderLeft: isSelected
          ? `2px solid ${REFINED_COLORS.goldPrimary}`
          : '2px solid transparent',
        transition: getRefinedTransition('all'),
        ...(isHovered && !isSelected
          ? {
              background: REFINED_COLORS.hover,
              border: `1px solid ${REFINED_COLORS.goldPrimary}40`,
              outline: `1px solid ${REFINED_COLORS.goldPrimary}60`,
              outlineOffset: '1px',
            }
          : {}),
        ...(isSelected
          ? {
              background: REFINED_COLORS.selected,
              border: `1px solid ${REFINED_COLORS.goldPrimary}`,
              fontWeight: IDE_TYPOGRAPHY.fontWeight.medium,
            }
          : {}),
      }),


      folderChevron: (isExpanded: boolean) => ({
        width: '16px',
        height: '16px',
        marginRight: '6px',
        color: REFINED_COLORS.textSecondary,
        flexShrink: 0,
        ...ACCESSIBILITY_FEATURES.getFolderIconRotation(isExpanded),
      }),


      fileIcon: {
        width: '16px',
        height: '16px',
        marginRight: '8px',
        flexShrink: 0,
        color: REFINED_COLORS.goldPrimary,
        opacity: 0.8,
      },

      folderIcon: (isExpanded: boolean) => ({
        width: '16px',
        height: '16px',
        marginRight: '8px',
        flexShrink: 0,
        color: isExpanded ? REFINED_COLORS.goldHover : REFINED_COLORS.goldPrimary,
        transition: getRefinedTransition('color'),
      }),


      fileName: (isEditing: boolean) => ({
        flex: '1 1 auto',
        color: REFINED_COLORS.textPrimary,
        fontSize: IDE_TYPOGRAPHY.fontSize.small,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
        lineHeight: IDE_TYPOGRAPHY.lineHeight.normal,
        textDecoration: 'none',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: isEditing ? 'text' : 'inherit',
      }),

      editInput: {
        flex: '1 1 auto',
        background: REFINED_COLORS.bgTertiary,
        border: `1px solid ${REFINED_COLORS.goldPrimary}`,
        borderRadius: '3px',
        color: REFINED_COLORS.textPrimary,
        fontSize: IDE_TYPOGRAPHY.fontSize.small,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
        padding: '2px 6px',
        outline: 'none',
        margin: '0 4px 0 0',
      },


      contextMenu: {
        position: 'fixed' as const,
        zIndex: 9999,
        minWidth: '200px',
        background: `linear-gradient(145deg, ${REFINED_COLORS.bgSecondary} 0%, ${REFINED_COLORS.bgDark} 100%)`,
        border: `1px solid ${REFINED_COLORS.goldPrimary}20`,
        borderRadius: '12px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
        backdropFilter: 'blur(8px)',
        animation: `refinedFadeInUp ${getRefinedDuration(REFINED_MOTION.duration.slow)} ${REFINED_MOTION.easing.smooth}`,
        transition: getRefinedTransition('all', REFINED_MOTION.duration.fast),
      },

      contextMenuItem: (isHovered: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: IDE_TYPOGRAPHY.fontSize.small,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
        color: REFINED_COLORS.textPrimary,
        background: isHovered ? REFINED_COLORS.hover : 'transparent',
        border: isHovered ? `1px solid ${REFINED_COLORS.border}` : '1px solid transparent',
        transition: getRefinedTransition('all'),
        userSelect: 'none' as const,
        '&:hover': {
          background: REFINED_COLORS.hover,
          transform: 'translateX(2px)',
        },
      }),

      contextMenuIcon: {
        width: '16px',
        height: '16px',
        color: REFINED_COLORS.goldPrimary,
        opacity: 0.9,
        flexShrink: 0,
      },

      contextMenuSeparator: {
        height: '1px',
        background: REFINED_COLORS.divider,
        margin: '4px 8px',
        borderRadius: '1px',
      },


      modalOverlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: `refinedFadeIn ${getRefinedDuration(REFINED_MOTION.duration.fast)} ${REFINED_MOTION.easing.smooth}`,
      },

      modal: {
        background: `linear-gradient(135deg, ${REFINED_COLORS.bgSecondary}80 0%, ${REFINED_COLORS.bgDark}60 100%)`,
        borderTop: `1px solid ${REFINED_COLORS.goldPrimary}20`,
        borderRadius: '16px',
        padding: '20px',
        width: '350px',
        maxWidth: '350px',
        maxHeight: '90vh',
        overflow: 'auto',
        margin: '0',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        animation: `refinedScaleIn ${getRefinedDuration(REFINED_MOTION.duration.normal)} ${REFINED_MOTION.easing.smooth}`,
        flexShrink: 0,
      },

      modalHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: `1px solid ${REFINED_COLORS.divider}`,
      },

      modalTitle: {
        fontSize: IDE_TYPOGRAPHY.fontSize.large,
        fontWeight: IDE_TYPOGRAPHY.fontWeight.semibold,
        color: REFINED_COLORS.textPrimary,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
      },

      modalTitleDanger: {
        fontSize: IDE_TYPOGRAPHY.fontSize.large,
        fontWeight: IDE_TYPOGRAPHY.fontWeight.semibold,
        color: REFINED_COLORS.warning,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
      },

      modalCloseButton: {
        background: 'transparent',
        border: 'none',
        color: REFINED_COLORS.textSecondary,
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        transition: getRefinedTransition('all'),
        '&:hover': {
          background: REFINED_COLORS.hover,
          color: REFINED_COLORS.textPrimary,
        },
      },


      modalContent: {
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
      },


      modalKV: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '10px',
      },
      modalKVRow: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
        padding: '6px 0',
        borderBottom: `1px solid ${REFINED_COLORS.divider}`,
      },
      modalKVKey: {
        color: REFINED_COLORS.textSecondary,
        fontSize: '12px',
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
        letterSpacing: '0.2px',
      },
      modalKVValue: {
        color: REFINED_COLORS.textPrimary,
        fontSize: IDE_TYPOGRAPHY.fontSize.small,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
        wordBreak: 'break-word' as const,
      },


      modalText: {
        color: REFINED_COLORS.textPrimary,
        fontSize: IDE_TYPOGRAPHY.fontSize.small,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
        lineHeight: IDE_TYPOGRAPHY.lineHeight?.relaxed || 1.5,
      },
      modalWarning: {
        color: REFINED_COLORS.warning,
        fontSize: IDE_TYPOGRAPHY.fontSize.small,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
      },

      modalInput: {
        width: '100%',
        padding: '12px',
        background: REFINED_COLORS.bgTertiary,
        border: `1px solid ${REFINED_COLORS.border}`,
        borderRadius: '8px',
        color: REFINED_COLORS.textPrimary,
        fontSize: IDE_TYPOGRAPHY.fontSize.base,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
        outline: 'none',
        transition: getRefinedTransition('all'),
        '&:focus': {
          border: `1px solid ${REFINED_COLORS.goldPrimary}`,
          background: REFINED_COLORS.bgSecondary,
        },
      },


      modalButtons: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'stretch',
        gap: '10px',
      },

  modalButton: (variant: 'primary' | 'secondary' | 'danger') => ({
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: IDE_TYPOGRAPHY.fontSize.small,
        fontWeight: IDE_TYPOGRAPHY.fontWeight.medium,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
        cursor: 'pointer',
        width: '100%',
        border:
          variant === 'primary' || variant === 'danger'
            ? `1px solid ${REFINED_COLORS.goldPrimary}`
            : `1px solid ${REFINED_COLORS.border}`,
        background:
          variant === 'primary' || variant === 'danger'
            ? `linear-gradient(135deg, ${REFINED_COLORS.goldPrimary} 0%, ${REFINED_COLORS.goldSecondary} 100%)`
            : `linear-gradient(135deg, ${REFINED_COLORS.bgTertiary} 0%, ${REFINED_COLORS.bgSecondary} 100%)`,
        color:
          variant === 'primary' || variant === 'danger'
            ? REFINED_COLORS.bgDark
            : REFINED_COLORS.textPrimary,
        transition: getRefinedTransition('all'),
        boxShadow:
          variant === 'primary' || variant === 'danger'
            ? `0 2px 8px ${REFINED_COLORS.goldPrimary}30`
            : 'none',
        '&:hover': {
          transform: 'translateY(-1px) scale(1.01)',
          boxShadow:
            variant === 'primary' || variant === 'danger'
              ? `0 4px 12px ${REFINED_COLORS.goldPrimary}40`
              : `0 2px 8px rgba(0, 0, 0, 0.15)`,
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      }),


      emptyState: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center' as const,
        color: REFINED_COLORS.textTertiary,
        fontSize: IDE_TYPOGRAPHY.fontSize.small,
        fontFamily: IDE_TYPOGRAPHY.fontFamily,
      },

      emptyStateIcon: {
        width: '48px',
        height: '48px',
        color: REFINED_COLORS.textTertiary,
        opacity: 0.5,
        marginBottom: '16px',
      },

      emptyStateText: {
        color: REFINED_COLORS.textSecondary,
        lineHeight: IDE_TYPOGRAPHY.lineHeight.relaxed,
      },
    }),
    [sidebarWidth]
  );
};


interface FileExplorerProps {
  sidebarWidth?: number;
  className?: string;
}


interface ModalState {
  type: 'newFile' | 'newFolder' | 'rename' | 'delete' | 'properties' | 'move' | null;
  fileNode: FileNode | null;
  isVisible: boolean;
}


const HighlightedText: React.FC<{ text: string; searchQuery: string }> = memo(
  ({ text, searchQuery }) => {
    if (!searchQuery.trim()) {
      return <span>{text}</span>;
    }

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span
              key={index}
              style={{
                background: REFINED_COLORS.goldPrimary,
                color: REFINED_COLORS.bgDark,
                padding: '1px 2px',
                borderRadius: '2px',
              }}
            >
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  }
);


const splitNameExt = (name: string): { base: string; ext: string } => {
  const lastDot = name.lastIndexOf('.');
  if (lastDot <= 0) {

    return { base: name, ext: '' };
  }
  return { base: name.substring(0, lastDot), ext: name.substring(lastDot) };
};


export const FileExplorer: React.FC<FileExplorerProps> = memo(
  ({ sidebarWidth = 375, className = '' }) => {

    const styles = useRefinedStyles(sidebarWidth);


  const files = useFileExplorerStore(s => s.files);
  const expandedFolders = useFileExplorerStore(s => s.expandedFolders);
  const searchQuery = useFileExplorerStore(s => s.searchQuery);
  const setSearchQuery = useFileExplorerStore(s => s.setSearchQuery);
  const toggleFolder = useFileExplorerStore(s => s.toggleFolder);
  const selectFile = useFileExplorerStore(s => s.selectFile);
  const addFile = useFileExplorerStore(s => s.addFile);
  const updateFile = useFileExplorerStore(s => s.updateFile);
  const deleteFile = useFileExplorerStore(s => s.deleteFile);
  const moveFile = useFileExplorerStore(s => s.moveFile);
  const renameFile = useFileExplorerStore(s => s.renameFile);
    const getFileById = useFileExplorerStore(state => state.getFileById);
    const getFileByPath = useFileExplorerStore(state => state.getFileByPath);
    const getParentFolder = useFileExplorerStore(state => state.getParentFolder);

    const { openTab } = useTabActions();


    const {
      state: ctxMenu,
      openContextMenu,
      closeContextMenu,
      menuRef,
    } = useContextMenu<FileNode | null>();

    const [modal, setModal] = useState<ModalState>({
      type: null,
      fileNode: null,
      isVisible: false,
    });

    const ideProEnabled = React.useMemo(() => {
      try {
        return new URLSearchParams(window.location.search).get('ideTheme') === 'pro';
      } catch {
        return false;
      }
    }, []);

    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [draggedNode, setDraggedNode] = useState<FileNode | null>(null);
    const [dragOverNode, setDragOverNode] = useState<string | null>(null);


    const [liveMessage, setLiveMessage] = useState<string>('');

    const { clipboardNode, copy, cut, paste } = useClipboard((type, message) => {

      try {
        import('@/ui/toast/api').then(m => {

          const kind = type === 'error' ? 'error' : type === 'copy' || type === 'cut' || type === 'paste' ? 'success' : 'info';
          m.showToast({ kind, message, contextKey: `explorer:clipboard:${type}:${message}`, duration: 1600 });
        });
      } catch {}

      setLiveMessage(message);
      setTimeout(() => setLiveMessage(''), 1000);
    });


    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [renaming, setRenaming] = useState<string | null>(null);

    const lastFocusedIdRef = useRef<string | null>(null);
    useEffect(() => {
      if (selectedFile) lastFocusedIdRef.current = selectedFile;
    }, [selectedFile]);


    const contextMenuRef = menuRef;


    const debouncedSearchQuery = useDebounce(searchQuery, 200);


    const filteredFiles = useMemo(() => {
      if (!debouncedSearchQuery.trim()) return files;

      const filterNode = (node: FileNode): FileNode | null => {
        const matchesSearch = node.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
        if (node.type === 'folder') {
          const filteredChildren =
            (node.children?.map(filterNode).filter(Boolean) as FileNode[]) || [];
          if (matchesSearch || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
          return null;
        }
        return matchesSearch ? node : null;
      };

      return files.map(filterNode).filter(Boolean) as FileNode[];
    }, [files, debouncedSearchQuery]);


    const visibleNodes = useMemo(() => {
      const result: FileNode[] = [];
      const traverse = (nodes: FileNode[]) => {
        nodes.forEach(n => {
          result.push(n);
          if (
            n.type === 'folder' &&
            expandedFolders.includes(n.id) &&
            n.children &&
            n.children.length
          ) {
            traverse(n.children);
          }
        });
      };
      traverse(filteredFiles);
      return result;
    }, [filteredFiles, expandedFolders]);


    const handleTreeKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {

        if (renaming) return;

        const key = e.key;
        const ctrl = e.ctrlKey || e.metaKey;
        const ids = visibleNodes.map(n => n.id);
        const idx = selectedFile ? ids.indexOf(selectedFile) : -1;
        const current = selectedFile ? (getFileById(selectedFile) as FileNode | null) : null;


        if (ctrl && (key === 'c' || key === 'x' || key === 'v')) {
          if (!current) return;
          e.preventDefault();
          if (key === 'c') {
            copy(current);
          } else if (key === 'x') {
            cut(current);
          } else if (key === 'v') {
            const targetFolder =
              current.type === 'folder'
                ? current
                : (getParentFolder(current.path) as FileNode | null);
            if (targetFolder && targetFolder.type === 'folder') {
              paste(targetFolder);
            }
          }
          return;
        }

        switch (key) {
          case 'ArrowDown': {
            e.preventDefault();
            if (ids.length === 0) return;
            const nextIndex = idx < 0 ? 0 : Math.min(idx + 1, ids.length - 1);
            const nextId = ids[nextIndex];
            setSelectedFile(nextId);
            selectFile(nextId);
            const el = document.querySelector(`[data-file-id="${nextId}"]`) as HTMLElement | null;
            if (el) {
              el.focus();
              try {
                (el as any).scrollIntoView({ block: 'nearest' });
              } catch {}
            }
            return;
          }
          case 'ArrowUp': {
            e.preventDefault();
            if (ids.length === 0) return;
            const prevIndex = idx < 0 ? 0 : Math.max(idx - 1, 0);
            const prevId = ids[prevIndex];
            setSelectedFile(prevId);
            selectFile(prevId);
            const el = document.querySelector(`[data-file-id="${prevId}"]`) as HTMLElement | null;
            if (el) {
              el.focus();
              try {
                (el as any).scrollIntoView({ block: 'nearest' });
              } catch {}
            }
            return;
          }
          case 'ArrowRight': {
            if (!current) return;
            e.preventDefault();
            if (current.type === 'folder') {
              const isExpanded = expandedFolders.includes(current.id);
              if (!isExpanded) {
                toggleFolder(current.id);
              } else {

                const nextIndex = Math.min(idx + 1, ids.length - 1);
                const nextId = ids[nextIndex];
                if (nextId && nextId !== current.id) {
                  setSelectedFile(nextId);
                  selectFile(nextId);
                  const el = document.querySelector(
                    `[data-file-id="${nextId}"]`
                  ) as HTMLElement | null;
                  if (el) {
                    el.focus();
                    try {
                      (el as any).scrollIntoView({ block: 'nearest' });
                    } catch {}
                  }
                }
              }
            }
            return;
          }
          case 'ArrowLeft': {
            if (!current) return;
            e.preventDefault();
            if (current.type === 'folder' && expandedFolders.includes(current.id)) {
              toggleFolder(current.id);
            } else {
              const parent = getParentFolder(current.path) as FileNode | null;
              if (parent) {
                setSelectedFile(parent.id);
                selectFile(parent.id);
                const el = document.querySelector(
                  `[data-file-id="${parent.id}"]`
                ) as HTMLElement | null;
                if (el) {
                  el.focus();
                  try {
                    (el as any).scrollIntoView({ block: 'nearest' });
                  } catch {}
                }
              }
            }
            return;
          }
          case 'Enter': {
            if (!current) return;
            e.preventDefault();
            if (current.type === 'folder') {
              toggleFolder(current.id);
            } else {
              openTab(current);
            }
            return;
          }
          case 'F2': {
            if (!current) return;
            e.preventDefault();
            setRenaming(current.id);
            return;
          }
          case 'Delete': {
            if (!current) return;
            e.preventDefault();
            setModal({ type: 'delete', fileNode: current, isVisible: true });
            return;
          }
          case 'Escape': {
            e.preventDefault();
            setModal(prev => ({ ...prev, isVisible: false }));
            if (ctxMenu.visible) closeContextMenu();

          }
        }
      },
      [
        renaming,
        visibleNodes,
        selectedFile,
        expandedFolders,
        getFileById,
        getParentFolder,
        setSelectedFile,
        selectFile,
        toggleFolder,
        openTab,
        setRenaming,
        setModal,
        ctxMenu.visible,
        closeContextMenu,
        copy,
        cut,
        paste,
      ]
    );


    const handleContextMenu = useCallback(
      (e: React.MouseEvent, fileNode: FileNode) => {
        openContextMenu(e, fileNode);
      },
      [openContextMenu]
    );

    const hideContextMenu = useCallback(() => {
      closeContextMenu();
    }, [closeContextMenu]);


    const handleCopy = useCallback(
      (node: FileNode) => {
        copy(node);
      },
      [copy]
    );

    const handleCut = useCallback(
      (node: FileNode) => {
        cut(node);
      },
      [cut]
    );

    const handlePasteInto = useCallback(
      (targetFolder: FileNode) => {
        const previous = selectedFile;
        paste(targetFolder);

        if (previous) {
          setTimeout(() => {
            const el = document.querySelector(`[data-file-id="${previous}"]`) as HTMLElement | null;
            if (el) {
              try {
                el.focus({ preventScroll: false });
                (el as any).scrollIntoView?.({ block: 'nearest' });
              } catch {}
            }
          }, 120);
        }
      },
      [paste, selectedFile]
    );


    const handleDragStart = useCallback((e: React.DragEvent, node: FileNode) => {
      console.log(`🎯 Drag started for: ${node.name}`);
      setDraggedNode(node);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify({
          id: node.id,
          name: node.name,
          type: node.type,
          path: node.path,
        })
      );


      try {
        const preview = document.createElement('div');
        preview.className = 'drag-preview';
        preview.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color:${REFINED_COLORS.goldPrimary}">
          <path d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span style="font-family:${IDE_TYPOGRAPHY.fontFamily}; font-size:12px;">${node.name}</span>
      `;
        document.body.appendChild(preview);
        e.dataTransfer.setDragImage(preview, 8, 8);
        setTimeout(() => preview.remove(), 0);
      } catch {}


      const target = e.currentTarget as HTMLElement;
      target.classList.add('file-item-dragging');
    }, []);

    const handleDragEnd = useCallback((e: React.DragEvent) => {
      console.log(`🎯 Drag ended`);

      const target = e.currentTarget as HTMLElement;
      target.classList.remove('file-item-dragging');
      setDraggedNode(null);
      setDragOverNode(null);
    }, []);

    type DropValidation = { valid: boolean; reason?: string };
    const isValidDropTarget = useCallback(
      (targetNode: FileNode, draggedNode: FileNode | null): DropValidation => {
        if (!draggedNode || !targetNode) {
          return { valid: false, reason: 'missing-nodes' };
        }
        if (draggedNode.id === targetNode.id) {
          return { valid: false, reason: 'self-target' };
        }
        if (targetNode.type !== 'folder') {
          return { valid: false, reason: 'target-not-folder' };
        }


        const isDescendantOf = (node: FileNode, ancestorId: string): boolean => {
          const fullNode = getFileById(node.id) || node;
          if (!fullNode.children || fullNode.children.length === 0) return false;
          for (const child of fullNode.children) {
            if (child.id === ancestorId) return true;
            if (child.children && isDescendantOf(child, ancestorId)) return true;
          }
          return false;
        };
        if (
          draggedNode.type === 'folder' &&
          (draggedNode.id === targetNode.id || isDescendantOf(draggedNode, targetNode.id))
        ) {
          return { valid: false, reason: 'into-self-or-descendant' };
        }


        const draggedParentPath = draggedNode.path.includes('/')
          ? draggedNode.path.substring(0, draggedNode.path.lastIndexOf('/'))
          : '';
        const targetPath = targetNode.path;
        if (draggedParentPath === targetPath) {
          return { valid: false, reason: 'same-parent' };
        }

        return { valid: true };
      },
      []
    );

    const handleDragOver = useCallback(
      (e: React.DragEvent, targetNode: FileNode) => {
        e.preventDefault();
        const validation = isValidDropTarget(targetNode, draggedNode);
        if (validation.valid) {
          e.dataTransfer.dropEffect = 'move';
          setDragOverNode(targetNode.id);
        } else {
          e.dataTransfer.dropEffect = 'none';
          setDragOverNode(null);
        }
      },
      [draggedNode, isValidDropTarget]
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {

      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const isLeavingTarget =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;

      if (isLeavingTarget) {
        setDragOverNode(null);
      }
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent, targetNode: FileNode) => {
        e.preventDefault();
        e.stopPropagation();

        console.log(`🎯 Drop attempted on: ${targetNode.name} (${targetNode.path})`);
        const validation = isValidDropTarget(targetNode, draggedNode);
        if (!draggedNode || !validation.valid) {
          console.log(`❌ Drop rejected${validation?.reason ? ` — ${  validation.reason}` : ''}`);
          setDraggedNode(null);
          setDragOverNode(null);
          return;
        }


        const moveFileToFolder = async () => {
          try {
            console.log(
              `🚀 Moving "${draggedNode.name}" from "${draggedNode.path}" to folder "${targetNode.name}" ("${targetNode.path}")`
            );

            moveFile(draggedNode.id, targetNode.path);


            if (!expandedFolders.includes(targetNode.id)) {
              toggleFolder(targetNode.id);
            }


            setTimeout(() => {
              const targetElement = document.querySelector(
                `[data-file-id="${targetNode.id}"]`
              ) as HTMLElement;
              const movedElement = document.querySelector(
                `[data-file-id="${draggedNode.id}"]`
              ) as HTMLElement;
              if (targetElement) {
                targetElement.style.animation = `refinedHighlight ${getRefinedDuration(REFINED_MOTION.duration.slow)} ease-out`;
              }
              if (movedElement) {
                movedElement.style.animation = `refinedHighlight ${getRefinedDuration(REFINED_MOTION.duration.slow)} ease-out`;
              }
            }, 100);

            const sourcePath = draggedNode.path;
            const destPath = `${targetNode.path}/${draggedNode.name}`;
            console.log(`✅ Drop success: ${sourcePath} → ${destPath}`);
          } catch (error) {
            console.error('❌ Failed to move file:', error);

          }
        };

        moveFileToFolder();

        setDraggedNode(null);
        setDragOverNode(null);
      },
      [draggedNode, isValidDropTarget, moveFile, expandedFolders, toggleFolder]
    );


    const handleCreateNew = useCallback(
      (
        type: 'file' | 'folder',
        parentPath?: string,
        language?: string,
        templateContent?: string,
        fileName?: string
      ) => {

        const resolveParentPath = (raw?: string) => (raw && raw.length > 0 ? raw : '');
        const getSiblings = (pPath: string): string[] => {
          if (!pPath) {
            return files.filter(f => !f.path.includes('/')).map(f => f.name);
          }
          const folder = getFileByPath(pPath);
          return folder?.children?.map(c => c.name) ?? [];
        };
        const uniqueName = (base: string, _isFolder: boolean, ext: string = ''): string => {
          const pPath = resolveParentPath(parentPath || '');
          const siblings = new Set(getSiblings(pPath));
          if (!siblings.has(`${base}${ext}`)) return `${base}${ext}`;
          let i = 2;
          while (siblings.has(`${base} (${i})${ext}`)) i++;
          return `${base} (${i})${ext}`;
        };

        const parent = resolveParentPath(parentPath || '');

        if (type === 'folder') {
          const name = uniqueName('New Folder', true);
          const folderPath = parent ? `${parent}/${name}` : name;
          const id = Math.random().toString(36).substring(7);
          const node: FileNode = {
            id,
            name,
            type: 'folder',
            path: folderPath,
            content: '',
            language: 'folder',
            lastModified: new Date(),
            children: [],
          };
          addFile(node, parent || '/');

          const parentFolder = parent ? getFileByPath(parent) : null;
          if (parentFolder && !expandedFolders.includes(parentFolder.id))
            toggleFolder(parentFolder.id);

          setTimeout(() => {
            const el = document.querySelector(`[data-file-id="${id}"]`) as HTMLElement;
            if (el)
              el.style.animation = `refinedFadeInUp ${getRefinedDuration(REFINED_MOTION.duration.normal)} ${REFINED_MOTION.easing.smooth}`;
            setRenaming(id);
          }, 50);
          return;
        }


        const lang = (language || 'plaintext').toLowerCase();

        const getDefaultExtForLang = (langKey: string): string => {
          switch (langKey) {
            case 'react':
            case 'tsx':
              return '.tsx';
            case 'jsx':
              return '.jsx';
            case 'typescript':
              return '.ts';
            case 'javascript':
              return '.js';
            case 'html':
              return '.html';
            case 'css':
              return '.css';
            case 'scss':
              return '.scss';
            case 'python':
              return '.py';
            case 'json':
              return '.json';
            case 'markdown':
              return '.md';
            case 'latex':
              return '.tex';
            case 'bibtex':
              return '.bib';
            default:
              return '.txt';
          }
        };

        const extFromName = (n: string): string => {
          const idx = n.lastIndexOf('.');
          return idx > 0 ? n.substring(idx).toLowerCase() : '';
        };


        const guessExtFromContent = (content?: string): string | null => {
          if (!content) return null;
          const trimmed = content.trim().toLowerCase();
          if (trimmed.startsWith('<!doctype html') || trimmed.startsWith('<html')) return '.html';
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) return '.json';
          if (
            trimmed.includes('import react') ||
            trimmed.includes('from "react"') ||
            trimmed.includes("from 'react'")
          )
            return '.tsx';
          if (trimmed.startsWith('#!/usr/bin/env bash') || trimmed.includes('\necho '))
            return '.sh';
          if (trimmed.startsWith('#!/usr/bin/env python') || trimmed.includes('\nprint('))
            return '.py';
          if (trimmed.startsWith('package ') || trimmed.includes('public class')) return '.java';
          if (trimmed.includes('fn main()') && trimmed.includes('println!')) return '.rs';
          if (trimmed.startsWith('\\documentclass')) return '.tex';
          if (
            trimmed.startsWith('@article') ||
            trimmed.startsWith('@book') ||
            trimmed.startsWith('@misc')
          )
            return '.bib';
          return null;
        };


        let name: string;
        if (fileName && fileName.trim().length > 0) {
          const pPath = resolveParentPath(parentPath || '');
          const siblings = new Set(getSiblings(pPath));
          let provided = fileName.trim();
          const hasExt = !!extFromName(provided);
          if (!hasExt) {
            const ext =
              getDefaultExtForLang(lang) || guessExtFromContent(templateContent) || '.txt';
            provided = `${provided}${ext}`;
          }
          if (!siblings.has(provided)) {
            name = provided;
          } else {
            const idx = provided.lastIndexOf('.');
            const base = idx > 0 ? provided.substring(0, idx) : provided;
            const ext = idx > 0 ? provided.substring(idx) : '';
            let i = 2;
            let candidate = `${base} (${i})${ext}`;
            while (siblings.has(candidate)) {
              i++;
              candidate = `${base} (${i})${ext}`;
            }
            name = candidate;
          }
        } else {
          const ext = getDefaultExtForLang(lang);
          name = uniqueName('New File', false, ext);
        }

        const fileExt = extFromName(name);
        const languageFromExt = (ext: string, hint?: string): string => {
          switch (ext) {
            case '.tsx':
              return 'typescriptreact';
            case '.jsx':
              return 'javascriptreact';
            case '.ts':
              return 'typescript';
            case '.js':
              return 'javascript';
            case '.html':
              return 'html';
            case '.css':
              return 'css';
            case '.scss':
              return 'scss';
            case '.json':
              return 'json';
            case '.md':
              return 'markdown';
            case '.py':
              return 'python';
            case '.java':
              return 'java';
            case '.cs':
              return 'csharp';
            case '.cpp':
              return 'cpp';
            case '.c':
              return 'c';
            case '.go':
              return 'go';
            case '.rs':
              return 'rust';
            case '.php':
              return 'php';
            case '.rb':
              return 'ruby';
            case '.kt':
              return 'kotlin';
            case '.scala':
              return 'scala';
            case '.yml':
            case '.yaml':
              return 'yaml';
            case '.toml':
              return 'toml';
            case '.ini':
              return 'ini';
            case '.xml':
              return 'xml';
            case '.sql':
              return 'sql';
            case '.sh':
              return 'bash';
            case '.ps1':
              return 'powershell';
            case '.tex':
              return 'latex';
            case '.bib':
              return 'bibtex';
            default:
              if (hint) {
                const l = hint.toLowerCase();
                if (l === 'react' || l === 'tsx') return 'typescriptreact';
                if (l === 'jsx') return 'javascriptreact';
                if (l === 'latex') return 'latex';
                if (l === 'bibtex') return 'bibtex';
                return l;
              }
              return 'plaintext';
          }
        };

        const editorLanguage = languageFromExt(fileExt, language);
        const templateLangId =
          language?.toLowerCase() ||
          (fileExt === '.tsx' || fileExt === '.jsx' ? 'react' : fileExt.replace('.', '')) ||
          'plain';
        const id = Math.random().toString(36).substring(7);
        const filePath = parent ? `${parent}/${name}` : name;
        const newFile: FileNode = {
          id,
          name,
          type: 'file',
          path: filePath,
          content: templateContent || getGlobalTemplateContent(templateLangId, name),
          language: editorLanguage,
          lastModified: new Date(),
        };
        addFile(newFile, parent || '/');

        const parentFolder = parent ? getFileByPath(parent) : null;
        if (parentFolder && !expandedFolders.includes(parentFolder.id))
          toggleFolder(parentFolder.id);

        setTimeout(() => {
          const el = document.querySelector(`[data-file-id="${id}"]`) as HTMLElement;
          if (el)
            el.style.animation = `refinedFadeInUp ${getRefinedDuration(REFINED_MOTION.duration.normal)} ${REFINED_MOTION.easing.smooth}`;
          setRenaming(id);
        }, 50);


      },
      [files, addFile, expandedFolders, toggleFolder, getFileByPath, setRenaming]
    );


    const handleImportFolder = useCallback(
      (importedFiles: FileNode[]) => {
        try {

          importedFiles.forEach(fileNode => {
            addFile(fileNode);
          });

          console.log(`📂 Successfully imported ${importedFiles.length} items`);


        } catch (error) {
          console.error('Failed to import folder:', error);

        }
      },
      [addFile]
    );


    const renderFileNode = useCallback(
      (node: FileNode, depth: number = 0): React.ReactNode => {
        const isExpanded = expandedFolders.includes(node.id);
        const isSelected = selectedFile === node.id;
        const isHovered = hoveredItem === node.id;
        const isEditing = renaming === node.id;
        const isDragOver = dragOverNode === node.id;
        const isBeingDragged = draggedNode?.id === node.id;
        const dropValidation = draggedNode
          ? isValidDropTarget(node, draggedNode)
          : { valid: false };
        const isValidTarget = dropValidation.valid;

        const handleClick = (e: React.MouseEvent) => {
          e.stopPropagation();

          if (node.type === 'folder') {
            toggleFolder(node.id);
          } else {
            setSelectedFile(node.id);
            selectFile(node.id);
            openTab(node);
          }
        };

        const handleDoubleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (node.type === 'file') {
            openTab(node);
          }
        };

        const { base: currentBase, ext: currentExt } = splitNameExt(node.name);

        const commitRename = (newBase: string) => {
          const trimmed = newBase.trim();
          if (!trimmed) {
            setRenaming(null);
            return;
          }
          const newName = `${trimmed}${currentExt}`;
          if (newName !== node.name) {
            renameFile(node.id, newName);
          }
          setRenaming(null);
        };

        const handleKeyDownItem = (e: React.KeyboardEvent) => {
          if (e.key === 'F2') {
            e.preventDefault();
            setRenaming(node.id);
          }
        };

        return (
          <div key={node.id}>
            <div
              data-file-id={node.id}
              id={`treeitem-${node.id}`}
              className={`file-tree-item ${isBeingDragged ? 'file-item-dragging' : ''} ${isDragOver && draggedNode ? (isValidTarget ? 'drop-target-valid drop-zone-active' : 'drop-target-invalid') : ''}`.trim()}
              style={{
                ...styles.fileItem(depth, isSelected, isHovered),
                ...(isBeingDragged
                  ? {
                      opacity: 0.5,
                      transform: 'scale(0.98)',
                    }
                  : {}),

                ...(draggedNode && node.type === 'folder' && isValidTarget && !isDragOver
                  ? {
                      outline: `1px dashed ${REFINED_COLORS.goldPrimary}40`,
                      outlineOffset: '2px',
                    }
                  : {}),
              }}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
              onKeyDown={handleKeyDownItem}
              onContextMenu={e => handleContextMenu(e, node)}
              onMouseEnter={() => setHoveredItem(node.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onDragStart={e => handleDragStart(e, node)}
              onDragEnd={handleDragEnd}
              onDragOver={e => handleDragOver(e, node)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, node)}
              draggable={!isEditing && true}
              role="treeitem"
              aria-level={depth + 1}
              aria-expanded={node.type === 'folder' ? isExpanded : undefined}
              aria-selected={isSelected}
              aria-label={`${node.type === 'folder' ? 'Folder' : 'File'}: ${node.name}`}
              aria-description={
                draggedNode && isDragOver
                  ? isValidTarget
                    ? 'Valid drop target'
                    : `Invalid drop target: ${dropValidation.reason}`
                  : undefined
              }
              tabIndex={0}
            >
              {node.type === 'folder' && (
                <ChevronRight style={styles.folderChevron(isExpanded)} aria-hidden="true" />
              )}

              {node.type === 'folder' ? (
                <div style={styles.folderIcon(isExpanded)}>
                  {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
                </div>
              ) : (
                <div style={styles.fileIcon}>
                  <FileIcon filename={node.name} size={16} />
                </div>
              )}

              {isEditing ? (
                <InlineRename
                  base={currentBase}
                  ext={currentExt}
                  autoFocus
                  siblingNames={(getParentFolder(node.path)?.children || [])
                    .filter(c => c.id !== node.id)
                    .map(c => c.name)}
                  onCommit={(newBase: string) => commitRename(newBase)}
                  onCancel={() => setRenaming(null)}
                />
              ) : (
                <span style={styles.fileName(false)} className="file-name-hover">
                  <HighlightedText text={node.name} searchQuery={debouncedSearchQuery} />
                </span>
              )}
            </div>

            {node.type === 'folder' && isExpanded && node.children ? <div>{node.children.map(child => renderFileNode(child, depth + 1))}</div> : null}
          </div>
        );
      },
      [
        expandedFolders,
        selectedFile,
        hoveredItem,
        renaming,
        dragOverNode,
        draggedNode,
        styles,
        debouncedSearchQuery,
        toggleFolder,
        selectFile,
        openTab,
        handleContextMenu,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        updateFile,
        setRenaming,
        isValidDropTarget,
      ]
    );


    const contextMenuItems = useMemo(() => {
      if (!ctxMenu.selected) return [];

      const fileNode = ctxMenu.selected as FileNode;
      const isFolder = fileNode.type === 'folder';
      const canPaste = isFolder && !!clipboardNode;

      return [
        {
          icon: <Edit3 size={14} />,
          label: 'Rename',
          action: () => {
            setRenaming(fileNode.id);
            hideContextMenu();
          },
        },
        {
          icon: <Copy size={14} />,
          label: 'Copy',
          action: () => {
            handleCopy(fileNode);
            hideContextMenu();
          },
        },
        {
          icon: <Move size={14} />,
          label: 'Cut',
          action: () => {
            handleCut(fileNode);
            hideContextMenu();
          },
        },
        ...(isFolder
          ? [
              {
                icon: <Plus size={14} />,
                label: 'Paste',
                disabled: !canPaste,
                action: () => {
                  if (canPaste) handlePasteInto(fileNode);
                  hideContextMenu();
                },
              },
            ]
          : []),
        { type: 'separator' },
        ...(isFolder
          ? [
              {
                icon: <Plus size={14} />,
                label: 'New File',
                action: () => {
                  handleCreateNew('file', fileNode.path);
                  hideContextMenu();
                },
              },
              {
                icon: <FolderPlus size={14} />,
                label: 'New Folder',
                action: () => {
                  handleCreateNew('folder', fileNode.path);
                  hideContextMenu();
                },
              },
              { type: 'separator' },
            ]
          : []),
        {
          icon: <Info size={14} />,
          label: 'Properties',
          action: () => {
            setModal({
              type: 'properties',
              fileNode,
              isVisible: true,
            });
            hideContextMenu();
          },
        },
        { type: 'separator' },
        {
          icon: <Trash2 size={14} />,
          label: 'Delete',
          action: () => {
            setModal({
              type: 'delete',
              fileNode,
              isVisible: true,
            });
            hideContextMenu();
          },
        },
      ];
    }, [
      ctxMenu.selected,
      clipboardNode,
      setRenaming,
      hideContextMenu,
      handleCreateNew,
      handleCopy,
      handleCut,
      handlePasteInto,
    ]);


    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setModal(prev => ({ ...prev, isVisible: false }));
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, []);


    return (
      <div style={styles.container} className={className}>
        {}
        {ideProEnabled ? (
          <HeaderPro
            width={sidebarWidth}
            onNewFile={(language?: string, template?: string, fileName?: string) =>
              handleCreateNew('file', undefined, language, template, fileName)
            }
            onNewFolder={() => handleCreateNew('folder')}
            onUpload={() => {

              try {
                const input = document.querySelector('input[type="file"][data-explorer-upload]') as HTMLInputElement | null;
                input?.click();
              } catch {}
            }}
            onRefresh={() => setSearchQuery(searchQuery)}
            onFilterChange={setSearchQuery}
            breadcrumb={[]}
          />
        ) : (
          <FileExplorerHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateFile={(language, templateContent, fileName) =>
              handleCreateNew('file', undefined, language, templateContent, fileName)
            }
            onCreateFolder={() => handleCreateNew('folder')}
            onImportFolder={handleImportFolder}
            sidebarWidth={sidebarWidth}
          />
        )}

        {}
        <div style={styles.content}>
          <div style={styles.scrollableContent} className="refined-scrollbar">
            {filteredFiles.length > 0 ? (
              <div
                style={styles.fileTree}
                role="tree"
                aria-label="File Explorer"
                aria-activedescendant={selectedFile ? `treeitem-${selectedFile}` : undefined}
                tabIndex={0}
                onKeyDown={handleTreeKeyDown}
              >
                {filteredFiles.map(file => renderFileNode(file))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <Folder style={styles.emptyStateIcon} />
                <div style={styles.emptyStateText}>
                  {searchQuery ? 'No files match your search' : 'No files in this workspace'}
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        {ctxMenu.visible ? <div
            ref={contextMenuRef}
            style={{
              ...styles.contextMenu,
              left: `${ctxMenu.x}px`,
              top: `${ctxMenu.y}px`,
            }}
            role="menu"
            aria-label="File actions"
          >
            {contextMenuItems.map((item, index) =>
              item.type === 'separator' ? (
                <div key={index} style={styles.contextMenuSeparator} />
              ) : (
                <div
                  key={index}
                  role="menuitem"
                  aria-label={typeof item.label === 'string' ? item.label : 'Action'}
                  title={item.disabled && item.label === 'Paste' ? 'Select a folder' : undefined}
                  tabIndex={item.disabled ? -1 : 0}
                  onClick={item.disabled ? undefined : item.action}
                  onKeyDown={e => {
                    if (item.disabled) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (typeof item.action === 'function') item.action();
                    }
                  }}
                  onMouseEnter={e => {
                    if (item.disabled) return;
                    (e.currentTarget as HTMLDivElement).style.background = REFINED_COLORS.hover;
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateX(2px)';
                    const iconEl = e.currentTarget.querySelector('.ctx-icon') as HTMLElement | null;
                    if (iconEl) iconEl.style.color = REFINED_COLORS.goldHover;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    (e.currentTarget as HTMLDivElement).style.transform = 'none';
                    const iconEl = e.currentTarget.querySelector('.ctx-icon') as HTMLElement | null;
                    if (iconEl) iconEl.style.color = REFINED_COLORS.goldPrimary;
                  }}
                  onFocus={e => {
                    if (item.disabled) return;
                    (e.currentTarget as HTMLDivElement).style.background = REFINED_COLORS.hover;
                    const iconEl = e.currentTarget.querySelector('.ctx-icon') as HTMLElement | null;
                    if (iconEl) iconEl.style.color = REFINED_COLORS.goldHover;
                  }}
                  onBlur={e => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    const iconEl = e.currentTarget.querySelector('.ctx-icon') as HTMLElement | null;
                    if (iconEl) iconEl.style.color = REFINED_COLORS.goldPrimary;
                  }}
                  style={{
                    ...styles.contextMenuItem(false),
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    ...(item.disabled
                      ? { opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(0.4)' }
                      : {}),
                  }}
                >
                  <span className="ctx-icon" style={styles.contextMenuIcon}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                </div>
              )
            )}
          </div> : null}

        {}
        {modal.isVisible ? <div
            style={styles.modalOverlay}
            onClick={() => setModal(prev => ({ ...prev, isVisible: false }))}
            role="dialog"
            aria-modal="true"
            aria-label={
              modal.type === 'properties'
                ? 'File Properties'
                : modal.type === 'delete'
                  ? 'Delete File'
                  : 'Move File'
            }
          >
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={modal.type === 'delete' ? styles.modalTitleDanger : styles.modalTitle}>
                  {modal.type === 'properties' && 'File Properties'}
                  {modal.type === 'delete' && 'Delete File'}
                  {modal.type === 'move' && 'Move File'}
                </h3>
                <button
                  style={styles.modalCloseButton}
                  onClick={() => setModal(prev => ({ ...prev, isVisible: false }))}
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              <div style={styles.modalContent}>
                {modal.type === 'properties' && modal.fileNode ? <div style={styles.modalKV}>
                    <div style={styles.modalKVRow}>
                      <div style={styles.modalKVKey}>Name</div>
                      <div style={styles.modalKVValue}>{modal.fileNode.name}</div>
                    </div>
                    <div style={styles.modalKVRow}>
                      <div style={styles.modalKVKey}>Type</div>
                      <div style={styles.modalKVValue}>{modal.fileNode.type}</div>
                    </div>
                    <div style={styles.modalKVRow}>
                      <div style={styles.modalKVKey}>Path</div>
                      <div style={styles.modalKVValue}>{modal.fileNode.path}</div>
                    </div>
                    <div style={styles.modalKVRow}>
                      <div style={styles.modalKVKey}>Size</div>
                      <div style={styles.modalKVValue}>{modal.fileNode.size || 0} bytes</div>
                    </div>
                    <div style={styles.modalKVRow}>
                      <div style={styles.modalKVKey}>Last Modified</div>
                      <div style={styles.modalKVValue}>
                        {modal.fileNode.lastModified?.toLocaleString()}
                      </div>
                    </div>
                  </div> : null}

                {modal.type === 'delete' && modal.fileNode ? <div>
                    <p style={{ ...styles.modalText, marginBottom: '6px' }}>
                      Are you sure you want to delete "{modal.fileNode.name}"?
                    </p>
                    {modal.fileNode.type === 'folder' && (
                      <p style={styles.modalWarning}>
                        This will also delete all files and folders inside it.
                      </p>
                    )}
                  </div> : null}
              </div>

              <div style={styles.modalButtons}>
                {modal.type === 'delete' && (
                  <>
                    <button
                      style={styles.modalButton('secondary')}
                      onClick={() => setModal(prev => ({ ...prev, isVisible: false }))}
                    >
                      Cancel
                    </button>
                    <button
                      style={styles.modalButton('danger')}
                      onClick={() => {
                        if (modal.fileNode) {
                          const parent = getParentFolder(modal.fileNode.path);
                          deleteFile(modal.fileNode.id);

                          setTimeout(() => {
                            const targetId = parent?.id;
                            if (targetId) {
                              setSelectedFile(targetId);
                              selectFile(targetId);
                              const el = document.querySelector(
                                `[data-file-id="${targetId}"]`
                              ) as HTMLElement | null;
                              if (el) {
                                try {
                                  el.focus({ preventScroll: false });
                                  (el as any).scrollIntoView?.({ block: 'nearest' });
                                } catch {}
                              }
                            }
                          }, 80);
                        }
                        setModal(prev => ({ ...prev, isVisible: false }));
                      }}
                    >
                      Delete
                    </button>
                  </>
                )}

                {modal.type === 'properties' && (
                  <button
                    style={styles.modalButton('primary')}
                    onClick={() => setModal(prev => ({ ...prev, isVisible: false }))}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div> : null}
        {}
        <div
          aria-live="polite"
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clip: 'rect(1px, 1px, 1px, 1px)',
          }}
        >
          {liveMessage}
        </div>
      </div>
    );
  }
);

FileExplorer.displayName = 'FileExplorer';

export default FileExplorer;
