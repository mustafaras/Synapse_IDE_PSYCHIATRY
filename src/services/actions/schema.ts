export type Path = string;

export type Action =
  | { kind: 'create'; path: Path; language?: string; text: string }
  | { kind: 'replace'; path: Path; text: string }
  | { kind: 'modify'; path: Path; edits: { range: [number, number, number, number]; text: string }[] }
  | { kind: 'rename'; from: Path; to: Path }
  | { kind: 'delete'; path: Path }
  | { kind: 'format'; path: Path; language?: string };

export type ActionPlan = {
  id: string;
  title: string;
  createdAt: number;
  actions: Action[];
  note?: string;
};
