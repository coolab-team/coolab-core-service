import { QueryOptions, Repository } from '@self/abstractions';

class WorkspaceUsersRepository extends Repository<'workspaceUsers'> {
  constructor() {
    super({
      table: 'workspaceUsers',
    });
  }

  public selectByWorkspaceIdAndUserId(params: {
    userId: string;
    workspaceId: string;
  }, options?: QueryOptions) {
    const query = this.select(options)
      .selectAll()
      .where('workspaceUsers.workspaceId', '=', params.workspaceId)
      .where('workspaceUsers.userId', '=', params.userId);

    return query;
  }
}

const repository = new WorkspaceUsersRepository();

export { repository as WorkspaceUsersRepository };
