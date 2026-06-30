import { WorkspaceUsersTable } from '@self/database';
import { WorkspacesRepository } from '@self/repositories';
import { WorkspacesService } from '@self/services';
import { Pagination } from '@self/types';
import { SelectableWorkspace } from '@self/validation/tables/workspaces';

type Params = {
  pagination: Pagination;
  userId: string;
};

type Workspace = SelectableWorkspace & {
  role: WorkspaceUsersTable.Role;
};

type Result = Array<Workspace>;

export const retrieveMultipleWorkspacesApplication = async (params: Params): Promise<Result> => {
  const { limit, page } = params.pagination;

  const workspaces = await WorkspacesRepository.select()
    .innerJoin('workspaceUsers', 'workspaces.id', 'workspaceUsers.workspaceId')
    .where('workspaceUsers.userId', '=', params.userId)
    .selectAll('workspaces')
    .select('workspaceUsers.role as role')
    .orderBy('workspaces.createdAt', 'asc')
    .limit(limit)
    .offset((page - 1) * limit)
    .execute();

  const mapped = await WorkspacesService.ensurePicturesUrl(workspaces);
  return mapped;
};
