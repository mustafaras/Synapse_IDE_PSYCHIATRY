

export const APP_CONFIG = {
  name: 'CODER APP',
  version: '1.0.0',
  description: 'A modern, professional code editor with glassmorphism design',
  author: 'Coder Team',


  api: {
    baseUrl: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
    retryAttempts: 3,
  },


  features: {
    collaboration: true,
    aiAssistance: true,
    gitIntegration: true,
    extensionSystem: true,
    cloudSync: false,
  },


  limits: {
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 1000,
    maxProjects: 50,
    maxRecentProjects: 10,
  },


  autoSave: {
    enabled: true,
    delay: 2000,
  },


  editor: {
    defaultLanguage: 'javascript',
    defaultTheme: 'auto',
    defaultFontSize: 14,
    defaultTabSize: 2,
    defaultWordWrap: false,
    defaultMinimap: true,
  },
} as const;


export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', extensions: ['.js', '.jsx'], icon: 'file-code' },
  { id: 'typescript', name: 'TypeScript', extensions: ['.ts', '.tsx'], icon: 'file-code' },
  { id: 'python', name: 'Python', extensions: ['.py', '.pyw'], icon: 'file-code' },
  { id: 'java', name: 'Java', extensions: ['.java'], icon: 'file-code' },
  { id: 'csharp', name: 'C#', extensions: ['.cs'], icon: 'file-code' },
  { id: 'cpp', name: 'C++', extensions: ['.cpp', '.cxx', '.cc'], icon: 'file-code' },
  { id: 'c', name: 'C', extensions: ['.c'], icon: 'file-code' },
  { id: 'go', name: 'Go', extensions: ['.go'], icon: 'file-code' },
  { id: 'rust', name: 'Rust', extensions: ['.rs'], icon: 'file-code' },
  { id: 'php', name: 'PHP', extensions: ['.php'], icon: 'file-code' },
  { id: 'ruby', name: 'Ruby', extensions: ['.rb'], icon: 'file-code' },
  { id: 'swift', name: 'Swift', extensions: ['.swift'], icon: 'file-code' },
  { id: 'kotlin', name: 'Kotlin', extensions: ['.kt', '.kts'], icon: 'file-code' },
  { id: 'html', name: 'HTML', extensions: ['.html', '.htm'], icon: 'file-text' },
  { id: 'css', name: 'CSS', extensions: ['.css'], icon: 'palette' },
  { id: 'scss', name: 'SCSS', extensions: ['.scss'], icon: 'palette' },
  { id: 'json', name: 'JSON', extensions: ['.json'], icon: 'file-text' },
  { id: 'xml', name: 'XML', extensions: ['.xml'], icon: 'file-text' },
  { id: 'yaml', name: 'YAML', extensions: ['.yml', '.yaml'], icon: 'file-text' },
  { id: 'markdown', name: 'Markdown', extensions: ['.md', '.markdown'], icon: 'file-text' },
  { id: 'sql', name: 'SQL', extensions: ['.sql'], icon: 'database' },
  { id: 'bash', name: 'Bash', extensions: ['.sh', '.bash'], icon: 'terminal' },
  { id: 'powershell', name: 'PowerShell', extensions: ['.ps1'], icon: 'terminal' },
] as const;


export const FILE_TYPES = {
  folder: { icon: 'folder', color: '#00A6D7' },
  javascript: { icon: 'file-code', color: '#F7DF1E' },
  typescript: { icon: 'file-code', color: '#3178C6' },
  python: { icon: 'file-code', color: '#3776AB' },
  java: { icon: 'file-code', color: '#ED8B00' },
  csharp: { icon: 'file-code', color: '#239120' },
  cpp: { icon: 'file-code', color: '#00599C' },
  html: { icon: 'file-text', color: '#E34F26' },
  css: { icon: 'palette', color: '#1572B6' },
  json: { icon: 'file-text', color: '#000000' },
  markdown: { icon: 'file-text', color: '#000000' },
  image: { icon: 'file-image', color: '#FF6B6B' },
  video: { icon: 'file-video', color: '#FF6B6B' },
  audio: { icon: 'file-audio', color: '#FF6B6B' },
  archive: { icon: 'file-archive', color: '#8E44AD' },
  text: { icon: 'file-text', color: '#34495E' },
  unknown: { icon: 'file', color: '#95A5A6' },
} as const;


export const KEYBOARD_SHORTCUTS = {

  newFile: 'Ctrl+N',
  openFile: 'Ctrl+O',
  saveFile: 'Ctrl+S',
  saveAs: 'Ctrl+Shift+S',
  closeFile: 'Ctrl+W',
  closeAll: 'Ctrl+Shift+W',


  undo: 'Ctrl+Z',
  redo: 'Ctrl+Y',
  copy: 'Ctrl+C',
  cut: 'Ctrl+X',
  paste: 'Ctrl+V',
  selectAll: 'Ctrl+A',
  find: 'Ctrl+F',
  replace: 'Ctrl+H',
  goToLine: 'Ctrl+G',


  commandPalette: 'Ctrl+Shift+P',
  quickOpen: 'Ctrl+P',
  toggleSidebar: 'Ctrl+B',
  toggleTerminal: 'Ctrl+`',


  zoomIn: 'Ctrl+=',
  zoomOut: 'Ctrl+-',
  resetZoom: 'Ctrl+0',
  toggleFullscreen: 'F11',


  nextTab: 'Ctrl+Tab',
  prevTab: 'Ctrl+Shift+Tab',
  closeTab: 'Ctrl+W',


  formatDocument: 'Shift+Alt+F',
  commentLine: 'Ctrl+/',
  duplicateLine: 'Shift+Alt+Down',
  moveLiveUp: 'Alt+Up',
  moveLiveDown: 'Alt+Down',
} as const;


export const PROJECT_TEMPLATES = [
  {
    id: 'react-typescript',
    name: 'React with TypeScript',
    description: 'Modern React application with TypeScript and Vite',
    icon: 'react',
    files: [
      {
        path: 'src/App.tsx',
        content:
          'import React from "react";\n\nfunction App() {\n  return <div>Hello React!</div>;\n}\n\nexport default App;',
      },
      {
        path: 'src/main.tsx',
        content:
          'import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\n\nReactDOM.createRoot(document.getElementById("root")!).render(<App />);',
      },
      {
        path: 'package.json',
        content:
          '{\n  "name": "react-app",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}',
      },
    ],
  },
  {
    id: 'vanilla-javascript',
    name: 'Vanilla JavaScript',
    description: 'Simple HTML, CSS, and JavaScript project',
    icon: 'file-code',
    files: [
      {
        path: 'index.html',
        content:
          '<!DOCTYPE html>\n<html>\n<head>\n  <title>My App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>',
      },
      {
        path: 'style.css',
        content: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}',
      },
      { path: 'script.js', content: 'console.log("Hello World!");' },
    ],
  },
  {
    id: 'python-project',
    name: 'Python Project',
    description: 'Python project with main file and requirements',
    icon: 'file-code',
    files: [
      {
        path: 'main.py',
        content:
          'def main():\n    print("Hello Python!")\n\nif __name__ == "__main__":\n    main()',
      },
      { path: 'requirements.txt', content: '# Add your dependencies here\n' },
      { path: 'README.md', content: '# Python Project\n\nDescription of your project.\n' },
    ],
  },
  {
    id: 'node-api',
    name: 'Node.js API',
    description: 'Express.js API with TypeScript',
    icon: '🟢',
    files: [
      {
        path: 'src/app.ts',
        content:
          'import express from "express";\n\nconst app = express();\nconst port = 3000;\n\napp.get("/", (req, res) => {\n  res.json({ message: "Hello API!" });\n});\n\napp.listen(port, () => {\n  console.log(`Server running on port ${port}`);\n});',
      },
      {
        path: 'package.json',
        content:
          '{\n  "name": "node-api",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "ts-node src/app.ts",\n    "build": "tsc"\n  }\n}',
      },
    ],
  },
] as const;


export const ERROR_MESSAGES = {
  fileNotFound: 'File not found',
  fileTooLarge: 'File is too large',
  invalidFileType: 'Invalid file type',
  saveError: 'Failed to save file',
  loadError: 'Failed to load file',
  networkError: 'Network error occurred',
  unknownError: 'An unknown error occurred',
  permissionDenied: 'Permission denied',
} as const;


export const SUCCESS_MESSAGES = {
  fileSaved: 'File saved successfully',
  fileCreated: 'File created successfully',
  fileDeleted: 'File deleted successfully',
  projectCreated: 'Project created successfully',
  settingsSaved: 'Settings saved successfully',
} as const;
