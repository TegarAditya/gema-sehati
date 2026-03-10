/**
 * SWR Hooks for Supabase Data Operations
 * 
 * Provides:
 * - useSupabaseQuery: Read-only SWR query wrapper
 * - useSupabaseMutation: Create/Update/Delete mutations with automatic invalidation
 * - useSWRInvalidate: Helper to invalidate multiple SWR keys
 */

import { useCallback, useState } from 'react';
import useSWR, { SWRConfiguration, mutate } from 'swr';
import { getInvalidationsForMutation } from './swrKeys';

export type SupabaseError = {
  error?: {
    message: string;
    code?: string;
  } | null;
};

/**
 * Hook for SWR-wrapped Supabase reads with type safety.
 * 
 * @param key - SWR cache key (can be null for conditional fetching)
 * @param fetcher - Async function that executes the Supabase query
 * @param options - SWR configuration options
 * @returns { data, error, isLoading, isValidating, mutate }
 * 
 * @example
 * // Simple read
 * const { data: recipes } = useSupabaseQuery(
 *   SWR_KEYS.MPASI_RECIPES,
 *   () => supabase.from('mpasi_recipes').select('*').then(res => res.data)
 * );
 * 
 * // Conditional read (null key = no fetch)
 * const { data: children } = useSupabaseQuery(
 *   user ? ['children', user.id] : null,
 *   () => supabase
 *     .from('children')
 *     .select('*')
 *     .eq('user_id', user.id)
 *     .then(res => res.data)
 * );
 */
export function useSupabaseQuery<T = unknown>(
  key: string | (string | number)[] | null,
  fetcher: (key: unknown) => Promise<T>,
  options?: SWRConfiguration<T>
) {
  const { data, error, isLoading, isValidating, mutate: mutateSWR } = useSWR<T>(
    key,
    key ? () => fetcher(key) : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      dedupingInterval: 1000,
      focusThrottleInterval: 5000,
      ...options,
    }
  );

  return {
    data,
    error,
    isLoading: isLoading || (!data && !error),
    isValidating,
    mutate: mutateSWR,
  };
}

export type MutationOptions = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  revalidateKeys?: (string | string[])[];
  showError?: boolean;
};

/**
 * Hook for SWR-backed mutations (create, update, delete).
 * Automatically invalidates relevant SWR keys on success.
 * 
 * @param mutationKey - Used to look up auto-invalidation keys (e.g., 'children.create')
 * @param userId - Current user ID for user-scoped invalidations
 * @param options - Configuration for error handling and callbacks
 * @returns { execute, isLoading, error }
 * 
 * @example
 * const { execute: createChild, isLoading } = useSupabaseMutation(
 *   'children.create',
 *   user?.id,
 *   { onSuccess: () => alert('Child created!') }
 * );
 * 
 * const handleCreate = async (childData) => {
 *   const { error } = await supabase
 *     .from('children')
 *     .insert([childData]);
 *   
 *   if (!error) {
 *     await createChild(); // triggers invalidations
 *   }
 * };
 */
export function useSupabaseMutation(
  mutationKey: string,
  userId: string | undefined,
  options?: MutationOptions
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get all keys to revalidate for this mutation
      const keysToRevalidate = getInvalidationsForMutation(mutationKey, userId);

      // Custom revalidations take precedence
      const finalKeys = options?.revalidateKeys || keysToRevalidate;

      // Revalidate all relevant keys
      await Promise.all(finalKeys.map((key) => mutate(key)));

      options?.onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options?.onError?.(error);

      if (options?.showError !== false) {
        console.error(`Mutation error (${mutationKey}):`, error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [mutationKey, userId, options]);

  return {
    execute,
    isLoading,
    error,
  };
}

/**
 * Helper hook to manually invalidate one or more SWR keys.
 * Useful for complex data flows or cross-key dependencies.
 * 
 * @example
 * const { invalidate } = useInvalidateSWR();
 * 
 * const handleComplexMutation = async () => {
 *   await doSomething();
 *   await invalidate(['children', userId], ['dashboard', userId]);
 * };
 */
export function useInvalidateSWR() {
  const invalidate = useCallback(async (...keys: (string | (string | number)[])[]) => {
    await Promise.all(keys.map((key) => mutate(key)));
  }, []);

  return { invalidate };
}

// Re-export for convenience
export { mutate };

