"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
class Transaction {
    constructor(props) {
        this.props = props;
    }
    get id() {
        return this.props.id;
    }
    get reference() {
        return this.props.reference;
    }
    get productId() {
        return this.props.productId;
    }
    get customerId() {
        return this.props.customerId;
    }
    get quantity() {
        return this.props.quantity;
    }
    get totalInCents() {
        return this.props.totalInCents;
    }
    get status() {
        return this.props.status;
    }
    get externalTransactionId() {
        return this.props.externalTransactionId;
    }
    isPending() {
        return this.props.status === 'PENDING';
    }
    isApproved() {
        return this.props.status === 'APPROVED';
    }
    toJSON() {
        return { ...this.props };
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.entity.js.map