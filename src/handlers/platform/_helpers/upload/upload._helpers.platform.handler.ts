import { app } from '@self/app';
import { uploadHelpersApplication } from '@self/application';
import { PlatformContext } from '@self/contexts';
import { RoutingUtil } from '@self/utils';
import { validation } from '@self/validation';

const handler = app.openapi(RoutingUtil.route({
  description: 'Uploads a PNG file to ephemeral storage.',
  method: 'post',
  middleware: PlatformContext.middleware(),
  path: RoutingUtil.path('/platform/v1/_helpers/upload'),
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: validation().object({
            file: validation().file().max(1024 * 1024).mime('image/png').openapi({
              format: 'binary',
              type: 'string',
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: validation().object({
            path: validation().string(),
            url: validation().url(),
          }),
        },
      },
      description: 'The uploaded file path and signed URL.',
    },
    400: {
      content: {
        'application/json': {
          schema: validation().exception(),
        },
      },
      description: 'The request is invalid.',
    },
    401: {
      content: {
        'application/json': {
          schema: validation().exception(),
        },
      },
      description: 'The request is not authenticated.',
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
  tags: ['Helpers'],
}), async c => {
  const body = c.req.valid('form');
  const buffer = Buffer.from(await body.file.arrayBuffer());

  const result = await uploadHelpersApplication({ buffer });
  const response = c.json(result, 200);
  return response;
});

export { handler as uploadHelpersPlatformHandler };
