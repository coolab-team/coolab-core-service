import { WorkspaceUsersTable } from '@self/database';
import { InferFromValidation, SelectableTableSchema } from '@self/types';
import { z } from 'zod';

import { helpers } from '../../helpers';
import { id } from '../../id';

type Selectable = SelectableTableSchema<WorkspaceUsersTable.Schema>;

const role = () => z.enum(['owner', 'admin', 'member'])
  .describe('The workspace user role.');

const selectable = () => helpers().table().weakEntity().extend({
  role: role(),
  userId: id()
    .describe('The user ID.'),
  workspaceId: id()
    .describe('The workspace ID.'),
}) satisfies z.ZodType<Selectable>;

const insertable = () => helpers().table().weakInsertable(selectable());

const updatable = () => z.object({
  role: role().optional(),
});

export type SelectableWorkspaceUser = InferFromValidation<ReturnType<typeof selectable>>;
export type InsertableWorkspaceUser = InferFromValidation<ReturnType<typeof insertable>>;
export type UpdatableWorkspaceUser = InferFromValidation<ReturnType<typeof updatable>>;

export const workspaceUsers = () => ({
  insertable,
  role,
  selectable,
  updatable,
});
