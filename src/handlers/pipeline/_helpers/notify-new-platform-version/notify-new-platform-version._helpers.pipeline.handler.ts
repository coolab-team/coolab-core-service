import { app } from '@self/app';
import { notifyNewPlatformVersionHelpersApplication } from '@self/application';
import { PipelineContext } from '@self/contexts';
import { RoutingUtil } from '@self/utils';
import { validation } from '@self/validation';

const handler = app.openapi(RoutingUtil.route({
  description: 'Notifies connected platform users that a new version is available.',
  method: 'post',
  middleware: PipelineContext.middleware(),
  path: RoutingUtil.path('/pipeline/v1/_helpers/notify-new-platform-version'),
  responses: {
    200: {
      content: {
        'application/json': {
          schema: validation().object({
            id: validation().id(),
            timestamp: validation().number(),
          }),
        },
      },
      description: 'Platform version notification sent.',
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
  const result = await notifyNewPlatformVersionHelpersApplication();
  const response = c.json(result, 200);
  return response;
});

export { handler as notifyNewPlatformVersionHelpersPipelineHandler };
