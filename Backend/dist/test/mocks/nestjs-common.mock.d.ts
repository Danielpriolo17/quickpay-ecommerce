export declare const Injectable: () => () => undefined;
export declare const Inject: () => () => undefined;
export declare const Controller: () => () => undefined;
export declare const Get: () => () => undefined;
export declare const Post: () => () => undefined;
export declare const Patch: () => () => undefined;
export declare const Delete: () => () => undefined;
export declare const Body: () => () => undefined;
export declare const Param: () => () => undefined;
export declare const Query: () => () => undefined;
export declare const HttpCode: () => () => undefined;
export declare const ParseUUIDPipe: {
    new (): {};
};
export declare const HttpStatus: {
    OK: number;
    CREATED: number;
    BAD_REQUEST: number;
    NOT_FOUND: number;
    CONFLICT: number;
    INTERNAL_SERVER_ERROR: number;
    BAD_GATEWAY: number;
};
export declare class HttpException extends Error {
    private readonly response;
    private readonly status;
    constructor(response: string | Record<string, unknown>, status: number);
    getStatus(): number;
    getResponse(): string | Record<string, unknown>;
}
export declare class Logger {
    log(): void;
    error(): void;
    warn(): void;
    debug(): void;
}
