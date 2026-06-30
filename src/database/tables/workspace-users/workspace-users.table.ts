import { WeakEntityTable } from '@self/types';

export namespace WorkspaceUsersTable {
  export type Role = 'admin' | 'member' | 'owner';

  export type Schema = WeakEntityTable & {
    role: Role;
    userId: string;
    workspaceId: string;
  };
}
