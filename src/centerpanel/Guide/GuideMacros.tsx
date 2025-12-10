

import { Copy } from "lucide-react";
import { toastSuccess } from "@/ui/toast/api";
import styles from "../styles/guides.module.css";

export default function GuideMacros({
  blocks, onCopy,
}: {
  blocks: string[];
  onCopy: (txt: string) => void;
}) {
  const joined = blocks.filter(Boolean).join("\n\n");

  const handleCopy = () => {
    onCopy(joined);
    toastSuccess("Copied all sections to clipboard");
  };

  return (
    <div className={styles.macroBar}>
      <button className={styles.macroBtn} onClick={handleCopy} title="Copy all sections">
        <Copy size={14} /><span>Copy all</span>
      </button>
    </div>
  );
}
