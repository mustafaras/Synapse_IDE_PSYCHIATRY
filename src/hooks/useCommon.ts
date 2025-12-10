import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { CSSProperties } from 'react';


export function useCommonStyles() {
  const { theme, themeName } = useTheme();


  const getGlassStyle = (variant: 'default' | 'elevated' | 'subtle' = 'default'): CSSProperties => {
    const baseStyle: CSSProperties = {
      background: 'var(--theme-glass)',
      backdropFilter: 'var(--glass-backdrop-filter)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--theme-shadow)',
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          boxShadow: 'var(--theme-shadow), 0 8px 32px rgba(0, 0, 0, 0.12)',
        };
      case 'subtle':
        return {
          ...baseStyle,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        };
      default:
        return baseStyle;
    }
  };


  const getButtonStyle = (
    variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary',
    size: 'sm' | 'md' | 'lg' = 'md'
  ): CSSProperties => {
    const sizeStyles = {
      sm: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        fontSize: 'var(--font-size-sm)',
        borderRadius: 'var(--radius-sm)',
        minHeight: '2rem',
      },
      md: {
        padding: 'var(--spacing-sm) var(--spacing-md)',
        fontSize: 'var(--font-size-base)',
        borderRadius: 'var(--radius-md)',
        minHeight: '2.5rem',
      },
      lg: {
        padding: 'var(--spacing-md) var(--spacing-lg)',
        fontSize: 'var(--font-size-lg)',
        borderRadius: 'var(--radius-lg)',
        minHeight: '3rem',
      },
    };

    const variantStyles = {
      primary: {
        background: 'var(--theme-primary)',
        color: 'white',
        border: '1px solid var(--theme-primary)',
        boxShadow: 'var(--theme-shadow)',
      },
      secondary: {
        background: 'var(--theme-glass)',
        backdropFilter: 'var(--glass-backdrop-filter)',
        color: 'var(--color-text)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--theme-shadow)',
      },
      ghost: {
        background: 'transparent',
        color: 'var(--color-text)',
        border: '1px solid transparent',
      },
      danger: {
        background: 'var(--color-error)',
        color: 'white',
        border: '1px solid var(--color-error)',
        boxShadow: 'var(--theme-shadow)',
      },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--spacing-xs)',
      fontWeight: '500',
      lineHeight: '1',
      whiteSpace: 'nowrap',
      transition: 'all var(--duration-normal) var(--easing-bauhaus)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    };
  };


  const getCardStyle = (
    variant: 'default' | 'elevated' | 'outlined' | 'glass' | 'premium' = 'default',
    size: 'small' | 'medium' | 'large' | 'golden' = 'medium'
  ): CSSProperties => {
    const sizeStyles = {
      small: {
        padding: 'var(--spacing-sm)',
        borderRadius: 'var(--radius-sm)',
      },
      medium: {
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-md)',
      },
      large: {
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius-lg)',
      },
      golden: {
        padding: 'calc(var(--spacing-md) * 1.618)',
        borderRadius: 'var(--radius-lg)',
      },
    };

    const variantStyles = {
      default: getGlassStyle('default'),
      elevated: getGlassStyle('elevated'),
      outlined: {
        background: 'transparent',
        border: '2px solid var(--glass-border)',
        boxShadow: 'none',
      },
      glass: getGlassStyle('default'),
      premium: {
        background: 'var(--theme-glass)',
        backdropFilter: 'var(--glass-backdrop-filter)',
        border: '1px solid var(--theme-primary)',
        boxShadow: 'var(--theme-shadow), 0 0 20px var(--theme-primary)33',
      },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };


  const getInputStyle = (hasError: boolean = false): CSSProperties => {
    return {
      width: '100%',
      padding: 'var(--spacing-sm) var(--spacing-md)',
      fontSize: 'var(--font-size-base)',
      lineHeight: '1.5',
      color: 'var(--color-text)',
      background: 'var(--theme-glass)',
      backdropFilter: 'var(--glass-backdrop-filter)',
      border: hasError ? '1px solid var(--color-error)' : '1px solid var(--glass-border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--theme-shadow)',
      transition: 'all var(--duration-normal) var(--easing-bauhaus)',
      outline: 'none',
    };
  };


  const getPanelStyle = (
    variant: 'sidebar' | 'modal' | 'toolbar' | 'floating' = 'sidebar'
  ): CSSProperties => {
    const baseStyle = getGlassStyle('elevated');

    const variantStyles = {
      sidebar: {
        ...baseStyle,
        borderRight: '1px solid var(--glass-border)',
        boxShadow: 'var(--theme-shadow), 2px 0 8px rgba(0, 0, 0, 0.1)',
      },
      modal: {
        ...baseStyle,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--theme-shadow), 0 20px 60px rgba(0, 0, 0, 0.2)',
      },
      toolbar: {
        ...baseStyle,
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: 'var(--theme-shadow), 0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      floating: {
        ...baseStyle,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--theme-shadow), 0 10px 40px rgba(0, 0, 0, 0.15)',
      },
    };

    return variantStyles[variant];
  };


  const getHoverStyle = (
    effectType: 'glow' | 'lift' | 'scale' | 'shimmer' | 'none' = 'glow'
  ): CSSProperties => {
    const effects = {
      glow: {
        boxShadow: 'var(--assistant-glow)',
      },
      lift: {
        transform: 'translateY(-4px)',
        boxShadow: 'var(--assistant-glow)',
      },
      scale: {
        transform: 'scale(1.02)',
        boxShadow: 'var(--assistant-glow)',
      },
      shimmer: {
        boxShadow: 'var(--assistant-glow)',
        filter: 'brightness(1.05)',
      },
      none: {
        boxShadow: 'none',
        transform: 'none',
      },
    };

    return effects[effectType];
  };


  const getThemeColors = () => ({
    primary: 'var(--theme-primary)',
    glass: 'var(--theme-glass)',
    shadow: 'var(--theme-shadow)',
    border: 'var(--glass-border)',
    text: 'var(--color-text)',
    textSecondary: 'var(--color-text-secondary)',
    background: 'var(--color-background)',
    surface: 'var(--color-surface)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
    info: 'var(--color-info)',
  });


  const getTransitions = () => ({
    fast: 'all var(--duration-fast) var(--easing-bauhaus)',
    normal: 'all var(--duration-normal) var(--easing-bauhaus)',
    slow: 'all var(--duration-slow) var(--easing-bauhaus)',
    spring: 'all var(--duration-normal) cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  });

  return {
    theme,
    themeName,
    getGlassStyle,
    getButtonStyle,
    getCardStyle,
    getInputStyle,
    getPanelStyle,
    getHoverStyle,
    getThemeColors,
    getTransitions,
  };
}


export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });


  const setValue = (value: T | ((val: T) => T)) => {
    try {

      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);

    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: Event) => void
): void {
  useEffect(() => {
    const listener = (event: Event) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function useKeyPress(targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(true);
      }
    };

    const upHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(false);
      }
    };

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [targetKey]);

  return keyPressed;
}
