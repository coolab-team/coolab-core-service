BEGIN;

DROP TRIGGER IF EXISTS ct_workspace_users_updated_at_auto_update ON public.workspace_users;
DROP INDEX IF EXISTS idx_workspace_users_user_id;
DROP TABLE IF EXISTS public.workspace_users;

DROP TRIGGER IF EXISTS ct_workspaces_updated_at_auto_update ON public.workspaces;
DROP TABLE IF EXISTS public.workspaces;

COMMIT;
