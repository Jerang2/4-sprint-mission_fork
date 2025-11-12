"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProductService {
    constructor(productRepository, likeRepository, notificationService) {
        this.productRepository = productRepository;
        this.likeRepository = likeRepository;
        this.notificationService = notificationService;
    }
    async createProduct(data) {
        const { userId, ...rest } = data;
        return this.productRepository.createProduct({
            ...rest,
            user: { connect: { id: userId } },
        });
    }
    async getProductById(id) {
        return this.productRepository.findProductById(id);
    }
    async getProducts(options) {
        return this.productRepository.findProducts(options);
    }
    async updateProduct(id, data, userId) {
        const originalProduct = await this.productRepository.findProductById(id);
        if (!originalProduct) {
            throw new Error('Product not found');
        }
        if (originalProduct.userId !== userId) {
            throw new Error('You do not have permission to update this product.');
        }
        const { description, ...restOfData } = data;
        const updateData = { ...restOfData };
        if (description) {
            updateData.content = description;
        }
        const updatedProduct = await this.productRepository.updateProduct(id, updateData);
        if (data.price && originalProduct.price !== updatedProduct.price) {
            const likes = await this.likeRepository.findLikes({ where: { productId: id } });
            for (const like of likes) {
                // Skip notification for the user who updated the product
                if (like.userId === userId) {
                    continue;
                }
                const message = `'${originalProduct.name}' 상품의 가격이 ${originalProduct.price}원에서 ${updatedProduct.price}원으로 변경되었습니다.`;
                await this.notificationService.create(like.userId, 'PRICE_CHANGE', message, id);
            }
        }
        return updatedProduct;
    }
    async deleteProduct(id) {
        return this.productRepository.deleteProduct(id);
    }
}
exports.default = ProductService;
