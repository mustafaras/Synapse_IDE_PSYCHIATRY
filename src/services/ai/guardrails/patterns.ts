export const RX = {
  secrets: [
    /-----BEGIN (RSA|EC|PRIVATE) KEY-----/i,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bprojects\/\w+\/secrets\/\w+/i,
    /\bghp_[0-9A-Za-z]{36}\b/,
    /\b(xox[baprs]-[0-9A-Za-z-]{10,})\b/,
  ],
  pii: [
    /\b\d{11}\b/,
    /\b\d{3}-\d{2}-\d{4}\b/,
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  ],
  riskCmd: [
    /\brm\s+-rf\s+\/(?!\S)/,
    /\bchmod\s+777\b/,
    /\bnpm\s+publish\b/i,
    /\bgit\s+push\b/i,
  ],
  exfilUrl: [
    /https?:\/\/(pastebin|hastebin|transfer\.sh|file\.io)\//i,
  ],
};
