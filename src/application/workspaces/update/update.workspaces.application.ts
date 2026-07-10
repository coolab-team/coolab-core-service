import { PlatformEncryption } from '@self/encryptions';
import { ForbiddenException, NotFoundException } from '@self/exceptions';
import { MemoizationMemory } from '@self/memories';
import { WorkspacesRepository } from '@self/repositories';
import { WorkspacesService } from '@self/services';

type Params = {
  id: string;
  name?: string;
  picture?: string | null;
  userId: string;
};

export const updateWorkspacesApplication = async (params: Params) => {
  const { id, picture: receivedPicture, userId, ...rest } = params;

  const workspace = await WorkspacesRepository.selectById(id)
    .selectAll()
    .executeTakeFirst();

  if(!workspace) {
    throw new NotFoundException({
      feedback: {
        enUs: 'The workspace was not found.',
        esEs: 'El workspace no fue encontrado.',
        ptBr: 'O workspace não foi encontrado.',
      },
      message: 'The workspace was not found.',
    });
  }

  let picture = workspace.picture;
  let nextPicture: string | null | undefined = receivedPicture;

  if(receivedPicture) {
    const decrypted = PlatformEncryption.decryptUploadPath(receivedPicture);

    if(decrypted.content.userId !== userId) {
      throw new ForbiddenException({
        feedback: {
          enUs: 'The upload belongs to another user.',
          esEs: 'La carga pertenece a otro usuario.',
          ptBr: 'O upload pertence a outro usuário.',
        },
        message: 'Forbidden upload path.',
      });
    }

    nextPicture = decrypted.content.path;
  }

  const hasChangedPicture = nextPicture !== undefined && nextPicture !== workspace.picture;

  if(nextPicture && hasChangedPicture) {
    picture = await WorkspacesService.copyPicture(nextPicture);
  }

  if(receivedPicture === null && hasChangedPicture) {
    picture = null;
  }

  const toUpdate = {
    ...rest,
    ...(hasChangedPicture ? { picture } : {}),
  };

  const result = await WorkspacesRepository.update(toUpdate)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();

  if(!result) {
    throw new NotFoundException({
      feedback: {
        enUs: 'The workspace was not found.',
        esEs: 'El workspace no fue encontrado.',
        ptBr: 'O workspace não foi encontrado.',
      },
      message: 'The workspace was not found.',
    });
  }

  if(hasChangedPicture && workspace.picture) {
    await WorkspacesService.deletePicture(workspace.picture);
  }

  await MemoizationMemory.purge(`memo:user-workspace-in-platform-context:${userId}:${id}`);

  const mapped = await WorkspacesService.ensurePictureUrl(result);

  return mapped;
};
