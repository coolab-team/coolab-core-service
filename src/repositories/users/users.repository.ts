import { QueryOptions, Repository } from '@self/abstractions';

class UsersRepository extends Repository<'users'> {
  constructor() {
    super({
      table: 'users',
    });
  }

  public selectByEmail(email: string, options?: QueryOptions) {
    const query = this.select(options)
      .selectAll()
      .where('users.email', '=', email);
    return query;
  }

  public touchLastAuthenticationAt(params: {
    id: string;
    lastAuthenticationAt: Date;
  }, options?: QueryOptions) {
    const query = this.update({
      lastAuthenticationAt: params.lastAuthenticationAt,
    }, options)
      .where('users.id', '=', params.id);
    return query;
  }
}

const repository = new UsersRepository();

export { repository as UsersRepository };
