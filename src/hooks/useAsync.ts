import { useCallback, useEffect, useState } from 'react';

export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  immediate = true,
  deps: React.DependencyList = []
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunction(...args);
        setState({ data: result, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        });
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, deps);

  return { ...state, execute, reset };
}

export function useFetch<T>(
  url: string,
  options?: RequestInit,
  immediate = true
): UseAsyncReturn<T> {
  const fetchData = useCallback(async () => {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }, [url, options]);

  return useAsync<T>(fetchData, immediate, [url, options]);
}

export function useAsyncCallback<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>
): [UseAsyncState<T>, (...args: Args) => Promise<void>] {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: Args) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunction(...args);
        setState({ data: result, loading: false, error: null });
      } catch (error) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        });
      }
    },
    [asyncFunction]
  );

  return [state, execute];
}

export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): UseAsyncReturn<T> & { retry: () => void; retryCount: number } {
  const [retryCount, setRetryCount] = useState(0);

  const retryWrapper = useCallback(async () => {
    let lastError: Error | null = null;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        setRetryCount(i);
        return await asyncFunction();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }, [asyncFunction, maxRetries, delay]);

  const asyncState = useAsync(retryWrapper, false);

  const retry = useCallback(() => {
    setRetryCount(0);
    asyncState.execute();
  }, [asyncState.execute]);

  return {
    ...asyncState,
    retry,
    retryCount,
  };
}
