import { app } from '@self/app';
import { sendAuthenticationLinkUsersApplication } from '@self/application';
import { routing } from '@self/utils';
import { validation } from '@self/validation';

const handler = app.openapi(routing().route({
  description: 'Sends an authentication link to a user.',
  method: 'post',
  path: routing().path('/platform/v1/users/send-authentication-link'),
  request: {
    body: {
      content: {
        'application/json': {
          schema: validation().object({
            email: validation().email(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: validation().union([
            validation().object({
              accessToken: validation().string(),
            }),
            validation().empty(),
          ]),
        },
      },
      description: 'The authentication link was sent to the user or a new user access token was generated.',
    },
    400: {
      content: {
        'application/json': {
          schema: validation().exception(),
        },
      },
      description: 'The request is invalid.',
    },
    500: {
      content: {
        'application/json': {
          schema: validation().exception(),
        },
      },
      description: 'An unexpected error occurred.',
    },
  },
  tags: ['Users'],
}), async c => {

  const body = c.req.valid('json');

  const result = await sendAuthenticationLinkUsersApplication({
    email: body.email,
  });

  if(result.accessToken) {
    return c.json({
      accessToken: result.accessToken,
    }, 200);
  }

  return c.json({
    message: result.message ?? 'That worked!',
  }, 200);
});

export { handler as sendAuthenticationLinkUsersPlatformHandler };
