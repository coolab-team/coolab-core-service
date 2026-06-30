import { platformWorkspacePermissions } from '@self/consts';
import { NotFoundException } from '@self/exceptions';
import { WorkspaceUsersRepository } from '@self/repositories';

type Params = {
  permissions: (typeof platformWorkspacePermissions)[keyof typeof platformWorkspacePermissions];
  userId: string;
  workspaceId: string;
};

export const retrieveUserWorkspacesApplication = async (params: Params) => {
  const workspaceUser = await WorkspaceUsersRepository.selectByWorkspaceIdAndUserId({
    userId: params.userId,
    workspaceId: params.workspaceId,
  })
    .executeTakeFirst();

  if(!workspaceUser) {
    throw new NotFoundException({
      feedback: {
        enUs: 'The workspace user was not found.',
        esEs: 'El usuario del workspace no fue encontrado.',
        ptBr: 'O usuário do espaço de trabalho não foi encontrado.',
      },
      message: 'The workspace user was not found.',
    });
  }

  const mapped = {
    ...workspaceUser,
    permissions: params.permissions,
  };

  return mapped;
};
