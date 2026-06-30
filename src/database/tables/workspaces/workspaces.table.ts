import { EntityTable } from '@self/types';

export namespace WorkspacesTable {
  export type Schema = EntityTable & {
    name: string;
    picture: string | null;
  };
}
