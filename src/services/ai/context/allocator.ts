import { estimateTokensApprox } from '@/utils/ai/tokenize';

export type Chunk = { id: string; label: string; text: string; type: 'selection'|'file'|'paste'; path?: string };
export type Allocation = { systemPct: number; userPct: number; contextPct: number; maxContextTokens: number };

export type Trimmed = { id: string; label: string; used: number; total: number; text: string; note?: 'head'|'focus'|'tail'|'mixed'|undefined };

export function allocateTokens(args: {
  systemText: string;
  userText: string;
  context: Chunk[];
  modelMaxTokens: number;
  expectedOutput?: number;
  allocation: Allocation;
}): {
  system: Trimmed; user: Trimmed; context: Trimmed[]; promptTotal: number; budgetOk: boolean;
} {
  const { systemText, userText, context, modelMaxTokens, expectedOutput = Math.floor(modelMaxTokens*0.4), allocation } = args;

  const inputBudget = modelMaxTokens - expectedOutput;
  const sysBudget = Math.floor(inputBudget * clamp01(allocation.systemPct));
  const usrBudget = Math.floor(inputBudget * clamp01(allocation.userPct));
  const ctxBudget = Math.min(Math.floor(inputBudget * clamp01(allocation.contextPct)), allocation.maxContextTokens);

  const sysTrim = trimToBudget('system', systemText, sysBudget);
  const usrTrim = trimToBudget('user', userText, usrBudget);
  const ctxTrims = trimContextDeterministic(context, ctxBudget);

  const promptTotal = sysTrim.used + usrTrim.used + ctxTrims.reduce((a,b)=>a+b.used,0);
  const budgetOk = promptTotal <= inputBudget;
  return { system: sysTrim, user: usrTrim, context: ctxTrims, promptTotal, budgetOk };
}

function clamp01(x:number){ return Math.max(0, Math.min(1, x)); }

function trimToBudget(label: string, text: string, budget: number): Trimmed {
  const total = estimateTokensApprox(text);
  if (total <= budget || budget <= 0) return { id: label, label, used: Math.min(total, Math.max(budget,0)), total, text, note: total<=budget?undefined:'mixed' };

  const head = takeChars(text, Math.floor(text.length*0.4));
  const tail = takeTailChars(text, Math.floor(text.length*0.4));
  const merged = `${head}\n…\n${tail}`;
  const used = Math.min(estimateTokensApprox(merged), budget);
  return { id: label, label, used, total, text: merged, note: 'mixed' };
}

function trimContextDeterministic(ctx: Chunk[], budget: number): Trimmed[] {

  const ordered = ctx.slice().sort(scoreCtx);
  const out: Trimmed[] = [];
  let remain = Math.max(budget, 0);
  for (const c of ordered) {
    if (remain <= 0) break;
    const total = estimateTokensApprox(c.text);
    const take = Math.min(remain, Math.ceil(total));
  const trimmed = total <= take ? { text: c.text, note: undefined } : sliceDeterministic(c.text);
    const used = Math.min(estimateTokensApprox(trimmed.text), remain);
    out.push({ id: c.id, label: c.label, used, total, text: trimmed.text, note: trimmed.note });
    remain -= used;
  }
  return out;
}

function scoreCtx(a: Chunk, b: Chunk) {
  const prio = (x:Chunk) => x.type==='selection'?3 : x.type==='file'?2 : x.type==='paste'?1 : 0;
  return prio(b) - prio(a);
}

function sliceDeterministic(s: string) {

  const head = takeChars(s, Math.floor(s.length*0.25));
  const tail = takeTailChars(s, Math.floor(s.length*0.25));

  const focusMatch = s.match(/(class\s+\w+|def\s+\w+\(|function\s+\w+\(|describe\(|it\()/i);
  if (focusMatch) {
    const i = Math.max(0, focusMatch.index! - 400);
    const j = Math.min(s.length, i + 800);
    const mid = s.slice(i, j);
    return { text: `${head}\n…\n${mid}\n…\n${tail}`, note: 'mixed' as const };
  }
  return { text: `${head}\n…\n${tail}`, note: 'mixed' as const };
}

function takeChars(s:string, n:number){ return s.slice(0, Math.max(0, n)); }
function takeTailChars(s:string, n:number){ return s.slice(Math.max(0, s.length - Math.max(0,n))); }
