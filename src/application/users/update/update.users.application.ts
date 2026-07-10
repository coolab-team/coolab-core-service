import { PlatformEncryption } from '@self/encryptions';
import { ForbiddenException, NotFoundException } from '@self/exceptions';
import { MemoizationMemory } from '@self/memories';
import { UsersRepository } from '@self/repositories';
import { UsersService } from '@self/services';

type Params = {
  id: string;
  name?: string | null;
  picture?: string | null;
};

export const updateUsersApplication = async (params: Params) => {

  const { id, picture: receivedPicture, ...rest } = params;

  const user = await UsersRepository.selectById(id)
    .selectAll()
    .executeTakeFirst();

  if(!user) {
    throw new NotFoundException({
      feedback: {
        enUs: 'The user was not found.',
        esEs: 'El usuario no fue encontrado.',
        ptBr: 'O usuário não foi encontrado.',
      },
      message: 'The user was not found.',
    });
  }

  let picture = user.picture;
  let nextPicture: string | null | undefined = receivedPicture;

  if(receivedPicture) {
    const decrypted = PlatformEncryption.decryptUploadPath(receivedPicture);

    if(decrypted.content.userId !== params.id) {
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

  const hasChangedPicture = nextPicture !== undefined && nextPicture !== user.picture;

  if(nextPicture && hasChangedPicture) {
    picture = await UsersService.copyPicture(nextPicture);
  }

  if(receivedPicture === null && hasChangedPicture) {
    picture = null;
  }

  const toUpdate = {
    ...rest,
    ...(hasChangedPicture ? { picture } : {}),
  };

  const result = await UsersRepository.update(toUpdate)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();

  if(!result) {
    throw new NotFoundException({
      feedback: {
        enUs: 'The user was not found.',
        esEs: 'El usuario no fue encontrado.',
        ptBr: 'O usuário não foi encontrado.',
      },
      message: 'The user was not found.',
    });
  }

  if(hasChangedPicture && user.picture) {
    await UsersService.deletePicture(user.picture);
  }

  await MemoizationMemory.purge(`memo:user-in-platform-context:${id}`);

  const mapped = await UsersService.ensurePictureUrl(result);

  return mapped;
};
