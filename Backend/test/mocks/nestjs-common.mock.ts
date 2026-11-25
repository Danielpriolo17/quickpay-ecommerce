const noopDecorator = () => () => undefined;

export const Injectable = noopDecorator;
export const Inject = noopDecorator;
export const Controller = noopDecorator;
export const Get = noopDecorator;
export const Post = noopDecorator;
export const Patch = noopDecorator;
export const Delete = noopDecorator;
export const Body = noopDecorator;
export const Param = noopDecorator;
export const Query = noopDecorator;
export const HttpCode = noopDecorator;
export const ParseUUIDPipe = class {};

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
};

export class HttpException extends Error {
  constructor(
    private readonly response: string | Record<string, unknown>,
    private readonly status: number,
  ) {
    super(typeof response === 'string' ? response : JSON.stringify(response));
  }

  getStatus(): number {
    return this.status;
  }

  getResponse(): string | Record<string, unknown> {
    return this.response;
  }
}

export class Logger {
  log(): void {}
  error(): void {}
  warn(): void {}
  debug(): void {}
}