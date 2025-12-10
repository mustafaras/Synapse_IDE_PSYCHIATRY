import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import type { FileNode } from '../types/state';

interface FileExplorerStore {

  files: FileNode[];
  selectedFiles: string[];
  expandedFolders: string[];
  draggedNode: FileNode | null;
  searchQuery: string;
  sortBy: 'name' | 'type' | 'modified' | 'size';
  sortOrder: 'asc' | 'desc';


  setFiles: (files: FileNode[]) => void;
  addFile: (file: FileNode, parentPath?: string) => void;
  updateFile: (fileId: string, updates: Partial<FileNode>) => void;
  deleteFile: (fileId: string) => void;
  renameFile: (fileId: string, newName: string) => void;
  moveFile: (fileId: string, newParentPath: string) => void;
  clearFiles: () => void;


  selectFile: (fileId: string, multiSelect?: boolean) => void;
  selectFiles: (fileIds: string[]) => void;
  clearSelection: () => void;


  expandFolder: (folderId: string) => void;
  collapseFolder: (folderId: string) => void;
  toggleFolder: (folderId: string) => void;
  createFolder: (parentPath: string, name: string) => void;


  setDraggedNode: (node: FileNode | null) => void;
  handleDrop: (targetPath: string) => void;


  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: 'name' | 'type' | 'modified' | 'size') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;


  getFileById: (fileId: string) => FileNode | null;
  getFileByPath: (path: string) => FileNode | null;
  getParentFolder: (filePath: string) => FileNode | null;
  getFilteredFiles: () => FileNode[];
}


const sampleFiles: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    path: 'src',
    size: 0,
    lastModified: new Date('2024-01-15'),
    isExpanded: true,
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        path: 'src/components',
        size: 0,
        lastModified: new Date('2024-01-15'),
        children: [
          {
            id: '5',
            name: 'Header.tsx',
            type: 'file',
            path: 'src/components/Header.tsx',
            size: 1024,
            lastModified: new Date('2024-01-19'),
            language: 'typescript',
            content:
              'import React from "react";\n\nexport const Header = () => {\n  return <header>My App</header>;\n};',
          },
          {
            id: '6',
            name: 'Button.tsx',
            type: 'file',
            path: 'src/components/Button.tsx',
            size: 768,
            lastModified: new Date('2024-01-17'),
            language: 'typescript',
            content:
              'import React from "react";\n\ninterface ButtonProps {\n  children: React.ReactNode;\n}\n\nexport const Button: React.FC<ButtonProps> = ({ children }) => {\n  return <button>{children}</button>;\n};',
          },
        ],
      },
      {
        id: '9',
        name: 'assets',
        type: 'folder',
        path: 'src/assets',
        size: 0,
        lastModified: new Date('2024-01-12'),
        children: [
          {
            id: '10',
            name: 'logo.svg',
            type: 'file',
            path: 'src/assets/logo.svg',
            size: 3072,
            lastModified: new Date('2024-01-12'),
            language: 'xml',
            content: '<svg>...</svg>',
          },
        ],
      },
      {
        id: '3',
        name: 'App.tsx',
        type: 'file',
        path: 'src/App.tsx',
        size: 2048,
        lastModified: new Date('2024-01-20'),
        language: 'typescript',
        content:
          'import React from "react";\nimport { Header } from "./components/Header";\n\nfunction App() {\n  return (\n    <div className="App">\n      <Header />\n    </div>\n  );\n}\n\nexport default App;',
      },
      {
        id: '4',
        name: 'index.tsx',
        type: 'file',
        path: 'src/index.tsx',
        size: 512,
        lastModified: new Date('2024-01-18'),
        language: 'typescript',
        content:
          'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nconst root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);\nroot.render(<App />);',
      },
    ],
  },
  {
    id: '7',
    name: 'package.json',
    type: 'file',
    path: 'package.json',
    size: 1536,
    lastModified: new Date('2024-01-16'),
    language: 'json',
    content:
      '{\n  "name": "my-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}',
  },
  {
    id: '8',
    name: 'README.md',
    type: 'file',
    path: 'README.md',
    size: 2560,
    lastModified: new Date('2024-01-14'),
    language: 'markdown',
    content:
      '# My App\n\nThis is a sample React application.\n\n## Getting Started\n\n```bash\nnpm start\n```',
  },
];

const generateId = () => `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;


const restoreDatesInFiles = (files: FileNode[]): FileNode[] => {
  return files.map(file => {
    const result: FileNode = {
      ...file,
      lastModified: file.lastModified ? new Date(file.lastModified) : new Date(),
    };
    if (file.children) {
      result.children = restoreDatesInFiles(file.children);
    }
    return result;
  });
};

const findFileInTree = (
  files: FileNode[],
  predicate: (file: FileNode) => boolean
): FileNode | null => {
  for (const file of files) {
    if (predicate(file)) {
      return file;
    }
    if (file.children) {
      const found = findFileInTree(file.children, predicate);
      if (found) return found;
    }
  }
  return null;
};

const updateFileInTree = (
  files: FileNode[],
  fileId: string,
  updates: Partial<FileNode>
): FileNode[] => {
  return files.map(file => {
    if (file.id === fileId) {
      return { ...file, ...updates, lastModified: new Date() };
    }
    if (file.children) {
      return {
        ...file,
        children: updateFileInTree(file.children, fileId, updates),
      };
    }
    return file;
  });
};

const removeFileFromTree = (files: FileNode[], fileId: string): FileNode[] => {
  return files.filter(file => {
    if (file.id === fileId) {
      return false;
    }
    if (file.children) {
      file.children = removeFileFromTree(file.children, fileId);
    }
    return true;
  });
};

const addFileToTree = (files: FileNode[], newFile: FileNode, parentPath?: string): FileNode[] => {
  if (!parentPath || parentPath === '/') {
    return [...files, newFile];
  }

  const result = files.map(file => {
    if (file.path === parentPath && file.type === 'folder') {
      return {
        ...file,
        children: [...(file.children || []), newFile],
        lastModified: new Date(),
      };
    }
    if (file.children) {
      return {
        ...file,
        children: addFileToTree(file.children, newFile, parentPath),
      };
    }
    return file;
  });

  return result;
};

const sortFiles = (files: FileNode[], sortBy: string, sortOrder: string): FileNode[] => {
  const sorted = [...files].sort((a, b) => {

    if (a.type === 'folder' && b.type === 'file') return -1;
    if (a.type === 'file' && b.type === 'folder') return 1;

    let aValue: string | number, bValue: string | number;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'modified':
        aValue = a.lastModified.getTime();
        bValue = b.lastModified.getTime();
        break;
      case 'size':
        aValue = a.size || 0;
        bValue = b.size || 0;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted.map(file => ({
    ...file,
    children: file.children ? sortFiles(file.children, sortBy, sortOrder) : undefined,
  }));
};

const filterFiles = (files: FileNode[], query: string): FileNode[] => {
  if (!query.trim()) return files;

  const lowercaseQuery = query.toLowerCase();

  return files
    .filter(file => {
      const matchesName = file.name.toLowerCase().includes(lowercaseQuery);
      const hasMatchingChildren = file.children && filterFiles(file.children, query).length > 0;

      return matchesName || hasMatchingChildren;
    })
    .map(file => ({
      ...file,
      children: file.children ? filterFiles(file.children, query) : file.children,
    }));
};

export const useFileExplorerStore = create<FileExplorerStore>()(
  persist(
    immer((set, get) => ({
      files: sampleFiles,
      selectedFiles: [],
      expandedFolders: ['1'],
      draggedNode: null,
      searchQuery: '',
      sortBy: 'name',
      sortOrder: 'asc',

      setFiles: files =>
        set(state => {
          state.files = files;
        }),

      addFile: (file, parentPath) =>
        set(state => {
          const newFile = {
            ...file,
            id: file.id || generateId(),
            lastModified: new Date(),
          };
          state.files = addFileToTree(state.files, newFile, parentPath);
        }),

      updateFile: (fileId, updates) =>
        set(state => {
          state.files = updateFileInTree(state.files, fileId, updates);
        }),

      deleteFile: fileId =>
        set(state => {
          state.files = removeFileFromTree(state.files, fileId);
          state.selectedFiles = state.selectedFiles.filter(id => id !== fileId);
        }),

      renameFile: (fileId, newName) =>
        set(state => {
          const file = findFileInTree(state.files, f => f.id === fileId);
          if (file) {
            const newPath = file.path.replace(/[^/]+$/, newName);
            state.files = updateFileInTree(state.files, fileId, {
              name: newName,
              path: newPath,
            });
          }
        }),

      moveFile: (fileId, newParentPath) =>
        set(state => {
          const file = findFileInTree(state.files, f => f.id === fileId);

          if (file) {

            state.files = removeFileFromTree(state.files, fileId);


            const newPath =
              newParentPath === '/' ? `/${file.name}` : `${newParentPath}/${file.name}`;
            const updatedFile = { ...file, path: newPath };

            state.files = addFileToTree(state.files, updatedFile, newParentPath);
          }
        }),

      clearFiles: () =>
        set(state => {
          state.files = [];
          state.selectedFiles = [];
          state.expandedFolders = [];
          state.searchQuery = '';
        }),

      selectFile: (fileId, multiSelect = false) =>
        set(state => {
          if (multiSelect) {
            if (state.selectedFiles.includes(fileId)) {
              state.selectedFiles = state.selectedFiles.filter(id => id !== fileId);
            } else {
              state.selectedFiles.push(fileId);
            }
          } else {
            state.selectedFiles = [fileId];
          }
        }),

      selectFiles: fileIds =>
        set(state => {
          state.selectedFiles = fileIds;
        }),

      clearSelection: () =>
        set(state => {
          state.selectedFiles = [];
        }),

      expandFolder: folderId =>
        set(state => {
          if (!state.expandedFolders.includes(folderId)) {
            state.expandedFolders.push(folderId);
          }
        }),

      collapseFolder: folderId =>
        set(state => {
          state.expandedFolders = state.expandedFolders.filter(id => id !== folderId);
        }),

      toggleFolder: folderId =>
        set(state => {
          if (state.expandedFolders.includes(folderId)) {
            state.expandedFolders = state.expandedFolders.filter(id => id !== folderId);
          } else {
            state.expandedFolders.push(folderId);
          }
        }),

      createFolder: (parentPath, name) =>
        set(state => {
          const newFolder: FileNode = {
            id: generateId(),
            name,
            type: 'folder',
            path: `${parentPath}/${name}`,
            lastModified: new Date(),
            children: [],
            isExpanded: false,
          };

          state.files = addFileToTree(state.files, newFolder, parentPath);
          state.expandedFolders.push(newFolder.id);
        }),

      setDraggedNode: node =>
        set(state => {
          state.draggedNode = node;
        }),

      handleDrop: targetPath =>
        set(state => {
          if (state.draggedNode && state.draggedNode.path !== targetPath) {
            const draggedFile = state.draggedNode;


            state.files = removeFileFromTree(state.files, draggedFile.id);


            const newPath = `${targetPath}/${draggedFile.name}`;
            const updatedFile = { ...draggedFile, path: newPath };
            state.files = addFileToTree(state.files, updatedFile, targetPath);

            state.draggedNode = null;
          }
        }),

      setSearchQuery: query =>
        set(state => {
          state.searchQuery = query;
        }),

      setSortBy: sortBy =>
        set(state => {
          state.sortBy = sortBy;
        }),

      setSortOrder: order =>
        set(state => {
          state.sortOrder = order;
        }),

      getFileById: fileId => {
        const state = get();
        return findFileInTree(state.files, f => f.id === fileId);
      },

      getFileByPath: path => {
        const state = get();
        return findFileInTree(state.files, f => f.path === path);
      },

      getParentFolder: filePath => {
        const state = get();
        const parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
        return findFileInTree(state.files, f => f.path === parentPath && f.type === 'folder');
      },

      getFilteredFiles: () => {
        const state = get();
        const filtered = state.searchQuery
          ? filterFiles(state.files, state.searchQuery)
          : state.files;

        return sortFiles(filtered, state.sortBy, state.sortOrder);
      },
    })),
    {
      name: 'enhanced-ide-file-explorer-state',
      partialize: state => ({
        files: state.files,
        expandedFolders: state.expandedFolders,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
      storage: {
        getItem: name => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          const data = JSON.parse(str);


          if (data.state?.files) {
            data.state.files = data.state.files.map((file: FileNode) => ({
              ...file,
              lastModified: file.lastModified ? new Date(file.lastModified) : undefined,
              children: file.children ? restoreDatesInFiles(file.children) : file.children,
            }));
          }

          return data;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: name => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);


export const useSelectedFiles = () => {
  const selectedFiles = useFileExplorerStore(s => s.selectedFiles);
  const getFileById = useFileExplorerStore(s => s.getFileById);

  return selectedFiles.map(id => getFileById(id)).filter(Boolean) as FileNode[];
};

export const useFileOperations = () => {
  const addFile = useFileExplorerStore(s => s.addFile);
  const updateFile = useFileExplorerStore(s => s.updateFile);
  const deleteFile = useFileExplorerStore(s => s.deleteFile);
  const renameFile = useFileExplorerStore(s => s.renameFile);
  const moveFile = useFileExplorerStore(s => s.moveFile);
  const createFolder = useFileExplorerStore(s => s.createFolder);
  const clearFiles = useFileExplorerStore(s => s.clearFiles);
  return { addFile, updateFile, deleteFile, renameFile, moveFile, createFolder, clearFiles };
};

export const useDragAndDrop = () => {
  const draggedNode = useFileExplorerStore(s => s.draggedNode);
  const setDraggedNode = useFileExplorerStore(s => s.setDraggedNode);
  const handleDrop = useFileExplorerStore(s => s.handleDrop);

  return {
    draggedNode,
    setDraggedNode,
    handleDrop,
    isDragging: draggedNode !== null,
  };
};
