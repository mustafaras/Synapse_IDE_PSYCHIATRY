export const TOOL_POLICY = {
  allowPresets: ['node:test','node:lint','node:build','py:test','py:lint','rust:test','go:test'],
  maxCmdTimeoutMs: 10*60*1000,
  maxActionsPerPlan: 12,
  blockedPaths: [/\.env/i, /id_rsa/i, /\.pem$/i, /secrets?\./i],
  whitelistRoots: [/^src\//i, /^apps\//i, /^packages\//i, /^tests?\//i]
};
