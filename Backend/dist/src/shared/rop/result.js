"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fail = exports.ok = exports.Fail = exports.Ok = void 0;
class Ok {
    constructor(value) {
        this.value = value;
        this.isOk = true;
        this.isFail = false;
    }
    map(fn) {
        return (0, exports.ok)(fn(this.value));
    }
    flatMap(fn) {
        return fn(this.value);
    }
    async flatMapAsync(fn) {
        return fn(this.value);
    }
}
exports.Ok = Ok;
class Fail {
    constructor(error) {
        this.error = error;
        this.isOk = false;
        this.isFail = true;
    }
    map(_fn) {
        return (0, exports.fail)(this.error);
    }
    flatMap(_fn) {
        return (0, exports.fail)(this.error);
    }
    async flatMapAsync(_fn) {
        return (0, exports.fail)(this.error);
    }
}
exports.Fail = Fail;
const ok = (value) => new Ok(value);
exports.ok = ok;
const fail = (error) => new Fail(error);
exports.fail = fail;
//# sourceMappingURL=result.js.map