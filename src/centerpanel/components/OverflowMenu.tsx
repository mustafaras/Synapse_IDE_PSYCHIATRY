import React, { useEffect, useRef, useState } from "react";
import hdr from "../styles/header-new.module.css";

export interface OverflowMenuProps {
  tabs: string[];
  activeTab: string;
  onSelect(tab: string): void;
}

const OverflowMenu: React.FC<OverflowMenuProps> = ({ tabs, activeTab, onSelect }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node | null;
      if (menuRef.current && menuRef.current.contains(t)) return;
      if (btnRef.current && btnRef.current.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [open]);

  return (
    <div className={hdr.moreWrap}>
      <button
        ref={btnRef}
        className={hdr.moreBtn}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="header-overflow-menu"
        onClick={() => setOpen(v => !v)}
      >
        More
      </button>
      {open && (
        <div
          id="header-overflow-menu"
          role="menu"
          ref={menuRef}
          className={hdr.menu}
          aria-label="More tabs"
        >
          {tabs.map((t) => (
            <button
              key={t}
              role="menuitemradio"
              aria-checked={activeTab === t}
              className={hdr.menuItem}
              onClick={() => {
                onSelect(t);
                setOpen(false);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OverflowMenu;
