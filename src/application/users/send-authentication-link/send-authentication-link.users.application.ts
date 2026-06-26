import { PlatformEncryption } from '@self/encryptions';
import { UsersRepository } from '@self/repositories';
import { MailingService } from '@self/services';
import { validation } from '@self/validation';

type Result = {
  accessToken?: string;
  message?: string;
};

type Params = {
  email: string;
};

export const sendAuthenticationLinkUsersApplication = async (params: Params): Promise<Result> => {

  const email = validation().email().parse(params.email);

  const user = await UsersRepository.selectByEmail(email)
    .selectAll()
    .executeTakeFirst();

  if(!user) {
    const now = new Date();
    const createdUser = await UsersRepository.insert({
      email,
      emailStatus: 'verified',
      lastAuthenticationAt: now,
      name: null,
      picture: null,
    })
      .returningAll()
      .executeTakeFirstOrThrow();

    const accessToken = PlatformEncryption.encryptAccessToken({
      email: createdUser.email,
      id: createdUser.id,
    });

    return {
      accessToken,
    };
  }

  await MailingService.sendPlatformUserAuthenticationLink({
    destination: user.email,
    email: user.email,
    id: user.id,
  });

  return {
    message: 'That worked!',
  };
};
