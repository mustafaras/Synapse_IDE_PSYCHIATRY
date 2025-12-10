export type AssistantSettings = {
  settings: {
    provider: string;
    model: string;
    temperature?: number;
    top_p?: number;
    ollamaBaseUrl?: string | null;
  };
  ui?: {
    codeWrap?: boolean;
    compact?: boolean;
    safeModeConfirmEdits?: boolean;
    embedProvider?: string;
    embedModelName?: string;
    embedDim?: number | null;
    telemetry?: boolean;
    budgetAlloc?: any;
  } & Record<string, unknown>;
  keys?: Record<string, string> | null;
};
