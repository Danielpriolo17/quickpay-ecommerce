export type Result<T, E> = Ok<T, E> | Fail<T, E>;

export class Ok<T, E> {
  readonly isOk = true as const;
  readonly isFail = false as const;

  constructor(readonly value: T) {}

  map<U>(fn: (value: T) => U): Result<U, E> {
    return ok(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  async flatMapAsync<U>(
    fn: (value: T) => Promise<Result<U, E>>,
  ): Promise<Result<U, E>> {
    return fn(this.value);
  }
}

export class Fail<T, E> {
  readonly isOk = false as const;
  readonly isFail = true as const;

  constructor(readonly error: E) {}

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return fail(this.error);
  }

  flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return fail(this.error);
  }

  async flatMapAsync<U>(
    _fn: (value: T) => Promise<Result<U, E>>,
  ): Promise<Result<U, E>> {
    return fail(this.error);
  }
}

export const ok = <T, E = never>(value: T): Result<T, E> => new Ok(value);
export const fail = <T = never, E = unknown>(error: E): Result<T, E> =>
  new Fail(error);