import { app } from '@self/app';
import { retrieveMultipleWorkspacesApplication } from '@self/application';
import { PlatformContext } from '@self/contexts';
import { RoutingUtil } from '@self/utils';
import { validation } from '@self/validation';

const handler = app.openapi(RoutingUtil.route({
  description: 'Retrieves multiple workspaces.',
  method: 'get',
  middleware: PlatformContext.middleware(),
  path: RoutingUtil.path('/platform/v1/workspaces'),
  request: {
    query: validation().object({
      pageNumber: validation().pageNumber(),
      pageSize: validation().pageSize(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: validation().tables().workspaces().selectable().extend({
            role: validation().tables().workspaceUsers().role(),
          }).array(),
        },
      },
      description: 'Retrieves all workspaces for the authenticated user.',
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
  tags: ['Workspaces'],
}), async c => {
  const user = PlatformContext.getUser();
  const query = c.req.valid('query');

  const result = await retrieveMultipleWorkspacesApplication({
    pagination: {
      limit: query.pageSize,
      page: query.pageNumber,
    },
    userId: user.id,
  });

  const response = c.json(result, 200);
  return response;
});

export { handler as retrieveMultipleWorkspacesPlatformHandler };
