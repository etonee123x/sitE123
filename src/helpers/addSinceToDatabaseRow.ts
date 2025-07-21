import { WithDatabaseMeta } from '@etonee123x/shared/types/database';

export const addSinceToDatabaseRow = <const T extends WithDatabaseMeta>(row: T) => {
  const now = Date.now();

  return {
    ...row,
    _meta: {
      ...row._meta,
      sinceCreated: now - row._meta.createdAt,
      sinceUpdated: now - row._meta.updatedAt,
    },
  };
};
