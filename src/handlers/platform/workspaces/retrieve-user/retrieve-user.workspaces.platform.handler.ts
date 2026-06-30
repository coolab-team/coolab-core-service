import { app } from '@self/app';
import { retrieveUserWorkspacesApplication } from '@self/application';
import { PlatformContext } from '@self/contexts';
import { RoutingUtil } from '@self/utils';
import { validation } from '@self/validation';

const handler = app.openapi(RoutingUtil.route({
  description: 'Retrieves the current user in the current workspace.',
  method: 'get',
  middleware: PlatformContext.middleware(),
  path: RoutingUtil.path('/platform/v1/workspaces/{id}/users/{userId}'),
  request: {
    params: validation().object({
      id: validation().literal('current'),
      userId: validation().literal('me'),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: validation().tables().workspaceUsers().selectable().extend({
            permissions: validation().object({
              workspaceManagement: validation().boolean(),
            }),
          }),
        },
      },
      description: 'The current workspace user.',
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
    404: {
      content: {
        'application/json': {
          schema: validation().exception(),
        },
      },
      description: 'The workspace user was not found.',
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
  const user = PlatformContext.getUser();
  const workspace = PlatformContext.getWorkspace();

  const result = await retrieveUserWorkspacesApplication({
    permissions: workspace.permissions,
    userId: user.id,
    workspaceId: workspace.id,
  });

  const response = c.json(result, 200);
  return response;
});

export { handler as retrieveUserWorkspacesPlatformHandler };
