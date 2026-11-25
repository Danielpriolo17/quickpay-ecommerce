export type Result<T, E> = Ok<T, E> | Fail<T, E>;
export declare class Ok<T, E> {
    readonly value: T;
    readonly isOk: true;
    readonly isFail: false;
    constructor(value: T);
    map<U>(fn: (value: T) => U): Result<U, E>;
    flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
    flatMapAsync<U>(fn: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>>;
}
export declare class Fail<T, E> {
    readonly error: E;
    readonly isOk: false;
    readonly isFail: true;
    constructor(error: E);
    map<U>(_fn: (value: T) => U): Result<U, E>;
    flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E>;
    flatMapAsync<U>(_fn: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>>;
}
export declare const ok: <T, E = never>(value: T) => Result<T, E>;
export declare const fail: <T = never, E = unknown>(error: E) => Result<T, E>;
