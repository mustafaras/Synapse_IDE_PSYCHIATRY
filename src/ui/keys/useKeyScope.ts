import { useEffect } from 'react';
import type { KeyScope } from './types';
import { registerKeyScope } from './router';

export const useKeyScope = (scope: KeyScope | null | undefined) => {
  useEffect(() => {
  if (!scope) return undefined;
  const dispose = registerKeyScope(scope);
  return () => { dispose(); };
  }, [scope]);
};

export default useKeyScope;
