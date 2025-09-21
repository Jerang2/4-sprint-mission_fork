"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LikeService {
    constructor(likeRepository) {
        this.likeRepository = likeRepository;
    }
    async createLike(data) {
        return this.likeRepository.createLike(data);
    }
    async deleteLike(id) {
        return this.likeRepository.deleteLike(id);
    }
    async findLikeByUserIdAndProductId(userId, productId) {
        return this.likeRepository.findLikeByUserIdAndProductId(userId, productId);
    }
    async findLikeByUserIdAndArticleId(userId, articleId) {
        return this.likeRepository.findLikeByUserIdAndArticleId(userId, articleId);
    }
}
exports.default = LikeService;
