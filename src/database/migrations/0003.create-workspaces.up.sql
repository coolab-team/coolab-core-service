BEGIN;

CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  picture VARCHAR NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER ct_workspaces_updated_at_auto_update
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime('updated_at');

CREATE TABLE IF NOT EXISTS public.workspace_users (
  workspace_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_workspace_users PRIMARY KEY (workspace_id, user_id),
  CONSTRAINT fk_workspace_users_workspace_id FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_workspace_users_user_id FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT ck_workspace_users_role CHECK (role IN ('owner', 'admin', 'member'))
);

CREATE TRIGGER ct_workspace_users_updated_at_auto_update
  BEFORE UPDATE ON public.workspace_users
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime('updated_at');

CREATE INDEX IF NOT EXISTS idx_workspace_users_user_id ON public.workspace_users(user_id);

COMMIT;
