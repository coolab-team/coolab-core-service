/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  connection,
  DataBaseSchema,
  getReadConnection,
} from '@self/database';
import {
  Insertable,
  Transaction,
  Updateable,
} from 'kysely';
import pgEscape from 'pg-escape';
import z from 'zod';

export type QueryOptions = {
  transaction?: Transaction<DataBaseSchema>;
  forceWriteConnection?: boolean;
  includeRemoved?: boolean;
};

export abstract class Repository<T extends keyof DataBaseSchema> {
  private table: T;

  constructor(params: {
    table: T;
  }) {
    this.table = params.table;
  }

  public insert(
    toSet: Insertable<DataBaseSchema[T]> | Array<Insertable<DataBaseSchema[T]>>,
    options: QueryOptions = {},
  ) {
    const query = (options.transaction || connection).insertInto<T>(this.table).values(toSet);
    return query;
  }

  public update(toSet: Updateable<DataBaseSchema[T]>, options: QueryOptions = {}) {
    const query = (options.transaction || connection).updateTable(this.table);
    const set = (query as any).set(toSet); // Sad but had to.
    return set as typeof query;
  }

  public select(options: QueryOptions = {}) {
    if(options.transaction) {
      const query = options.transaction.selectFrom(this.table);
      return query;
    }

    if(options.forceWriteConnection) {
      const query = connection.selectFrom(this.table);
      return query;
    }

    const query = getReadConnection().selectFrom(this.table);
    return query;
  }

  public delete(options: QueryOptions = {}) {
    const query = (options.transaction || connection).deleteFrom(this.table);
    return query;
  }

  public selectById(id: string, options: QueryOptions = {}) {
    let conn: Transaction<DataBaseSchema> | typeof connection;

    if(options.transaction) {
      conn = options.transaction;
    } else if(options.forceWriteConnection) {
      conn = connection;
    } else {
      conn = getReadConnection();
    }

    const query = conn.selectFrom(this.table);
    const select = (query as any).where(`${this.table}.id`, '=', id);
    return select as typeof query;
  }

  public jsonUpdateValidation<T extends z.ZodType, TValue extends z.infer<T>>(params: {
    value?: TValue;
    schema: T;
  }) {
    if(!params.value) {
      return params.value;
    }

    const validated = this.jsonValidation<T>({
      schema: params.schema,
      value: params.value,
    });
    return validated;
  }

  public jsonInsertValidation<T extends z.ZodType>(params: {
    value: object | Array<object> | null | undefined;
    schema: T;
  }) {
    const validated = this.jsonValidation<T>(params);
    return validated;
  }

  public escape(value: string): string {
    const result = pgEscape.string(value);
    return result;
  }

  private jsonValidation<T extends z.ZodType>(params: {
    value: object | Array<object> | null | undefined;
    schema: T;
  }) {
    const validated = params.schema.parse(params.value);
    return validated;
  }

}
