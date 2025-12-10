const BLOCKED = [/\.env/i, /id_rsa/i, /\.pem$/i, /\.p12$/i, /\.key$/i, /secrets?\./i];
const WHITELIST = [/^src\//i, /^apps\//i, /^packages\//i, /^tests?\//i];

export function isBlockedPath(p: string) { return BLOCKED.some(rx => rx.test(p)); }
export function isWhitelistedPath(p: string) { return WHITELIST.some(rx => rx.test(p)); }
