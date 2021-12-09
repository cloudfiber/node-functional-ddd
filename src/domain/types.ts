export type ValueObject = Readonly<Record<string, unknown>>;

export type Entity<T> = Readonly<{
  readonly id: T;
}>;

export type AggregateRoot<T> = Entity<T>;
