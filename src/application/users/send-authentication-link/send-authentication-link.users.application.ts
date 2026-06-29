import { env } from '@self/consts';
import { PlatformEncryption } from '@self/encryptions';
import { UsersRepository } from '@self/repositories';
import { MailingService } from '@self/services';

type Result = {
  authenticationToken: string;
} | void;

type Params = {
  email: string;
  origin: string;
};

export const sendAuthenticationLinkUsersApplication = async (params: Params): Promise<Result> => {

  let user = await UsersRepository.selectByEmail(params.email)
    .selectAll()
    .executeTakeFirst();

  let isNewUser = false;
  if(!user) {
    const now = new Date();
    user = await UsersRepository.insert({
      email: params.email,
      emailStatus: 'verified',
      lastAuthenticationAt: now,
      name: null,
      picture: null,
    })
      .returningAll()
      .executeTakeFirstOrThrow();

    isNewUser = true;
  }

  if(isNewUser || env.NODE_ENV !== 'production') {
    const authenticationToken = PlatformEncryption.encryptAuthenticationToken({
      email: user.email,
      id: user.id,
    });

    return {
      authenticationToken,
    };
  }

  await MailingService.sendPlatformUserAuthenticationLink({
    destination: user.email,
    email: user.email,
    id: user.id,
    origin: params.origin,
  });

  return;
};
