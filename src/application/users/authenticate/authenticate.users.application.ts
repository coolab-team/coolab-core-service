import { PlatformEncryption } from '@self/encryptions';
import { NotFoundException, UnauthorizedException } from '@self/exceptions';
import { UsersRepository } from '@self/repositories';

type Params = {
  token: string;
};

const authenticationTokenTtlMs = 1000 * 60 * 60;

export const authenticateUsersApplication = async (params: Params) => {

  let decrypted: ReturnType<typeof PlatformEncryption.decryptAuthenticationToken>;

  try {
    decrypted = PlatformEncryption.decryptAuthenticationToken(params.token);
  } catch {
    throw new UnauthorizedException({
      feedback: {
        enUs: 'Invalid authentication token. Please request a new authentication link.',
        esEs: 'Token de autenticación inválido. Por favor, solicita un nuevo enlace de autenticación.',
        ptBr: 'Token de autenticação inválido. Por favor, solicite um novo link de autenticação.',
      },
      message: 'Invalid token.',
    });
  }

  if(decrypted.createdAt < new Date(Date.now() - authenticationTokenTtlMs)) {
    throw new UnauthorizedException({
      feedback: {
        enUs: 'Your authentication token has expired. Please request a new authentication link.',
        esEs: 'Tu token de autenticación expiró. Por favor, solicita un nuevo enlace de autenticación.',
        ptBr: 'Seu token de autenticação expirou. Por favor, solicite um novo link de autenticação.',
      },
      message: 'The token has expired.',
    });
  }

  const user = await UsersRepository.selectById(decrypted.content.id)
    .selectAll()
    .executeTakeFirst();

  if(!user) {
    throw new NotFoundException({
      feedback: {
        enUs: 'The requested user could not be found.',
        esEs: 'No se pudo encontrar el usuario solicitado.',
        ptBr: 'O usuário solicitado não foi encontrado.',
      },
      message: 'The user was not found.',
    });
  }

  if(user.email !== decrypted.content.email) {
    throw new UnauthorizedException({
      feedback: {
        enUs: 'Invalid authentication token. Please request a new authentication link.',
        esEs: 'Token de autenticación inválido. Por favor, solicita un nuevo enlace de autenticación.',
        ptBr: 'Token de autenticação inválido. Por favor, solicite um novo link de autenticação.',
      },
      message: 'Invalid token.',
    });
  }

  const lastAuthenticationAt = new Date();

  await UsersRepository.update({
    emailStatus: 'verified',
    lastAuthenticationAt,
  })
    .where('id', '=', user.id)
    .executeTakeFirstOrThrow();

  const accessToken = PlatformEncryption.encryptAccessToken({
    email: user.email,
    id: user.id,
  });

  return {
    accessToken,
  };
};
