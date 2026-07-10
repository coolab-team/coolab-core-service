import { WorkspacesTable } from '@self/database';
import { InferFromValidation, SelectableTableSchema } from '@self/types';
import { z } from 'zod';

import { helpers } from '../../helpers';

type Selectable = SelectableTableSchema<WorkspacesTable.Schema>;

const selectable = () => helpers().table().entity().extend({
  name: z.string().min(1).max(120)
    .describe('The workspace name.'),
  picture: z.string().nullable()
    .describe('The workspace picture path.'),
}) satisfies z.ZodType<Selectable>;

const insertable = () => helpers().table().insertable(selectable());

const updatable = () => helpers().table().updatable(selectable())
  .partial();

export type SelectableWorkspace = InferFromValidation<ReturnType<typeof selectable>>;
export type InsertableWorkspace = InferFromValidation<ReturnType<typeof insertable>>;
export type UpdatableWorkspace = InferFromValidation<ReturnType<typeof updatable>>;

export const workspaces = () => ({
  insertable,
  selectable,
  updatable,
});
