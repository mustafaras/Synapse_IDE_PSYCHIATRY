import * as React from "react";
import { LuSparkles } from "react-icons/lu";
import styles from "../styles/header-new.module.css";

export type TimerButtonProps = {
  onOpen: () => void;
  running?: boolean;
  className?: string;
  label?: string;
};

export const TimerButton: React.FC<TimerButtonProps> = ({
  onOpen,
  running = false,
  className,
  label = "Magic Session Timer",
}) => {
  const cls =
    (className ? className + " " : "") +
    styles.timeBtn +
    (running ? " " + styles.isRunning : "");

  return (
    <button
      type="button"
      className={cls}
      onClick={onOpen}
      title="Magic Session Timer (Ctrl/Cmd+Shift+T)"
      aria-label="Open magic session timer"
      aria-pressed={running}
      data-testid="hdr-time-btn"
    >
      {}
      <LuSparkles className={styles.timeIcon} aria-hidden="true" />
      <span className={styles.timeLabel}>{label}</span>
      {}
      <span
        aria-hidden="true"
        className={
          styles.timeDot + " " + (running ? styles.timeDotPulse : styles.timeDotIdle)
        }
      />
    </button>
  );
};
