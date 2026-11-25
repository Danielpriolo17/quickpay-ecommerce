"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
class Product {
    constructor(props) {
        this.props = props;
    }
    get id() {
        return this.props.id;
    }
    get name() {
        return this.props.name;
    }
    get description() {
        return this.props.description;
    }
    get priceInCents() {
        return this.props.priceInCents;
    }
    get stock() {
        return this.props.stock;
    }
    get imageUrl() {
        return this.props.imageUrl;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    hasSufficientStock(quantity) {
        return quantity > 0 && this.props.stock >= quantity;
    }
    calculateSubtotalInCents(quantity) {
        return this.props.priceInCents * quantity;
    }
    toJSON() {
        return { ...this.props };
    }
}
exports.Product = Product;
//# sourceMappingURL=product.entity.js.map