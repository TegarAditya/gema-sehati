/**
 * SWR Key Generation and Cache Key Conventions
 * 
 * Keys are either strings or [key, ...args] tuples.
 * User-scoped keys include userId to prevent cross-user cache collisions.
 * Global keys are reused across all users.
 */

// Global keys (not user-scoped)
export const SWR_KEYS = {
  STORIES: 'stories',
  MPASI_RECIPES: 'mpasi-recipes',
  VIDEOS: 'videos',
} as const;

// Factory functions for user-scoped keys
// These keys include userId to prevent cache collisions when switching users
export const userScopedKeys = (userId: string | undefined) => ({
  CHILDREN: userId ? ['children', userId] : null,
  READING_LOGS: userId ? ['reading-logs', userId] : null,
  GROWTH_RECORDS: userId ? ['growth-records', userId] : null,
  IMMUNIZATION_RECORDS: userId ? ['immunization-records', userId] : null,
  ACTIVITY_PHOTOS: userId ? ['activity-photos', userId] : null,
  USER_PROFILE: userId ? ['user-profile', userId] : null,
  DASHBOARD: userId ? ['dashboard', userId] : null,
});

// Admin-specific keys (typically admin-only, but include pagination/search)
export const adminKeys = {
  USERS: (page?: number, search?: string) =>
    ['admin-users', page ?? 1, search ?? ''].filter(Boolean),
  CHILDREN: (page?: number, search?: string) =>
    ['admin-children', page ?? 1, search ?? ''].filter(Boolean),
  STORIES: 'admin-stories',
  MPASI_RECIPES: 'admin-mpasi-recipes',
  VIDEOS: 'admin-videos',
  GROWTH_RECORDS: 'admin-growth-records',
  READING_LOGS: 'admin-reading-logs',
  IMMUNIZATION_RECORDS: 'admin-immunization-records',
} as const;

/**
 * Map mutations to SWR keys that should be revalidated.
 * Used by useSupabaseMutation to invalidate affected caches after CRUD operations.
 */
export const mutationInvalidations = (userId: string | undefined) => ({
  // Child mutations invalidate child lists and all dependent data
  'children.create':
    userId
      ? [
          ['children', userId],
          ['dashboard', userId],
          ['health', userId],
          ['literacy', userId],
          'admin-children',
        ]
      : [],
  'children.update': userId
    ? [
        ['children', userId],
        ['dashboard', userId],
        ['health', userId],
        ['literacy', userId],
        'admin-children',
      ]
    : [],
  'children.delete': userId
    ? [
        ['children', userId],
        ['dashboard', userId],
        ['health', userId],
        ['literacy', userId],
        'admin-children',
      ]
    : [],

  // Reading logs mutations
  'reading-logs.create': userId ? [['reading-logs', userId], 'admin-reading-logs'] : [],
  'reading-logs.update': userId ? [['reading-logs', userId], 'admin-reading-logs'] : [],
  'reading-logs.delete': userId ? [['reading-logs', userId], 'admin-reading-logs'] : [],

  // Growth records mutations
  'growth-records.create': userId
    ? [['growth-records', userId], 'admin-growth-records']
    : [],
  'growth-records.update': userId
    ? [['growth-records', userId], 'admin-growth-records']
    : [],
  'growth-records.delete': userId
    ? [['growth-records', userId], 'admin-growth-records']
    : [],

  // Immunization records mutations
  'immunization-records.create': userId
    ? [['immunization-records', userId], 'admin-immunization-records']
    : [],
  'immunization-records.update': userId
    ? [['immunization-records', userId], 'admin-immunization-records']
    : [],
  'immunization-records.delete': userId
    ? [['immunization-records', userId], 'admin-immunization-records']
    : [],

  // Activity photos mutations
  'activity-photos.create': userId
    ? [['activity-photos', userId], 'admin-activity-photos']
    : [],
  'activity-photos.update': userId
    ? [['activity-photos', userId], 'admin-activity-photos']
    : [],
  'activity-photos.delete': userId
    ? [['activity-photos', userId], 'admin-activity-photos']
    : [],

  // Global mutations (not user-scoped)
  'stories.create': [SWR_KEYS.STORIES, adminKeys.STORIES],
  'stories.update': [SWR_KEYS.STORIES, adminKeys.STORIES],
  'stories.delete': [SWR_KEYS.STORIES, adminKeys.STORIES],

  'mpasi-recipes.create': [SWR_KEYS.MPASI_RECIPES, adminKeys.MPASI_RECIPES],
  'mpasi-recipes.update': [SWR_KEYS.MPASI_RECIPES, adminKeys.MPASI_RECIPES],
  'mpasi-recipes.delete': [SWR_KEYS.MPASI_RECIPES, adminKeys.MPASI_RECIPES],

  'videos.create': [SWR_KEYS.VIDEOS, adminKeys.VIDEOS],
  'videos.update': [SWR_KEYS.VIDEOS, adminKeys.VIDEOS],
  'videos.delete': [SWR_KEYS.VIDEOS, adminKeys.VIDEOS],
  'videos.reorder': [SWR_KEYS.VIDEOS, adminKeys.VIDEOS],

  // User profile mutations
  'user-profile.update': userId ? [['user-profile', userId]] : [],
});

/**
 * Helper to extract revalidation keys for a given mutation event.
 * @param mutationKey - e.g., 'children.create' or 'stories.update'
 * @param userId - current user ID for user-scoped invalidations
 * @returns array of SWR keys to revalidate
 */
export function getInvalidationsForMutation(
  mutationKey: string,
  userId: string | undefined
): (string | string[])[] {
  const invalidations = mutationInvalidations(userId) as Record<string, (string | string[])[]>;
  return invalidations[mutationKey] || [];
}
