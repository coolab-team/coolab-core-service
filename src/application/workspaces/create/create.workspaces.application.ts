import { connection } from '@self/database';
import { WorkspacesRepository, WorkspaceUsersRepository } from '@self/repositories';

type Params = {
  name: string;
  userId: string;
};

export const createWorkspacesApplication = async (params: Params) => {
  const workspace = await connection.transaction().execute(async transaction => {
    const created = await WorkspacesRepository.insert({
      name: params.name,
      picture: null,
    }, {
      transaction,
    })
      .returningAll()
      .executeTakeFirstOrThrow();

    await WorkspaceUsersRepository.insert({
      role: 'owner',
      userId: params.userId,
      workspaceId: created.id,
    }, {
      transaction,
    })
      .executeTakeFirstOrThrow();

    return created;
  });

  return workspace;
};
