import { WorkspaceUsersTable } from '@self/database';
import { NotFoundException, PreconditionFailedException } from '@self/exceptions';
import { MemoizationMemory } from '@self/memories';
import { WorkspaceUsersRepository } from '@self/repositories';

type Params = {
  role: Exclude<WorkspaceUsersTable.Role, 'owner'>;
  userId: string;
  workspaceId: string;
};

export const updateUserWorkspacesApplication = async (params: Params) => {
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

  if(workspaceUser.role === 'owner') {
    throw new PreconditionFailedException({
      feedback: {
        enUs: 'Workspace owners cannot be updated.',
        esEs: 'Los propietarios del workspace no pueden ser actualizados.',
        ptBr: 'Proprietários do espaço de trabalho não podem ser atualizados.',
      },
      message: 'Workspace owners cannot be updated.',
    });
  }

  const result = await WorkspaceUsersRepository.update({
    role: params.role,
  })
    .where('workspaceUsers.workspaceId', '=', params.workspaceId)
    .where('workspaceUsers.userId', '=', params.userId)
    .returningAll()
    .executeTakeFirst();

  if(!result) {
    throw new NotFoundException({
      feedback: {
        enUs: 'The workspace user was not found.',
        esEs: 'El usuario del workspace no fue encontrado.',
        ptBr: 'O usuário do espaço de trabalho não foi encontrado.',
      },
      message: 'The workspace user was not found.',
    });
  }

  await MemoizationMemory.purge(`memo:user-workspace-in-platform-context:${params.userId}:${params.workspaceId}`);

  return result;
};
