



export type LangMap = { monaco: string; ext: string };

const TABLE: Record<string, LangMap> = {

  ts: { monaco: 'typescript', ext: 'ts' },
  tsx: { monaco: 'typescript', ext: 'tsx' },
  typescript: { monaco: 'typescript', ext: 'ts' },
  js: { monaco: 'javascript', ext: 'js' },
  jsx: { monaco: 'javascript', ext: 'jsx' },
  javascript: { monaco: 'javascript', ext: 'js' },
  json: { monaco: 'json', ext: 'json' },

  html: { monaco: 'html', ext: 'html' },
  css: { monaco: 'css', ext: 'css' },
  scss: { monaco: 'scss', ext: 'scss' },
  sass: { monaco: 'scss', ext: 'scss' },

  sh: { monaco: 'shell', ext: 'sh' },
  bash: { monaco: 'shell', ext: 'sh' },
  zsh: { monaco: 'shell', ext: 'sh' },
  ps1: { monaco: 'powershell', ext: 'ps1' },
  powershell: { monaco: 'powershell', ext: 'ps1' },

  py: { monaco: 'python', ext: 'py' },
  python: { monaco: 'python', ext: 'py' },
  java: { monaco: 'java', ext: 'java' },
  c: { monaco: 'c', ext: 'c' },
  cpp: { monaco: 'cpp', ext: 'cpp' },
  cc: { monaco: 'cpp', ext: 'cpp' },
  h: { monaco: 'c', ext: 'h' },
  hpp: { monaco: 'cpp', ext: 'hpp' },
  go: { monaco: 'go', ext: 'go' },
  rs: { monaco: 'rust', ext: 'rs' },
  rust: { monaco: 'rust', ext: 'rs' },
  php: { monaco: 'php', ext: 'php' },
  rb: { monaco: 'ruby', ext: 'rb' },
  ruby: { monaco: 'ruby', ext: 'rb' },
  kt: { monaco: 'kotlin', ext: 'kt' },
  kotlin: { monaco: 'kotlin', ext: 'kt' },
  scala: { monaco: 'scala', ext: 'scala' },
  r: { monaco: 'r', ext: 'r' },
  lua: { monaco: 'lua', ext: 'lua' },
  dart: { monaco: 'dart', ext: 'dart' },
  sql: { monaco: 'sql', ext: 'sql' },
  yaml: { monaco: 'yaml', ext: 'yaml' },
  yml: { monaco: 'yaml', ext: 'yml' },
  md: { monaco: 'markdown', ext: 'md' },
  markdown: { monaco: 'markdown', ext: 'md' },
  txt: { monaco: 'plaintext', ext: 'txt' },
};

export function mapFenceToLangAndExt(info?: string): LangMap {
  const raw = (info || '').trim().toLowerCase();
  if (!raw) return { monaco: 'plaintext', ext: 'txt' };
  const hit = TABLE[raw];
  if (hit) return hit;

  const cleaned = raw.replace(/\{.*\}$/g, '').replace(/^lang[:=]/, '');
  if (TABLE[cleaned]) return TABLE[cleaned];
  return { monaco: 'plaintext', ext: 'txt' };
}

export default mapFenceToLangAndExt;
