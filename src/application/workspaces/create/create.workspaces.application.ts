import { connection } from '@self/database';
import { PlatformEncryption } from '@self/encryptions';
import { ForbiddenException } from '@self/exceptions';
import { WorkspacesRepository, WorkspaceUsersRepository } from '@self/repositories';
import { WorkspacesService } from '@self/services';

type Params = {
  name: string;
  picture?: string | null;
  userId: string;
};

export const createWorkspacesApplication = async (params: Params) => {
  const workspace = await connection.transaction().execute(async transaction => {
    let picture: string | null = null;

    if(params.picture) {
      const decrypted = PlatformEncryption.decryptUploadPath(params.picture);

      if(decrypted.content.userId !== params.userId) {
        throw new ForbiddenException({
          feedback: {
            enUs: 'The upload belongs to another user.',
            esEs: 'La carga pertenece a otro usuario.',
            ptBr: 'O upload pertence a outro usuário.',
          },
          message: 'Forbidden upload path.',
        });
      }

      picture = await WorkspacesService.copyPicture(decrypted.content.path);
    }

    const created = await WorkspacesRepository.insert({
      name: params.name,
      picture,
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

  const mapped = await WorkspacesService.ensurePictureUrl(workspace);

  return mapped;
};
