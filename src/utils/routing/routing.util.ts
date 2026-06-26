import { createRoute } from '@hono/zod-openapi';

type Version = 'v1';
type Client = 'platform';
type Resource = 'auth' | 'users';
type Param = `{${string}}`;
type Action = string;

type Path =
  | `/${Client}/${Version}/${Resource}`
  | `/${Client}/${Version}/${Resource}/${Param}`
  | `/${Client}/${Version}/${Resource}/${Action}`;

const path = <T extends Path>(value: T): T => value;

const route: typeof createRoute = config => {
  if(config.request?.body) {
    config.request.body.required = true;
  }

  return createRoute(config);
};

export const routing = () => ({
  path,
  route,
});
