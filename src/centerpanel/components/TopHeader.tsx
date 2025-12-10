import React, { useEffect, useMemo, useRef, useState } from "react";
import { LuDatabase, LuUserPlus, LuBookOpen, LuFileEdit, LuWorkflow, LuWrench, LuActivity, LuShield } from "react-icons/lu";
import hdr from "../styles/header-new.module.css";
import { fmtClock } from "../lib/persist";
import StatusRail from "./StatusRail";
import OverflowMenu from "./OverflowMenu";
import { flags as cpFlags } from "../config/flags";
import { logEvent } from "@/utils/telemetry";

export interface TopHeaderProps {
  tabs: string[];
  activeTab: string;
  onTabChange(tab: string): void;
  sessionLabel?: string;
  nowTs: number;
  children?: React.ReactNode;
}

const TAB_ICONS: Record<string, React.ComponentType> = {
  "Registry": LuDatabase,
  "New Patient": LuUserPlus,
  "Guide": LuBookOpen,
  "Note": LuFileEdit,
  "Flows": LuWorkflow,
  "Tools": LuWrench,
};

const TopHeader: React.FC<TopHeaderProps> = ({ tabs, activeTab, onTabChange, sessionLabel, nowTs, children }) => {

  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const prevActiveRef = useRef<string | null>(null);
  const didMountRef = useRef(false);
  const [systemStatus, setSystemStatus] = useState<'healthy' | 'processing' | 'idle'>('idle');
  const [animateTransition, setAnimateTransition] = useState(false);
  const handleTablistKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowLeft":
      case "Home":
      case "End": {
        e.preventDefault();
        const nodes = tabRefs.current.filter(Boolean) as HTMLButtonElement[];
        if (!nodes.length) return;
        const activeEl = document.activeElement as HTMLElement | null;
        let idx = Math.max(0, nodes.findIndex(n => n === activeEl));
        if (idx === -1) idx = Math.max(0, nodes.findIndex(n => n.getAttribute("aria-selected") === "true"));
        const last = nodes.length - 1;
        if (e.key === "Home") idx = 0;
        else if (e.key === "End") idx = last;
        else if (e.key === "ArrowRight") idx = (idx + 1) % nodes.length;
        else idx = (idx - 1 + nodes.length) % nodes.length;
        nodes[idx]?.focus();
        break;
      }
      case "Enter":
      case " ": {
        const nodes = tabRefs.current.filter(Boolean) as HTMLButtonElement[];
        const activeEl = document.activeElement as HTMLButtonElement | null;
        const idx = nodes.findIndex(n => n === activeEl);
        if (idx >= 0) onTabChange(tabs[idx]);
        break;
      }
      default:
        break;
    }
  };

  const timeStr = useMemo(() => fmtClock(nowTs), [nowTs]);

  // System health monitoring (simulated)
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.9) setSystemStatus('processing');
      else if (rand > 0.7) setSystemStatus('healthy');
      else setSystemStatus('idle');
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevActiveRef.current = activeTab;
      return;
    }
    const from = prevActiveRef.current;
    const to = activeTab;
    if (from !== to) {
      setAnimateTransition(true);
      setTimeout(() => setAnimateTransition(false), 300);
      try { logEvent("centerHeader.tabChanged", { from, to }); } catch {}
      prevActiveRef.current = to;
    }
  }, [activeTab]);

  const headerClass = children ? `${hdr.header} ${hdr.headerShowRight}` : hdr.header;
  const statusIndicatorClass = `${hdr.statusIndicator} ${hdr[`status_${systemStatus}`]}`;
  
  return (
    <header className={headerClass} role="banner" data-transition={animateTransition ? 'active' : undefined}>
      <svg className={hdr.neuralHeader} viewBox="0 0 1400 60" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <radialGradient id="nodeGlow1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3aa0ff" stopOpacity="1"/>
            <stop offset="50%" stopColor="#0d74c7" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#0d74c7" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="nodeGlow2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.95"/>
            <stop offset="50%" stopColor="#3aa0ff" stopOpacity="0.5"/>
            <stop offset="100%" stopColor="#0d74c7" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="nodeGlow3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0d74c7" stopOpacity="0.85"/>
            <stop offset="50%" stopColor="#1e5a8e" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#0d74c7" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d74c7" stopOpacity="0.3"/>
            <stop offset="50%" stopColor="#3aa0ff" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#0d74c7" stopOpacity="0.3"/>
          </linearGradient>
        </defs>
        
        {/* Background layer - slower, dimmer, larger nodes */}
        <g className={hdr.neuralLayer} style={{opacity: 0.4}}>
          <circle cx="130" cy="25" r="4" fill="url(#nodeGlow3)">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3.5s" repeatCount="indefinite"/>
            <animate attributeName="r" values="3.5;4.5;3.5" dur="3.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="380" cy="45" r="3.5" fill="url(#nodeGlow3)">
            <animate attributeName="opacity" values="0.25;0.55;0.25" dur="4.2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="620" cy="12" r="4.5" fill="url(#nodeGlow3)">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3.8s" repeatCount="indefinite"/>
            <animate attributeName="r" values="4;5;4" dur="3.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="890" cy="38" r="3.5" fill="url(#nodeGlow3)">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1170" cy="22" r="4" fill="url(#nodeGlow3)">
            <animate attributeName="opacity" values="0.25;0.55;0.25" dur="3.9s" repeatCount="indefinite"/>
          </circle>
        </g>
        
        {/* Mid layer - medium speed, varied sizes */}
        <g className={hdr.neuralLayer} style={{opacity: 0.65}}>
          <circle cx="75" cy="35" r="2.8" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.4s" repeatCount="indefinite"/>
            <animate attributeName="r" values="2.5;3.2;2.5" dur="1.4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="165" cy="18" r="3.2" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="245" cy="42" r="2.5" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.45;0.85;0.45" dur="2.1s" repeatCount="indefinite"/>
            <animate attributeName="r" values="2.2;3;2.2" dur="2.1s" repeatCount="indefinite"/>
          </circle>
          <circle cx="340" cy="28" r="3" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.5;0.95;0.5" dur="1.6s" repeatCount="indefinite"/>
          </circle>
          <circle cx="425" cy="15" r="2.6" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.9s" repeatCount="indefinite"/>
          </circle>
          <circle cx="515" cy="48" r="3.1" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.7s" repeatCount="indefinite"/>
            <animate attributeName="r" values="2.8;3.5;2.8" dur="1.7s" repeatCount="indefinite"/>
          </circle>
          <circle cx="605" cy="32" r="2.7" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.45;0.85;0.45" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="695" cy="20" r="3" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.5;0.95;0.5" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="785" cy="40" r="2.8" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.4;0.85;0.4" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="r" values="2.5;3.2;2.5" dur="1.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="875" cy="25" r="3.2" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.6s" repeatCount="indefinite"/>
          </circle>
          <circle cx="965" cy="45" r="2.6" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.45;0.8;0.45" dur="2.2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1055" cy="18" r="3.1" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.5;0.95;0.5" dur="1.7s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1145" cy="38" r="2.7" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.4;0.85;0.4" dur="1.9s" repeatCount="indefinite"/>
            <animate attributeName="r" values="2.4;3.1;2.4" dur="1.9s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1235" cy="28" r="3" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1315" cy="15" r="2.8" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.45;0.85;0.45" dur="2s" repeatCount="indefinite"/>
          </circle>
        </g>
        
        {/* Foreground layer - fast, bright, small nodes */}
        <g className={hdr.neuralLayer} style={{opacity: 1}}>
          <circle cx="50" cy="30" r="2.2" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="0.7s" repeatCount="indefinite"/>
            <animate attributeName="r" values="2;2.5;2" dur="0.7s" repeatCount="indefinite"/>
          </circle>
          <circle cx="120" cy="15" r="2.5" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="0.9s" repeatCount="indefinite"/>
            <animate attributeName="r" values="2.2;2.8;2.2" dur="0.9s" repeatCount="indefinite"/>
          </circle>
          <circle cx="195" cy="40" r="2" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.65;0.95;0.65" dur="1.1s" repeatCount="indefinite"/>
          </circle>
          <circle cx="275" cy="22" r="2.3" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="0.85s" repeatCount="indefinite"/>
          </circle>
          <circle cx="355" cy="48" r="2.1" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.6;0.95;0.6" dur="1.05s" repeatCount="indefinite"/>
            <animate attributeName="r" values="1.9;2.4;1.9" dur="1.05s" repeatCount="indefinite"/>
          </circle>
          <circle cx="440" cy="35" r="2.4" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="0.95s" repeatCount="indefinite"/>
          </circle>
          <circle cx="525" cy="18" r="2" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.65;0.95;0.65" dur="1.15s" repeatCount="indefinite"/>
          </circle>
          <circle cx="610" cy="42" r="2.5" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="0.8s" repeatCount="indefinite"/>
            <animate attributeName="r" values="2.2;2.8;2.2" dur="0.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="690" cy="28" r="2.2" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.6;0.95;0.6" dur="1s" repeatCount="indefinite"/>
          </circle>
          <circle cx="770" cy="12" r="2.3" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="0.9s" repeatCount="indefinite"/>
          </circle>
          <circle cx="850" cy="45" r="2.1" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.65;0.95;0.65" dur="1.1s" repeatCount="indefinite"/>
            <animate attributeName="r" values="1.9;2.5;1.9" dur="1.1s" repeatCount="indefinite"/>
          </circle>
          <circle cx="935" cy="30" r="2.4" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="0.85s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1015" cy="20" r="2" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.6;0.95;0.6" dur="1.05s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1095" cy="38" r="2.5" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="0.95s" repeatCount="indefinite"/>
            <animate attributeName="r" values="2.2;2.8;2.2" dur="0.95s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1180" cy="15" r="2.2" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.65;0.95;0.65" dur="1.15s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1260" cy="42" r="2.3" fill="url(#nodeGlow2)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="0.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="1340" cy="25" r="2.1" fill="url(#nodeGlow1)">
            <animate attributeName="opacity" values="0.6;0.95;0.6" dur="1s" repeatCount="indefinite"/>
            <animate attributeName="r" values="1.9;2.4;1.9" dur="1s" repeatCount="indefinite"/>
          </circle>
        </g>
        
        {/* Dynamic connections - varied thickness and behavior */}
        <g className={hdr.neuralConnections}>
          {/* Fast flickering short connections */}
          <line x1="50" y1="30" x2="120" y2="15" stroke="url(#lineGlow)" strokeWidth="1.8">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="0.7s" repeatCount="indefinite"/>
            <animate attributeName="strokeWidth" values="1.5;2.2;1.5" dur="0.7s" repeatCount="indefinite"/>
          </line>
          <line x1="195" y1="40" x2="275" y2="22" stroke="url(#lineGlow)" strokeWidth="1.6">
            <animate attributeName="opacity" values="0.4;0.85;0.4" dur="1.1s" repeatCount="indefinite"/>
          </line>
          <line x1="355" y1="48" x2="440" y2="35" stroke="url(#lineGlow)" strokeWidth="1.4">
            <animate attributeName="opacity" values="0.35;0.8;0.35" dur="1.05s" repeatCount="indefinite"/>
            <animate attributeName="strokeWidth" values="1.2;1.8;1.2" dur="1.05s" repeatCount="indefinite"/>
          </line>
          <line x1="525" y1="18" x2="610" y2="42" stroke="url(#lineGlow)" strokeWidth="1.7">
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="0.8s" repeatCount="indefinite"/>
          </line>
          <line x1="690" y1="28" x2="770" y2="12" stroke="url(#lineGlow)" strokeWidth="1.5">
            <animate attributeName="opacity" values="0.35;0.85;0.35" dur="1s" repeatCount="indefinite"/>
            <animate attributeName="strokeWidth" values="1.3;1.9;1.3" dur="1s" repeatCount="indefinite"/>
          </line>
          <line x1="850" y1="45" x2="935" y2="30" stroke="url(#lineGlow)" strokeWidth="1.6">
            <animate attributeName="opacity" values="0.4;0.9;0.4" dur="0.9s" repeatCount="indefinite"/>
          </line>
          <line x1="1015" y1="20" x2="1095" y2="38" stroke="url(#lineGlow)" strokeWidth="1.4">
            <animate attributeName="opacity" values="0.35;0.8;0.35" dur="1.15s" repeatCount="indefinite"/>
          </line>
          <line x1="1180" y1="15" x2="1260" y2="42" stroke="url(#lineGlow)" strokeWidth="1.8">
            <animate attributeName="opacity" values="0.4;0.85;0.4" dur="0.95s" repeatCount="indefinite"/>
            <animate attributeName="strokeWidth" values="1.5;2.1;1.5" dur="0.95s" repeatCount="indefinite"/>
          </line>
          
          {/* Medium speed mid-range connections */}
          <line x1="120" y1="15" x2="275" y2="22" stroke="url(#lineGlow)" strokeWidth="1.2">
            <animate attributeName="opacity" values="0.2;0.65;0.2" dur="1.8s" repeatCount="indefinite"/>
          </line>
          <line x1="340" y1="28" x2="525" y2="18" stroke="url(#lineGlow)" strokeWidth="1.1">
            <animate attributeName="opacity" values="0.25;0.7;0.25" dur="1.6s" repeatCount="indefinite"/>
          </line>
          <line x1="605" y1="32" x2="785" y2="40" stroke="url(#lineGlow)" strokeWidth="1.3">
            <animate attributeName="opacity" values="0.2;0.65;0.2" dur="2s" repeatCount="indefinite"/>
          </line>
          <line x1="875" y1="25" x2="1055" y2="18" stroke="url(#lineGlow)" strokeWidth="1">
            <animate attributeName="opacity" values="0.25;0.7;0.25" dur="1.7s" repeatCount="indefinite"/>
          </line>
          <line x1="1145" y1="38" x2="1315" y2="15" stroke="url(#lineGlow)" strokeWidth="1.2">
            <animate attributeName="opacity" values="0.2;0.65;0.2" dur="1.9s" repeatCount="indefinite"/>
          </line>
          
          {/* Slow pulsing long-range connections */}
          <line x1="75" y1="35" x2="425" y2="15" stroke="url(#lineGlow)" strokeWidth="0.8">
            <animate attributeName="opacity" values="0.1;0.5;0.1" dur="3.2s" repeatCount="indefinite"/>
          </line>
          <line x1="245" y1="42" x2="695" y2="20" stroke="url(#lineGlow)" strokeWidth="0.7">
            <animate attributeName="opacity" values="0.12;0.48;0.12" dur="3.8s" repeatCount="indefinite"/>
          </line>
          <line x1="515" y1="48" x2="935" y2="30" stroke="url(#lineGlow)" strokeWidth="0.9">
            <animate attributeName="opacity" values="0.1;0.52;0.1" dur="3.5s" repeatCount="indefinite"/>
          </line>
          <line x1="785" y1="40" x2="1235" y2="28" stroke="url(#lineGlow)" strokeWidth="0.8">
            <animate attributeName="opacity" values="0.15;0.5;0.15" dur="3.9s" repeatCount="indefinite"/>
          </line>
          <line x1="165" y1="18" x2="1180" y2="15" stroke="url(#lineGlow)" strokeWidth="0.6">
            <animate attributeName="opacity" values="0.08;0.45;0.08" dur="4.5s" repeatCount="indefinite"/>
          </line>
          
          {/* Cross-layer connections for depth */}
          <line x1="130" y1="25" x2="340" y2="28" stroke="url(#nodeGlow3)" strokeWidth="0.5" opacity="0.3">
            <animate attributeName="opacity" values="0.15;0.4;0.15" dur="4s" repeatCount="indefinite"/>
          </line>
          <line x1="620" y1="12" x2="850" y2="45" stroke="url(#nodeGlow3)" strokeWidth="0.5" opacity="0.25">
            <animate attributeName="opacity" values="0.1;0.35;0.1" dur="4.2s" repeatCount="indefinite"/>
          </line>
          <line x1="890" y1="38" x2="1145" y2="38" stroke="url(#nodeGlow3)" strokeWidth="0.5" opacity="0.3">
            <animate attributeName="opacity" values="0.12;0.38;0.12" dur="3.8s" repeatCount="indefinite"/>
          </line>
        </g>
      </svg>
      <div className={hdr.row}>
        <div className={hdr.brand}>
          <div className={hdr.logoContainer}>
            <svg className={hdr.neuralBg} viewBox="0 0 80 80" aria-hidden="true">
              <defs>
                <radialGradient id="neuralGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0d74c7" stopOpacity="0.4"/>
                  <stop offset="100%" stopColor="#3aa0ff" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <circle cx="15" cy="20" r="2" fill="#0d74c7" opacity="0.6">
                <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
              </circle>
              <circle cx="65" cy="25" r="2" fill="#3aa0ff" opacity="0.6">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="40" cy="40" r="3" fill="#0d74c7" opacity="0.8">
                <animate attributeName="r" values="2.5;3.5;2.5" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <circle cx="25" cy="60" r="2" fill="#3aa0ff" opacity="0.6">
                <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="55" cy="55" r="2" fill="#0d74c7" opacity="0.6">
                <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2.2s" repeatCount="indefinite"/>
              </circle>
              <line x1="15" y1="20" x2="40" y2="40" stroke="url(#neuralGlow)" strokeWidth="1" opacity="0.3">
                <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite"/>
              </line>
              <line x1="65" y1="25" x2="40" y2="40" stroke="url(#neuralGlow)" strokeWidth="1" opacity="0.3">
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite"/>
              </line>
              <line x1="40" y1="40" x2="25" y2="60" stroke="url(#neuralGlow)" strokeWidth="1" opacity="0.3">
                <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite"/>
              </line>
              <line x1="40" y1="40" x2="55" y2="55" stroke="url(#neuralGlow)" strokeWidth="1" opacity="0.3">
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2.2s" repeatCount="indefinite"/>
              </line>
            </svg>
            <div className={hdr.logo} aria-hidden>
              <div className={hdr.logoCore} />
              <div className={hdr.logoPulse} />
              <div className={hdr.logoRing} />
            </div>
            <div className={statusIndicatorClass} aria-label={`System status: ${systemStatus}`} title={`System ${systemStatus}`}>
              {systemStatus === 'healthy' && <LuShield size={10} />}
              {systemStatus === 'processing' && <LuActivity size={10} />}
            </div>
          </div>
          <div className={hdr.brandText}>
            <div className={hdr.brandLine}>
              <span className={hdr.clinician}>Clinician</span>
              <span className={hdr.middleDot}> · </span>
              <span className={hdr.copilot}>
                Copilot
                <span className={hdr.hologramEffect} aria-hidden="true" />
                <span className={hdr.dataStream} aria-hidden="true">AI</span>
              </span>
            </div>
            <div className={hdr.sessionBadge}>
              <span className={hdr.badgeLabel} aria-label="Session name">{sessionLabel || "SESSION"}</span>
              <span className={hdr.badgeSeparator}>•</span>
              <span className={hdr.badgeTime} aria-label="Session time">{timeStr}</span>
            </div>
          </div>
          <div className={hdr.divider} aria-hidden="true" />
        </div>

        <div className={hdr.tabsWrap} role="tablist" aria-label="Center panel navigation tabs" onKeyDown={handleTablistKeyDown} tabIndex={0}>
          {tabs.map((tab, i) => {
            const IconComponent = TAB_ICONS[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                role="tab"
                className={hdr.tab}
                data-state={isActive ? 'active' : 'inactive'}
                aria-selected={isActive ? true : false}
                aria-current={isActive ? 'page' : undefined}
                id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                aria-controls={`panel-${tab.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  try { logEvent("centerHeader.tabClicked", { from: activeTab, to: tab }); } catch {}
                  onTabChange(tab);
                }}
                ref={(el) => { tabRefs.current[i] = el; }}
                tabIndex={isActive ? 0 : -1}
              >
                <span className={hdr.tabIcon}>
                  {IconComponent && <IconComponent aria-hidden="true" />}
                </span>
                <span className={hdr.tabLabel}>{tab}</span>
                <span className={hdr.tabIndicator} aria-hidden="true" />
                {cpFlags.centerHeaderV2 && <span className={hdr.tabUnderline} aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <div className={hdr.right} aria-label="Session controls">
          {children}
          {}
          {}
          <OverflowMenu tabs={tabs} activeTab={activeTab} onSelect={onTabChange} />
        </div>
      </div>

      {}
      {(activeTab === "Guide" || activeTab === "Flows") ? null : (
        <div className={hdr.railWrap}>
          <StatusRail mode="progress" progress={0} ariaLabel={`${activeTab} status`} />
        </div>
      )}
    </header>
  );
};

export default TopHeader;
