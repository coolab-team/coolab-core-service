import { app } from '@self/app';
import { updateUserWorkspacesApplication } from '@self/application';
import { PlatformContext } from '@self/contexts';
import { ForbiddenException, PreconditionFailedException } from '@self/exceptions';
import { RoutingUtil } from '@self/utils';
import { validation } from '@self/validation';

const handler = app.openapi(RoutingUtil.route({
  description: 'Updates a user in the current workspace.',
  method: 'patch',
  middleware: PlatformContext.middleware(),
  path: RoutingUtil.path('/platform/v1/workspaces/{id}/users/{userId}'),
  request: {
    body: {
      content: {
        'application/json': {
          schema: validation().object({
            role: validation().tables().workspaceUsers().role(),
          }),
        },
      },
    },
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
      description: 'The workspace user was updated.',
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
    403: {
      content: {
        'application/json': {
          schema: validation().exception(),
        },
      },
      description: 'The user is not authorized to update workspace users.',
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
      description: 'The workspace user cannot be updated.',
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
  const params = c.req.valid('param');
  const body = c.req.valid('json');

  if(!workspace.permissions.workspaceManagement) {
    throw new ForbiddenException({
      feedback: {
        enUs: 'You do not have permission to update workspace users.',
        esEs: 'No tienes permiso para actualizar usuarios del workspace.',
        ptBr: 'Você não tem permissão para atualizar usuários do espaço de trabalho.',
      },
      message: 'The user is not authorized to update workspace users.',
    });
  }

  if(body.role === 'owner') {
    throw new PreconditionFailedException({
      feedback: {
        enUs: 'Workspace users cannot be promoted to owner.',
        esEs: 'Los usuarios del workspace no pueden ser promovidos a propietario.',
        ptBr: 'Usuários do espaço de trabalho não podem ser promovidos a proprietário.',
      },
      message: 'Workspace users cannot be promoted to owner.',
    });
  }

  const result = await updateUserWorkspacesApplication({
    role: body.role,
    userId: params.userId,
    workspaceId: workspace.id,
  });

  const response = c.json(result, 200);
  return response;
});

export { handler as updateUserWorkspacesPlatformHandler };
