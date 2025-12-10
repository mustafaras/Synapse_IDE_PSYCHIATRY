import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const S = (n?: number) => ({ width: n ?? 18, height: n ?? 18, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" });

export const PlayIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <path d="M8 5v14l11-7-11-7Z" fill="currentColor" />
  </svg>
);

export const StopIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <path d="M9 3h6m-9 4h12m-1 0-.7 12.1a2 2 0 0 1-2 1.9H8.7a2 2 0 0 1-2-1.9L6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
    <rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.6" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

export const PrintIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <path d="M7 17h10v4H7v-4Z" stroke="currentColor" strokeWidth="2" />
    <path d="M7 7V3h10v4M7 7h10m-12 4h14a2 2 0 0 1 2 2v4h-4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const CodeIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <path d="M8 8 4 12l4 4M16 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ScissorsIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <circle cx="6" cy="16.5" r="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="6" cy="7.5" r="2" stroke="currentColor" strokeWidth="2" />
    <path d="M8 16l8-8M8 8l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ColumnsIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <rect x="3" y="5" width="8" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <rect x="13" y="5" width="8" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const LinesIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CodeBlockIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg {...S(size)} {...rest}>
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M9 10 7 12l2 2M15 10l2 2-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default {
  PlayIcon, StopIcon, TrashIcon, RefreshIcon, CopyIcon, EyeIcon, PrintIcon,
  CodeIcon, CheckCircleIcon, ScissorsIcon, ColumnsIcon, LinesIcon, CodeBlockIcon,
};
