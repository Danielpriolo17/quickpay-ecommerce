"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapOrThrowHttp = unwrapOrThrowHttp;
const common_1 = require("@nestjs/common");
function unwrapOrThrowHttp(result) {
    if (result.isFail) {
        throw new common_1.HttpException({
            statusCode: result.error.httpStatus,
            code: result.error.code,
            message: result.error.message,
            ...(result.error.details ? { details: result.error.details } : {}),
        }, result.error.httpStatus);
    }
    return result.value;
}
//# sourceMappingURL=result-to-http.helper.js.map