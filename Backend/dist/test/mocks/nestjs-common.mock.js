"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.HttpException = exports.HttpStatus = exports.ParseUUIDPipe = exports.HttpCode = exports.Query = exports.Param = exports.Body = exports.Delete = exports.Patch = exports.Post = exports.Get = exports.Controller = exports.Inject = exports.Injectable = void 0;
const noopDecorator = () => () => undefined;
exports.Injectable = noopDecorator;
exports.Inject = noopDecorator;
exports.Controller = noopDecorator;
exports.Get = noopDecorator;
exports.Post = noopDecorator;
exports.Patch = noopDecorator;
exports.Delete = noopDecorator;
exports.Body = noopDecorator;
exports.Param = noopDecorator;
exports.Query = noopDecorator;
exports.HttpCode = noopDecorator;
const ParseUUIDPipe = class {
};
exports.ParseUUIDPipe = ParseUUIDPipe;
exports.HttpStatus = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
};
class HttpException extends Error {
    constructor(response, status) {
        super(typeof response === 'string' ? response : JSON.stringify(response));
        this.response = response;
        this.status = status;
    }
    getStatus() {
        return this.status;
    }
    getResponse() {
        return this.response;
    }
}
exports.HttpException = HttpException;
class Logger {
    log() { }
    error() { }
    warn() { }
    debug() { }
}
exports.Logger = Logger;
//# sourceMappingURL=nestjs-common.mock.js.map