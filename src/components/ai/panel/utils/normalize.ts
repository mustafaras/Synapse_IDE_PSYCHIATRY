export function buildNormalizedPrompt({ userText, systemPrompt }: { userText: string; systemPrompt?: string }) {
  return { prompt: userText.trim(), systemPrompt: systemPrompt?.trim() || undefined };
}
