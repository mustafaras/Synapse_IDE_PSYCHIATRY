import React from "react";
import styles from "../styles/tools.module.css";

type Hunk = { kind: "eq" | "add" | "del"; a: string[]; b: string[] };

function diffLines(a: string, b: string): Hunk[] {
  const A = a.split(/\r?\n/);
  const B = b.split(/\r?\n/);
  const m = A.length, n = B.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? 1 + dp[i + 1][j + 1] : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const hunks: Hunk[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (A[i] === B[j]) {
      const aRun: string[] = [], bRun: string[] = [];
      while (i < m && j < n && A[i] === B[j]) { aRun.push(A[i]); bRun.push(B[j]); i++; j++; }
      hunks.push({ kind: "eq", a: aRun, b: bRun });
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      const del: string[] = [];
      while (i < m && (j >= n || dp[i + 1][j] >= dp[i][j + 1]) && !(A[i] === B[j])) { del.push(A[i]); i++; }
      hunks.push({ kind: "del", a: del, b: [] });
    } else {
      const add: string[] = [];
      while (j < n && (i >= m || dp[i][j + 1] > dp[i + 1][j]) && !(A[i] === B[j])) { add.push(B[j]); j++; }
      hunks.push({ kind: "add", a: [], b: add });
    }
  }
  if (i < m) hunks.push({ kind: "del", a: A.slice(i), b: [] });
  if (j < n) hunks.push({ kind: "add", a: [], b: B.slice(j) });
  return hunks;
}

export const DiffSideBySide: React.FC<{
  leftTitle: string; rightTitle: string;
  leftText: string; rightText: string;
}> = ({ leftTitle, rightTitle, leftText, rightText }) => {
  const hunks = React.useMemo(() => diffLines(leftText, rightText), [leftText, rightText]);

  return (
    <div className={styles.diffWrap} role="region" aria-label="Session comparison">
      <div className={styles.diffCols}>
        <div className={styles.diffCol} aria-label="Left session">
          <div className={styles.diffHeader}>{leftTitle}</div>
          <div className={styles.diffBody}>
            {hunks.map((h, idx) => (
              <div key={idx} className={
                h.kind === "eq" ? styles.diffEq : h.kind === "add" ? styles.diffDelGhost : styles.diffDel
              }>
                {(h.a.length ? h.a : [""]).map((ln, i) => <div key={i} className={styles.diffLine}>{ln || "\u00A0"}</div>)}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.diffCol} aria-label="Right session">
          <div className={styles.diffHeader}>{rightTitle}</div>
          <div className={styles.diffBody}>
            {hunks.map((h, idx) => (
              <div key={idx} className={
                h.kind === "eq" ? styles.diffEq : h.kind === "add" ? styles.diffAdd : styles.diffAddGhost
              }>
                {(h.b.length ? h.b : [""]).map((ln, i) => <div key={i} className={styles.diffLine}>{ln || "\u00A0"}</div>)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
