import { z } from 'zod';

export const ZAction = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('create'), path: z.string(), language: z.string().optional(), text: z.string() }),
  z.object({ kind: z.literal('replace'), path: z.string(), text: z.string() }),
  z.object({ kind: z.literal('modify'), path: z.string(),
    edits: z.array(z.object({ range: z.tuple([z.number(), z.number(), z.number(), z.number()]), text: z.string() })) }),
  z.object({ kind: z.literal('rename'), from: z.string(), to: z.string() }),
  z.object({ kind: z.literal('delete'), path: z.string() }),
  z.object({ kind: z.literal('format'), path: z.string(), language: z.string().optional() }),
]);

export const ZActionPlan = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  createdAt: z.number().int(),
  actions: z.array(ZAction).min(1),
  note: z.string().optional(),
});

export const ZTaskPlan = z.object({
  id: z.string().uuid(),
  title: z.string(),
  createdAt: z.number().int(),
  tool: z.enum(['test','lint','format','build','run','depGraph','securityScan']),
  cwd: z.string().optional(),
  command: z.string(),
  args: z.array(z.string()),
  env: z.record(z.string()).optional(),
  timeoutMs: z.number().int().optional(),
  allowNetwork: z.boolean().optional(),
  produceArtifacts: z.array(z.object({ pattern: z.string(), label: z.string() })).optional(),
  note: z.string().optional(),
});

export const ZCitation = z.object({
  path: z.string(),
  from: z.number().int().nonnegative(),
  to: z.number().int().nonnegative(),
});
export const ZCitations = z.array(ZCitation).max(16);

export const ZSnippet = z.object({
  language: z.string(),
  filename: z.string(),
  code: z.string(),
});
export const ZSnippetList = z.object({ messageId: z.string(), items: z.array(ZSnippet) });

export type ActionPlan = z.infer<typeof ZActionPlan>;
export type TaskPlan   = z.infer<typeof ZTaskPlan>;
export type Citations  = z.infer<typeof ZCitations>;
export type SnippetList= z.infer<typeof ZSnippetList>;
