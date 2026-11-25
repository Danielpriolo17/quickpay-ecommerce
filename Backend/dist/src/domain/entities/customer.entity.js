"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Customer = void 0;
class Customer {
    constructor(props) {
        this.props = props;
    }
    get id() {
        return this.props.id;
    }
    get fullName() {
        return this.props.fullName;
    }
    get email() {
        return this.props.email;
    }
    get phone() {
        return this.props.phone;
    }
    toJSON() {
        return { ...this.props };
    }
}
exports.Customer = Customer;
//# sourceMappingURL=customer.entity.js.map