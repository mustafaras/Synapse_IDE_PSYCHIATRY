export interface SafetyPolicy {
  pii: {
    detectEmails: boolean;
    detectPhones: boolean;
    detectIpv4: boolean;
    detectIpv6: boolean;
  };
  secrets: {
    envKeys: string[];
    regexes: RegExp[];
    maxTokenLikeLen: number;
  };
  codeRisk: {
    blocklistDomains: string[];
    riskyApis: string[];
  };
  prompts: {
    injectionPhrases: string[];
  };
}

export const DEFAULT_POLICY: SafetyPolicy = {
  pii: { detectEmails: true, detectPhones: true, detectIpv4: true, detectIpv6: false },
  secrets: {
    envKeys: ['API_KEY','OPENAI_API_KEY','ANTHROPIC_API_KEY','GEMINI_API_KEY','AWS_SECRET_ACCESS_KEY','AWS_ACCESS_KEY_ID','GH_TOKEN','NPM_TOKEN'],
    regexes: [
      /-----BEGIN (?:RSA|EC|OPENSSH) PRIVATE KEY-----[\s\S]+?-----END [\s\S]+?-----/g,
      /\b[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,}\.[A-Za-z0-9-_]{20,}\b/g,
      /\bghp_[A-Za-z0-9]{36}\b/g,
      /\bAKIA[0-9A-Z]{16}\b/g,
    ],
    maxTokenLikeLen: 64,
  },
  codeRisk: {
    blocklistDomains: ['pastebin.com','paste.ee','privnote.com','transfer.sh','ipfs.io'],
    riskyApis: ['eval(','new Function(','child_process','os.system','ProcessBuilder','subprocess.Popen','exec('],
  },
  prompts: {
    injectionPhrases: [
      'ignore previous instructions',
      'disregard prior',
      'rule: you must',
      'you are now the user',
      'system override',
    ],
  },
};
