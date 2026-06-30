import { app } from '@self/app';
import { deleteUserWorkspacesApplication } from '@self/application';
import { PlatformContext } from '@self/contexts';
import { ForbiddenException } from '@self/exceptions';
import { RoutingUtil } from '@self/utils';
import { validation } from '@self/validation';

const handler = app.openapi(RoutingUtil.route({
  description: 'Deletes a user from the current workspace.',
  method: 'delete',
  middleware: PlatformContext.middleware(),
  path: RoutingUtil.path('/platform/v1/workspaces/{id}/users/{userId}'),
  request: {
    params: validation().object({
      id: validation().literal('current'),
      userId: validation().id(),
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: validation().tables().workspaceUsers().selectable(),
        },
      },
      description: 'The workspace user was deleted.',
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
      description: 'The user is not authorized to delete workspace users.',
    },
    404: {
      content: {
        'application/json': {
          schema: validation().exception(),
        },
      },
      description: 'The workspace user was not found.',
    },
    412: {
      content: {
        'application/json': {
          schema: validation().exception(),
        },
      },
      description: 'The workspace user cannot be deleted.',
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
  const params = c.req.valid('param');
  const isSelfRemoval = params.userId === user.id;

  if(!isSelfRemoval && !workspace.permissions.workspaceManagement) {
    throw new ForbiddenException({
      feedback: {
        enUs: 'You do not have permission to delete workspace users.',
        esEs: 'No tienes permiso para eliminar usuarios del workspace.',
        ptBr: 'Você não tem permissão para excluir usuários do espaço de trabalho.',
      },
      message: 'The user is not authorized to delete workspace users.',
    });
  }

  const result = await deleteUserWorkspacesApplication({
    userId: params.userId,
    workspaceId: workspace.id,
  });

  const response = c.json(result, 200);
  return response;
});

export { handler as deleteUserWorkspacesPlatformHandler };
