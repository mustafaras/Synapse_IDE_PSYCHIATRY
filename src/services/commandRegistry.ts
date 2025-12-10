export type Command = {
  id: string;
  label: string;
  shortcut?: string;
  category?: string;
  run: () => void;
};

let registry: Command[] = [];

export function registerCommands(cmds: Command[]) {

  cmds.forEach(c => {
    const i = registry.findIndex(x => x.id === c.id);
    if (i >= 0) registry[i] = c;
    else registry.push(c);
  });
}

export function unregisterCommands(ids: string[]) {
  registry = registry.filter(c => !ids.includes(c.id));
}

export function listCommands(): Command[] {
  return registry.slice();
}


export function fuzzyFilter(query: string, items: Command[]): Command[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const scored = items
    .map(item => {
      const s = item.label.toLowerCase();
      let score = -Infinity;
      if (s.startsWith(q)) score = 100 - s.indexOf(q);
      else if (s.includes(q)) score = 60 - s.indexOf(q);
      else {

        let qi = 0,
          si = 0,
          gaps = 0;
        while (qi < q.length && si < s.length) {
          if (q[qi] === s[si]) qi++;
          else gaps++;
          si++;
        }
        score = qi === q.length ? 40 - gaps : -Infinity;
      }
      return { item, score };
    })
    .filter(x => x.score > -Infinity)
    .sort((a, b) => b.score - a.score);
  return scored.map(x => x.item);
}
