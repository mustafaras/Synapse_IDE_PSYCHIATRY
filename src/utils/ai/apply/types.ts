



export type ApplyAction = 'create' | 'replace' | 'insert';

export interface ApplyItem {

  path: string;

  action: ApplyAction;

  code: string;

  monaco: string;

  ext: string;

  exists: boolean;
}

export interface ApplyPlan {
  mode: 'beginner' | 'pro';
  items: ApplyItem[];

  warnings: string[];
}
