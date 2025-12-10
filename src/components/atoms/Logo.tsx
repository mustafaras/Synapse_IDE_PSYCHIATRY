import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Logo: React.FC<{ size?: number }> = ({ size = 80 }) => {
  const { theme, themeName } = useTheme();

  const gradientPrimary = themeName === 'neutral' ? '#00A6D7' : theme.colors.primary;
  const gradientAccent = themeName === 'neutral' ? '#00A6D7' : theme.colors.accent;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradientPrimary} />
          <stop offset="100%" stopColor={gradientAccent} />
        </linearGradient>
      </defs>
      <circle cx="20" cy="25" r="5" fill="url(#logoGradient)" opacity="0.9" />
      <circle cx="60" cy="25" r="5" fill="url(#logoGradient)" opacity="0.9" />
      <circle cx="40" cy="40" r="6" fill="url(#logoGradient)" />
      <circle cx="20" cy="55" r="5" fill="url(#logoGradient)" opacity="0.9" />
      <circle cx="60" cy="55" r="5" fill="url(#logoGradient)" opacity="0.9" />
      <path
        d="M25 25 L34 40 M46 40 L55 25 M25 55 L34 40 M46 40 L55 55"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M10 40 Q20 35 30 40 Q40 45 50 40 Q60 35 70 40"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
};

export default Logo;
