import { NotFoundException, PreconditionFailedException } from '@self/exceptions';
import { MemoizationMemory } from '@self/memories';
import { WorkspaceUsersRepository } from '@self/repositories';

type Params = {
  userId: string;
  workspaceId: string;
};

export const deleteUserWorkspacesApplication = async (params: Params) => {
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
        enUs: 'Workspace owners cannot be deleted.',
        esEs: 'Los propietarios del workspace no pueden ser eliminados.',
        ptBr: 'Proprietários do espaço de trabalho não podem ser excluídos.',
      },
      message: 'Workspace owners cannot be deleted.',
    });
  }

  const result = await WorkspaceUsersRepository.delete()
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
