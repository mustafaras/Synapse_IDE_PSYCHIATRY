import { useFileExplorerStore } from '../stores/fileExplorerStore';
import type { FileNode } from '../types/state';


export const createSampleProject = () => {
  const sampleFiles: FileNode[] = [
    {
      id: 'folder-src',
      name: 'src',
      type: 'folder',
      path: '/src',
      lastModified: new Date(),
      isExpanded: true,
      children: [
        {
          id: 'file-app-tsx',
          name: 'App.tsx',
          type: 'file',
          path: '/src/App.tsx',
          content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Synapse IDE</h1>
        <p>Professional development environment</p>
      </header>
    </div>
  );
}

export default App;`,
          language: 'typescript',
          lastModified: new Date(),
          size: 345,
        },
        {
          id: 'file-main-tsx',
          name: 'main.tsx',
          type: 'file',
          path: '/src/main.tsx',
          content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`,
          language: 'typescript',
          lastModified: new Date(),
          size: 234,
        },
        {
          id: 'folder-components',
          name: 'components',
          type: 'folder',
          path: '/src/components',
          lastModified: new Date(),
          isExpanded: false,
          children: [
            {
              id: 'file-button-tsx',
              name: 'Button.tsx',
              type: 'file',
              path: '/src/components/Button.tsx',
              content: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};`,
              language: 'typescript',
              lastModified: new Date(),
              size: 412,
            },
          ],
        },
        {
          id: 'folder-styles',
          name: 'styles',
          type: 'folder',
          path: '/src/styles',
          lastModified: new Date(),
          isExpanded: false,
          children: [
            {
              id: 'file-index-css',
              name: 'index.css',
              type: 'file',
              path: '/src/styles/index.css',
              content: `
:root {
  --primary-color: #00A6D7;
  --background-dark: #1a1a1a;
  --text-primary: #ffffff;
}

body {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  background: var(--background-dark);
  color: var(--text-primary);
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: #000;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}`,
              language: 'css',
              lastModified: new Date(),
              size: 567,
            },
          ],
        },
      ],
    },
    {
      id: 'file-package-json',
      name: 'package.json',
      type: 'file',
      path: '/package.json',
      content: `{
  "name": "synapse-ide",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}`,
      language: 'json',
      lastModified: new Date(),
      size: 434,
    },
    {
      id: 'file-README',
      name: 'README.md',
      type: 'file',
      path: '/README.md',
      content: `# Synapse IDE

A professional development environment built with React and TypeScript.

## Features

- 🔥 Modern file explorer
- ⚡ Fast code editing
- 🎨 Beautiful UI with golden theme
- 🧠 AI-powered assistance

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Tech Stack

- React 18
- TypeScript
- Vite
- Zustand for state management
- Monaco Editor
- Lucide React icons

Built with ❤️ for developers.`,
      language: 'markdown',
      lastModified: new Date(),
      size: 456,
    },
  ];


  useFileExplorerStore.getState().setFiles(sampleFiles);
};


export const initializeSampleData = () => {
  if (typeof window === 'undefined') {
  }
  const w = window as unknown as { __SAMPLE_DATA_INIT?: boolean };

  let persisted = false;
  try {
    persisted = !!window.localStorage.getItem('__sample_data_initialized');
  } catch {}
  if (w.__SAMPLE_DATA_INIT || persisted) {
    return;
  }
  w.__SAMPLE_DATA_INIT = true;
  try { window.localStorage.setItem('__sample_data_initialized', '1'); } catch {}
  setTimeout(() => {
    createSampleProject();
  }, 50);
};


interface SampleDataWindow extends Window { __SAMPLE_DATA_INIT?: boolean; resetSampleData?: () => void }
declare const window: SampleDataWindow;

let isDevEnv = false;
try { isDevEnv = typeof import.meta !== 'undefined' && !!(import.meta as unknown as { env?: Record<string, unknown> }).env?.DEV; } catch {}
if (typeof window !== 'undefined' && isDevEnv) {
  window.resetSampleData = () => {
    try { window.localStorage.removeItem('__sample_data_initialized'); } catch {}
    delete window.__SAMPLE_DATA_INIT;
  };
}
