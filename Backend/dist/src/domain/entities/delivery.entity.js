"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delivery = void 0;
class Delivery {
    constructor(props) {
        this.props = props;
    }
    get id() {
        return this.props.id;
    }
    get transactionId() {
        return this.props.transactionId;
    }
    get customerId() {
        return this.props.customerId;
    }
    get status() {
        return this.props.status;
    }
    toJSON() {
        return { ...this.props };
    }
}
exports.Delivery = Delivery;
//# sourceMappingURL=delivery.entity.js.map