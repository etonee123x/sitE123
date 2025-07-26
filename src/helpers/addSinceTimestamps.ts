import { WithTimestamps } from '@etonee123x/shared';

export const addSinceTimestamps = <T extends WithTimestamps>(meta: T, now = Date.now()) => ({
  ...meta,
  sinceCreated: now - meta.createdAt,
  ...(meta.updatedAt
    ? {
        sinceUpdated: now - meta.updatedAt,
      }
    : {}),
});
