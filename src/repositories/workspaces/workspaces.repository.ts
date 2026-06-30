import { Repository } from '@self/abstractions';

class WorkspacesRepository extends Repository<'workspaces'> {
  constructor() {
    super({
      table: 'workspaces',
    });
  }
}

const repository = new WorkspacesRepository();

export { repository as WorkspacesRepository };
