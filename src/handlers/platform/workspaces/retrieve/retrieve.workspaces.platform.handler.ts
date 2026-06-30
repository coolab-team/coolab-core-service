import { app } from '@self/app';
import { PlatformContext } from '@self/contexts';
import { RoutingUtil } from '@self/utils';
import { validation } from '@self/validation';

const handler = app.openapi(RoutingUtil.route({
  description: 'Retrieves the current workspace.',
  method: 'get',
  middleware: PlatformContext.middleware(),
  path: RoutingUtil.path('/platform/v1/workspaces/{id}'),
  request: {
    params: validation().object({
      id: validation().literal('current'),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: validation().tables().workspaces().selectable().extend({
            permissions: validation().object({
              workspaceManagement: validation().boolean(),
            }),
            role: validation().tables().workspaceUsers().role(),
          }),
        },
      },
      description: 'The current workspace.',
    },
    401: {
      content: {
        'application/json': {
          schema: validation().exception(),
        },
      },
      description: 'The request is not authenticated.',
    },
    403: {
      content: {
        'application/json': {
          schema: validation().exception(),
        },
      },
      description: 'The request is not authorized for a workspace.',
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
  tags: ['Workspaces'],
}), async c => {
  const workspace = PlatformContext.getWorkspace();

  const response = c.json(workspace, 200);
  return response;
});

export { handler as retrieveWorkspacesPlatformHandler };
