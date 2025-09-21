"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async createProduct(data) {
        return this.productRepository.createProduct(data);
    }
    async getProductById(id) {
        return this.productRepository.findProductById(id);
    }
    async getProducts(options) {
        return this.productRepository.findProducts(options);
    }
    async updateProduct(id, data) {
        return this.productRepository.updateProduct(id, data);
    }
    async deleteProduct(id) {
        return this.productRepository.deleteProduct(id);
    }
}
exports.default = ProductService;
