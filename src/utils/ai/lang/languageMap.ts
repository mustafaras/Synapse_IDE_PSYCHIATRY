

export type LangKey =
  | 'typescript' | 'typescriptreact' | 'javascript' | 'javascriptreact'
  | 'python' | 'html' | 'css' | 'json' | 'markdown'
  | 'java' | 'cpp' | 'csharp' | 'rust' | 'go' | 'php'
  | 'swift' | 'kotlin' | 'ruby' | 'sql' | 'bash' | 'powershell'
  | 'yaml' | 'toml' | 'vue' | 'svelte';

export interface LangSpec {
  label: string;
  monaco: string;
  ext: string;
  fence: string;
  defaultFile: string;
}

export const LANGUAGE_MAP: Record<LangKey, LangSpec> = {
  typescript:       { label: 'TypeScript', monaco: 'typescript', ext: '.ts',  fence: 'ts',   defaultFile: 'main' },
  typescriptreact:  { label: 'TSX',        monaco: 'typescript', ext: '.tsx', fence: 'tsx',  defaultFile: 'App' },
  javascript:       { label: 'JavaScript', monaco: 'javascript', ext: '.js',  fence: 'js',   defaultFile: 'main' },
  javascriptreact:  { label: 'JSX',        monaco: 'javascript', ext: '.jsx', fence: 'jsx',  defaultFile: 'App' },
  python:           { label: 'Python',     monaco: 'python',     ext: '.py',  fence: 'python', defaultFile: 'main' },
  html:             { label: 'HTML',       monaco: 'html',       ext: '.html',fence: 'html', defaultFile: 'index' },
  css:              { label: 'CSS',        monaco: 'css',        ext: '.css', fence: 'css',  defaultFile: 'styles' },
  json:             { label: 'JSON',       monaco: 'json',       ext: '.json',fence: 'json', defaultFile: 'config' },
  markdown:         { label: 'Markdown',   monaco: 'markdown',   ext: '.md',  fence: 'md',   defaultFile: 'README' },
  java:             { label: 'Java',       monaco: 'java',       ext: '.java',fence: 'java', defaultFile: 'Main' },
  cpp:              { label: 'C++',        monaco: 'cpp',        ext: '.cpp', fence: 'cpp',  defaultFile: 'main' },
  csharp:           { label: 'C#',         monaco: 'csharp',     ext: '.cs',  fence: 'csharp', defaultFile: 'Program' },
  rust:             { label: 'Rust',       monaco: 'rust',       ext: '.rs',  fence: 'rust', defaultFile: 'main' },
  go:               { label: 'Go',         monaco: 'go',         ext: '.go',  fence: 'go',   defaultFile: 'main' },
  php:              { label: 'PHP',        monaco: 'php',        ext: '.php', fence: 'php',  defaultFile: 'index' },
  swift:            { label: 'Swift',      monaco: 'swift',      ext: '.swift', fence: 'swift', defaultFile: 'Main' },
  kotlin:           { label: 'Kotlin',     monaco: 'kotlin',     ext: '.kt',  fence: 'kotlin', defaultFile: 'Main' },
  ruby:             { label: 'Ruby',       monaco: 'ruby',       ext: '.rb',  fence: 'ruby', defaultFile: 'main' },
  sql:              { label: 'SQL',        monaco: 'sql',        ext: '.sql', fence: 'sql',  defaultFile: 'query' },
  bash:             { label: 'Bash',       monaco: 'shell',      ext: '.sh',  fence: 'bash', defaultFile: 'script' },
  powershell:       { label: 'PowerShell', monaco: 'powershell', ext: '.ps1', fence: 'powershell', defaultFile: 'script' },
  yaml:             { label: 'YAML',       monaco: 'yaml',       ext: '.yaml',fence: 'yaml', defaultFile: 'config' },
  toml:             { label: 'TOML',       monaco: 'toml',       ext: '.toml',fence: 'toml', defaultFile: 'config' },
  vue:              { label: 'Vue',        monaco: 'vue',        ext: '.vue', fence: 'vue',  defaultFile: 'App' },
  svelte:           { label: 'Svelte',     monaco: 'svelte',     ext: '.svelte', fence: 'svelte', defaultFile: 'App' },
};


const ALIASES: Record<string, LangKey> = {
  ts: 'typescript',
  tsx: 'typescriptreact',
  js: 'javascript',
  jsx: 'javascriptreact',
  md: 'markdown',
  sh: 'bash',
  shell: 'bash',
  ps: 'powershell',
  ps1: 'powershell',
};

export function getLangSpec(languageId: string): LangSpec | null {
  const key = (languageId || '').toLowerCase();
  if ((Object.keys(LANGUAGE_MAP) as LangKey[]).includes(key as LangKey)) {
    return LANGUAGE_MAP[key as LangKey];
  }
  const alias = ALIASES[key];
  if (alias) return LANGUAGE_MAP[alias];
  return null;
}

export function isSupportedLanguage(languageId: string): boolean {
  return !!getLangSpec(languageId);
}


export function monacoToLangKey(monacoId: string | undefined): LangKey | null {
  if (!monacoId) return null;
  const low = monacoId.toLowerCase();

  const entry = (Object.keys(LANGUAGE_MAP) as LangKey[]).find(k => LANGUAGE_MAP[k].monaco === low);
  if (entry) return entry;
  return (Object.prototype.hasOwnProperty.call(ALIASES, low) ? ALIASES[low] : null);
}
