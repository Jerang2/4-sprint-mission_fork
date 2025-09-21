"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ArticleService {
    constructor(articleRepository) {
        this.articleRepository = articleRepository;
    }
    async createArticle(data) {
        return this.articleRepository.createArticle(data);
    }
    async getArticleById(id) {
        return this.articleRepository.findArticleById(id);
    }
    async getArticles(options) {
        return this.articleRepository.findArticles(options);
    }
    async updateArticle(id, data) {
        return this.articleRepository.updateArticle(id, data);
    }
    async deleteArticle(id) {
        return this.articleRepository.deleteArticle(id);
    }
}
exports.default = ArticleService;
