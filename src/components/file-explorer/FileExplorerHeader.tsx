import React, { useCallback, useRef, useState } from 'react';
import JSZip from 'jszip';
import {
  Download,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  Save,
  Search,
  Upload,
  X,
} from 'lucide-react';
import type { FileNode } from '../../types/state';
import NewFileModal from './NewFileModal';


const COLORS = {
  border: '#3a3a3a',
  divider: '#2a2a2a',
  textPrimary: '#e8e8e8',
  textSecondary: '#b8b8b8',
  textTertiary: '#888888',
  goldPrimary: '#00a6d7',
  goldSecondary: '#5FD6F5',
  goldHover: '#00A6D7',
  bgDark: '#1a1a1a',
  bgSecondary: '#2a2a2a',
  borderSubtle: '#333333',
};

const TYPOGRAPHY = {
  fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
  fontSize: {
    small: '12px',
    base: '13px',
    large: '16px',
  },
  fontWeight: {
    medium: 500,
    semibold: 600,
  },
  lineHeight: {
    relaxed: 1.6,
  },
};

const MOTION = {
  duration: {
    instant: '100ms',
    normal: '200ms',
  },
};

const getTransition = (props: string, duration = MOTION.duration.normal) =>
  `${props} ${duration} cubic-bezier(0.4, 0, 0.2, 1)`;


function ensureExtension(fileName: string, expectedExt: string): string {
  return fileName.replace(/\.[^/.]+$/, '') + expectedExt;
}


const LANGUAGE_EXT_MAP: Record<string, string> = {

  react: '.tsx',
  javascript: '.js',
  typescript: '.ts',
  jsx: '.jsx',
  tsx: '.tsx',
  html: '.html',
  css: '.css',
  scss: '.scss',
  vue: '.vue',
  svelte: '.svelte',
  angular: '.ts',

  python: '.py',
  java: '.java',
  csharp: '.cs',
  cpp: '.cpp',
  c: '.c',
  go: '.go',
  rust: '.rs',
  php: '.php',
  ruby: '.rb',
  kotlin: '.kt',
  scala: '.scala',
  nodejs: '.js',

  json: '.json',
  yaml: '.yml',
  toml: '.toml',
  ini: '.ini',
  xml: '.xml',
  markdown: '.md',
  sql: '.sql',

  bash: '.sh',
  powershell: '.ps1',
  dockerfile: '.dockerfile',
  terraform: '.tf',

  haskell: '.hs',
  erlang: '.erl',
  elixir: '.ex',
  clojure: '.clj',
  assembly: '.asm',

  latex: '.tex',
  bibtex: '.bib',

  plain: '.txt',
  plaintext: '.txt',
};


interface FileExplorerHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCreateFile: (language?: string, template?: string, fileName?: string) => void;
  onCreateFolder: () => void;
  onImportFolder: (files: FileNode[]) => void;
  files?: FileNode[];
  sidebarWidth?: number;
}


const useHeaderStyles = (sidebarWidth: number = 280) => ({

  container: {
    width: `${sidebarWidth}px`,
    minHeight: '100px',
    background: '#000',
    border: `1px solid ${COLORS.border}`,
    borderBottom: `1px solid ${COLORS.divider}`,
    boxShadow: '0 0 0 1px #000',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.fontSize.base,
  color: COLORS.goldPrimary,
    position: 'relative' as const,
    zIndex: 10,
    overflow: 'hidden',
  },

  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '44px',
    padding: '0 16px',
    gap: '12px',
    borderBottom: `1px solid ${COLORS.borderSubtle}`,
  },

  brandSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  color: COLORS.goldPrimary,
    fontSize: TYPOGRAPHY.fontSize.small,
    flex: '0 0 auto',
  },


  searchSection: {
    flex: '1 1 auto',
    position: 'relative' as const,
    maxWidth: '200px',
  },

  searchInput: {
    width: '100%',
    height: '32px',
    background: '#0f0f10',
    border: '1px solid #222',
    borderRadius: '6px',
    padding: '0 64px 0 40px',
  color: COLORS.goldPrimary,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily,
    outline: 'none',
    transition: getTransition('border-color, background-color, box-shadow'),
    boxShadow: 'none',
    '&:focus': {
      borderColor: COLORS.goldPrimary,
      background: '#141414',
      boxShadow: `0 0 0 1px ${COLORS.goldPrimary}55`,
    },
  },

  searchIcon: {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6f6f6f',
    pointerEvents: 'none' as const,
  },

  clearButton: {
    position: 'absolute' as const,
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%) scale(1)',
    width: '20px',
    height: '20px',
    background: 'transparent',
    border: 'none',
  color: COLORS.textTertiary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: getTransition('all'),
    opacity: 0.7,
    '&:hover': {
      color: COLORS.goldPrimary,
      background: '#161616',
      opacity: 1,
      transform: 'translateY(-50%) scale(1.15)',
      boxShadow: `0 0 0 1px ${COLORS.borderSubtle}`,
    },
    '&:active': {
      transform: 'translateY(-50%) scale(0.9)',
      transition: getTransition('all', MOTION.duration.instant),
    },
  },


  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 16px 16px',
    flexWrap: 'wrap' as const,
  },


  actionButton: {
    height: '32px',
    minWidth: '88px',
    background: '#0f0f10',
    border: '1px solid #222',
    borderRadius: '6px',
  color: COLORS.textSecondary,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
    gap: '6px',
    fontSize: TYPOGRAPHY.fontSize.small,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    transition: getTransition('all'),
    transform: 'scale(1)',
    '&:hover': {
      background: '#141414',
      borderColor: COLORS.borderSubtle,
      color: COLORS.goldPrimary,
      transform: 'scale(1.03) translateY(-1px)',
    },
    '&:active': {
      transform: 'scale(0.95)',
      transition: getTransition('all', MOTION.duration.instant),
    },
    '&:focus': {
      outline: '2px solid rgba(201,178,106,0.4)',
      outlineOffset: '2px',
    },
  },


  primaryButton: {
  background: COLORS.goldPrimary,
    color: '#000',
    fontSize: TYPOGRAPHY.fontSize.small,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    cursor: 'pointer',
    transition: getTransition('all'),
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transform: 'scale(1)',
    '&:hover': {
      background: COLORS.goldHover,
      transform: 'scale(1.05) translateY(-1px)',
    },
    '&:active': {
      transform: 'scale(0.95)',
      transition: getTransition('all', MOTION.duration.instant),
    },
  },


  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: '0',
    background: '#0b0b0b',
    border: '1px solid #1f1f1f',
    borderRadius: '8px',
    minWidth: '140px',
    zIndex: 1000,
    boxShadow: '0 0 0 1px #0b0b0b',
    marginTop: '4px',
    overflow: 'hidden',
  },

  dropdownItem: {
    padding: '10px 12px',
    cursor: 'pointer',
  color: COLORS.goldPrimary,
    fontSize: TYPOGRAPHY.fontSize.small,
    borderBottom: '1px solid #1a1a1a',
    transition: getTransition('all'),
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&:hover': {
      background: '#141414',
      color: COLORS.goldHover,
    },
    '&:last-child': {
      borderBottom: 'none',
    },
  },

  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },

  modalContent: {
    background: '#000',
    border: '1px solid #1a1a1a',
    borderRadius: '12px',
    padding: '24px',
    minWidth: '400px',
    maxWidth: '500px',
    boxShadow: '0 0 0 1px #000',
  color: COLORS.goldPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
  },

  modalHeader: {
    fontSize: TYPOGRAPHY.fontSize.large,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  color: COLORS.goldPrimary,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  modalBody: {
    fontSize: TYPOGRAPHY.fontSize.base,
  color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
    marginBottom: '20px',
  },

  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },

  modalButton: {
    height: '36px',
    padding: '0 16px',
    border: '1px solid #222',
    borderRadius: '6px',
    background: '#0f0f10',
  color: COLORS.goldPrimary,
    fontSize: TYPOGRAPHY.fontSize.small,
    fontFamily: TYPOGRAPHY.fontFamily,
    cursor: 'pointer',
    transition: getTransition('all'),
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transform: 'scale(1)',
    '&:hover': {
      background: '#141414',
      borderColor: COLORS.borderSubtle,
      color: COLORS.goldHover,
      transform: 'scale(1.05)',
    },
    '&:active': {
      transform: 'scale(0.95)',
    },
  },

  primaryModalButton: {
  background: COLORS.goldPrimary,
    color: '#000',
    fontSize: TYPOGRAPHY.fontSize.small,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    cursor: 'pointer',
    transition: getTransition('all'),
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transform: 'scale(1)',
    '&:hover': {
      background: COLORS.goldHover,
      transform: 'scale(1.05) translateY(-1px)',
    },
    '&:active': {
      transform: 'scale(0.95)',
      transition: getTransition('all', MOTION.duration.instant),
    },
  },


  hiddenInput: {
    position: 'absolute' as const,
    left: '-9999px',
    opacity: 0,
    pointerEvents: 'none' as const,
  },
});


const injectKeyframes = () => {
  const keyframes = `
    @keyframes refinedHighlight {
      0% {
        box-shadow: 0 0 0 rgba(194, 167, 110, 0.8);
        transform: scale(1);
      }
      50% {
        box-shadow: 0 0 25px rgba(194, 167, 110, 0.6);
        transform: scale(1.05);
      }
      100% {
        box-shadow: 0 0 0 rgba(194, 167, 110, 0);
        transform: scale(1);
      }
    }
  `;

  if (!document.querySelector('#refined-keyframes')) {
    const style = document.createElement('style');
    style.id = 'refined-keyframes';
    style.textContent = keyframes;
    document.head.appendChild(style);
  }
};

export const FileExplorerHeader: React.FC<FileExplorerHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onCreateFile,
  onCreateFolder,
  onImportFolder,
  files = [],
  sidebarWidth = 280,
}) => {
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const styles = useHeaderStyles(sidebarWidth);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  const handleClearSearch = useCallback(() => {
    onSearchChange('');

    searchInputRef.current?.focus();
  }, [onSearchChange]);

  const handleCreateFile = useCallback(
    (language?: string, template?: string, fileName?: string) => {

      if (language && fileName && template) {

        const langKey = language.toLowerCase();
        const expectedExt = LANGUAGE_EXT_MAP[langKey] || '.txt';
        const finalName = ensureExtension(fileName, expectedExt);

        onCreateFile(language, template, finalName);
      } else {

        onCreateFile(language, template);
      }
    },
    [onCreateFile]
  );

  const handleCreateFolder = useCallback(() => {
    onCreateFolder();
  }, [onCreateFolder]);


  const handleFileImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const fileNodes: FileNode[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await file.text().catch(() => '');

        fileNodes.push({
          id: `imported-file-${Date.now()}-${i}`,
          name: file.name,
          type: 'file',
          path: file.webkitRelativePath || file.name,
          content,
          size: file.size,
          lastModified: new Date(file.lastModified),
          language: file.name.split('.').pop() || 'text',
        });
      }

      onImportFolder(fileNodes);
      e.target.value = '';
    },
    [onImportFolder]
  );


  const handleFolderImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const fileNodes: FileNode[] = [];
      const folderStructure = new Set<string>();


      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const pathParts = file.webkitRelativePath.split('/');


        let currentPath = '';
        for (let j = 0; j < pathParts.length - 1; j++) {
          const folderName = pathParts[j];
          currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

          if (!folderStructure.has(currentPath)) {
            folderStructure.add(currentPath);
            fileNodes.push({
              id: `imported-folder-${currentPath.replace(/[^a-zA-Z0-9]/g, '-')}`,
              name: folderName,
              type: 'folder',
              path: currentPath,
              size: 0,
              lastModified: new Date(),
              children: [],
            });
          }
        }


        const content = await file.text().catch(() => '');
        fileNodes.push({
          id: `imported-file-${Date.now()}-${i}`,
          name: file.name,
          type: 'file',
          path: file.webkitRelativePath,
          content,
          size: file.size,
          lastModified: new Date(file.lastModified),
          language: file.name.split('.').pop() || 'text',
        });
      }

      onImportFolder(fileNodes);
      e.target.value = '';
    },
    [onImportFolder]
  );


  const handleSave = useCallback(async () => {
    try {

      const projectData = {
        timestamp: new Date().toISOString(),
        projectName: 'SynapseIDE-Project',
        files: [],
      };

      const blob = new Blob([JSON.stringify(projectData, null, 2)], {
        type: 'application/json',
      });


      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `project-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);


      const saveButton = document.querySelector('[title*="Save project"]') as HTMLElement;
      if (saveButton) {
        saveButton.style.animation = 'refinedHighlight 0.6s ease-out';
        setTimeout(() => {
          saveButton.style.animation = '';
        }, 600);
      }

      console.log('Project saved successfully');
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  }, []);


  const traverseFiles = useCallback(
    (fileNodes: FileNode[], basePath: string = ''): Array<{ path: string; content: string }> => {
      const result: Array<{ path: string; content: string }> = [];

      fileNodes.forEach(node => {
        const currentPath = basePath ? `${basePath}/${node.name}` : node.name;

        if (node.type === 'file' && node.content !== undefined) {
          result.push({
            path: currentPath,
            content: node.content,
          });
        } else if (node.type === 'folder' && node.children) {

          result.push(...traverseFiles(node.children, currentPath));
        }
      });

      return result;
    },
    []
  );


  const createRealZipFile = useCallback(
    async (filesToExport: Array<{ path: string; content: string }>): Promise<Blob> => {
      const zip = new JSZip();


      filesToExport.forEach(file => {
        zip.file(file.path, file.content);
      });


      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6,
        },
      });

      return zipBlob;
    },
    []
  );


  const handleExport = useCallback(async () => {
    setShowExportModal(true);
  }, []);


  const handleExportToFolder = useCallback(async () => {
    setIsExporting(true);
    setExportStatus('Opening folder picker...');

    try {

      if ('showDirectoryPicker' in window) {
        try {

          const directoryHandle = await (window as any).showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'downloads',
          });


          let filesToExport: Array<{ path: string; content: string }> = [];

          if (files.length > 0) {

            filesToExport = traverseFiles(files);
          } else {

            filesToExport = [
              {
                path: 'index.html',
                content:
                  '<!DOCTYPE html>\n<html>\n<head>\n  <title>SynapseIDE Project</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>',
              },
              {
                path: 'src/main.js',
                content:
                  'console.log("Hello from SynapseIDE!");\n\nfunction main() {\n  console.log("App started");\n}\n\nmain();',
              },
              {
                path: 'src/styles.css',
                content:
                  'body {\n  margin: 0;\n  padding: 20px;\n  font-family: "JetBrains Mono", monospace;\n  background: #121212;\n  color: #e8e8e8;\n}',
              },
              {
                path: 'package.json',
                content:
                  '{\n  "name": "synapse-ide-project",\n  "version": "1.0.0",\n  "description": "Project exported from SynapseIDE",\n  "main": "src/main.js",\n  "scripts": {\n    "start": "node src/main.js"\n  },\n  "author": "SynapseIDE",\n  "license": "MIT"\n}',
              },
              {
                path: 'README.md',
                content: '# SynapseIDE Project\n\nThis project was exported from SynapseIDE.',
              },
            ];
          }

          setExportStatus(`Writing ${filesToExport.length} files to folder...`);


          for (const file of filesToExport) {
            let targetHandle = directoryHandle;


            const pathParts = file.path.split('/');
            const fileName = pathParts.pop();


            for (const part of pathParts.filter(Boolean)) {
              targetHandle = await targetHandle.getDirectoryHandle(part, { create: true });
            }


            if (fileName) {
              const fileHandle = await targetHandle.getFileHandle(fileName, { create: true });
              const writable = await fileHandle.createWritable();
              await writable.write(file.content);
              await writable.close();
            }
          }

          setExportStatus(`✅ Successfully exported ${filesToExport.length} files to folder!`);

          setTimeout(() => {
            setExportStatus('');
            setShowExportModal(false);
          }, 3000);
        } catch (error) {
          if ((error as Error).name === 'AbortError') {
            setExportStatus('Export cancelled by user.');
          } else {
            console.error('Directory picker error:', error);
            setExportStatus('❌ Failed to access directory. Please try ZIP export instead.');
          }
          setTimeout(() => setExportStatus(''), 3000);
        }
      } else {
        setExportStatus('❌ File System Access API not supported. Please use ZIP export instead.');
        setTimeout(() => setExportStatus(''), 3000);
      }
    } catch (error) {
      console.error('Export to folder failed:', error);
      setExportStatus('❌ Export failed. Please try again.');
      setTimeout(() => setExportStatus(''), 3000);
    } finally {
      setIsExporting(false);
    }
  }, [files, traverseFiles]);


  const handleExportAsZip = useCallback(async () => {
    setIsExporting(true);
    setExportStatus('Preparing files for export...');

    try {

      let filesToExport: Array<{ path: string; content: string }> = [];

      if (files.length > 0) {

        filesToExport = traverseFiles(files);
      } else {

        filesToExport = [
          {
            path: 'index.html',
            content:
              '<!DOCTYPE html>\n<html>\n<head>\n  <title>SynapseIDE Project</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>',
          },
          {
            path: 'src/main.js',
            content:
              'console.log("Hello from SynapseIDE!");\n\n// Your code here\nfunction main() {\n  console.log("App started");\n}\n\nmain();',
          },
          {
            path: 'src/styles.css',
            content:
              'body {\n  margin: 0;\n  padding: 20px;\n  font-family: "JetBrains Mono", monospace;\n  background: #121212;\n  color: #e8e8e8;\n}\n\nh1 {\n  color: #00a6d7;\n}',
          },
          {
            path: 'package.json',
            content:
              '{\n  "name": "synapse-ide-project",\n  "version": "1.0.0",\n  "description": "Project exported from SynapseIDE",\n  "main": "src/main.js",\n  "scripts": {\n    "start": "node src/main.js"\n  },\n  "author": "SynapseIDE",\n  "license": "MIT"\n}',
          },
          {
            path: 'README.md',
            content:
              '# SynapseIDE Project\n\nThis project was exported from SynapseIDE.\n\n## Getting Started\n\n1. Install dependencies: `npm install`\n2. Start the project: `npm start`\n\n## Features\n\n- Modern JavaScript/TypeScript support\n- Professional project structure\n- Ready for deployment\n\nBuilt with ❤️ using SynapseIDE',
          },
        ];
      }

      setExportStatus(`Creating ZIP archive with ${filesToExport.length} files...`);


      const zipBlob = await createRealZipFile(filesToExport);

      setExportStatus('Downloading ZIP file...');


      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `synapse-ide-workspace-${timestamp}.zip`;

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus(`✅ Successfully exported ${filesToExport.length} files as ${filename}!`);

      setTimeout(() => {
        setExportStatus('');
        setShowExportModal(false);
      }, 3000);
    } catch (error) {
      console.error('ZIP export failed:', error);
      setExportStatus('❌ ZIP export failed. Please try again.');
      setTimeout(() => setExportStatus(''), 3000);
    } finally {
      setIsExporting(false);
    }
  }, [files, traverseFiles, createRealZipFile]);


  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      switch (true) {

        case isCtrl && e.key.toLowerCase() === 'k' && e.target !== searchInputRef.current:
          e.preventDefault();
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
          break;


        case isCtrl && !isShift && e.key.toLowerCase() === 'n':
          e.preventDefault();
          handleCreateFile();
          break;


        case isCtrl && isShift && e.key.toLowerCase() === 'n':
          e.preventDefault();
          handleCreateFolder();
          break;


        case isAlt && e.key.toLowerCase() === 'i':
          e.preventDefault();
          fileInputRef.current?.click();
          break;


        case isCtrl && !isShift && e.key.toLowerCase() === 's':
          e.preventDefault();
          handleSave();
          break;


        case isCtrl && isShift && e.key.toLowerCase() === 's':
          e.preventDefault();
          handleExport();
          break;


        case isCtrl && e.key.toLowerCase() === 'k':
          e.preventDefault();
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
          break;


        case e.key === 'Escape':
          setShowNewFileModal(false);
          setShowExportModal(false);
          break;
      }
    },
    [handleCreateFile, handleCreateFolder, handleSave, handleExport]
  );


  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    injectKeyframes();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      <div style={styles.container}>
        {}
        <div style={styles.topRow}>
          <div style={styles.brandSection}>
            <Folder size={16} />
            <span>Files</span>
          </div>

          <div style={styles.searchSection}>
            <div style={styles.searchIcon}>
              <Search size={14} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={styles.searchInput}
              title="Search files (Ctrl+K)"
            />
            {searchQuery ? <button
                onClick={handleClearSearch}
                style={styles.clearButton}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={14} />
              </button> : null}
          </div>
        </div>

        {}
        <div style={styles.actionsRow}>
          {}
          <button
            onClick={() => setShowNewFileModal(true)}
            style={styles.actionButton}
            title="Create new file"
            aria-label="Create new file"
          >
            <FileText size={14} />
            <span>New File</span>
          </button>

          {}
          <button
            onClick={handleCreateFolder}
            style={styles.actionButton}
            title="Create new folder"
            aria-label="Create new folder"
          >
            <FolderPlus size={14} />
            <span>New Folder</span>
          </button>

          {}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={styles.actionButton}
            title="Import files"
            aria-label="Import files"
          >
            <Upload size={14} />
            <span>Import</span>
          </button>

          {}
          <button
            onClick={() => folderInputRef.current?.click()}
            style={{ ...styles.actionButton, ...styles.primaryButton }}
            title="Import entire folder structure"
            aria-label="Import folder"
          >
            <FolderOpen size={14} />
            <span>Folder</span>
          </button>

          {}
          <button
            onClick={handleSave}
            style={styles.actionButton}
            title="Save project (Ctrl+S)"
            aria-label="Save project"
          >
            <Save size={14} />
            <span>Save</span>
          </button>

          {}
          <button
            onClick={handleExport}
            style={styles.actionButton}
            title="Export project (Ctrl+Shift+S)"
            aria-label="Export project"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>

        {}
        <input
          ref={fileInputRef}
          type="file"
          data-explorer-upload
          multiple
          style={styles.hiddenInput}
          onChange={handleFileImport}
          accept=".js,.ts,.tsx,.jsx,.css,.html,.md,.json,.txt,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift"
        />
        <input
          ref={folderInputRef}
          type="file"

          {...({ webkitdirectory: '' } as any)}
          style={styles.hiddenInput}
          onChange={handleFolderImport}
        />
      </div>

      {}
      {showExportModal ? <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <Download size={20} />
              Export Workspace
            </div>
            <div style={styles.modalBody}>
              Choose how you'd like to export your workspace:
              <br />
              <br />
              <strong>💾 ZIP Archive:</strong> Download all files as a compressed archive
              <br />
              <strong>📁 Folder Export:</strong> Save files directly to a local folder
              <br />
              <br />
              {exportStatus ? <div
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    background: exportStatus.includes('✅')
                      ? 'rgba(34, 197, 94, 0.1)'
                      : exportStatus.includes('❌')
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(194, 167, 110, 0.1)',
                    border: `1px solid ${
                      exportStatus.includes('✅')
                        ? 'rgba(34, 197, 94, 0.3)'
                        : exportStatus.includes('❌')
                          ? 'rgba(239, 68, 68, 0.3)'
                          : 'rgba(194, 167, 110, 0.3)'
                    }`,
                    color: exportStatus.includes('✅')
                      ? '#22C55E'
                      : exportStatus.includes('❌')
                        ? '#EF4444'
                        : '#00A6D7',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                  }}
                >
                  {exportStatus}
                </div> : null}
            </div>
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowExportModal(false)}
                style={styles.modalButton}
                disabled={isExporting}
                aria-label="Cancel export"
              >
                Cancel
              </button>
              <button
                onClick={handleExportAsZip}
                style={{ ...styles.modalButton, ...styles.primaryModalButton }}
                disabled={isExporting}
                aria-label="Export workspace as ZIP file"
                tabIndex={0}
              >
                <Download size={14} />
                {isExporting ? 'Creating ZIP...' : 'Export as ZIP'}
              </button>
              <button
                onClick={handleExportToFolder}
                style={styles.modalButton}
                disabled={isExporting}
                aria-label="Export workspace to selected folder"
                tabIndex={0}
              >
                <FolderOpen size={14} />
                {isExporting ? 'Exporting...' : 'Export to Folder'}
              </button>
            </div>
          </div>
        </div> : null}

      {}
      <NewFileModal
        isOpen={showNewFileModal}
        onClose={() => setShowNewFileModal(false)}
        onCreateFile={handleCreateFile}
        sidebarWidth={sidebarWidth}
      />
    </>
  );
};

export default FileExplorerHeader;
