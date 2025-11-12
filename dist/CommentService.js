"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommentService {
    constructor(commentRepository, articleRepository, notificationService) {
        this.commentRepository = commentRepository;
        this.articleRepository = articleRepository;
        this.notificationService = notificationService;
    }
    async createComment(data) {
        const { userId, productId, articleId, ...rest } = data;
        const createdComment = await this.commentRepository.createComment({
            ...rest,
            user: { connect: { id: userId } },
            ...(productId && { product: { connect: { id: productId } } }),
            ...(articleId && { article: { connect: { id: articleId } } }),
        });
        if (articleId) {
            const article = await this.articleRepository.findArticleById(articleId);
            if (article && article.userId !== userId) {
                const message = `'${article.title}' 게시글에 새로운 댓글이 달렸습니다.`;
                await this.notificationService.create(article.userId, 'NEW_COMMENT', message, articleId);
            }
        }
        return createdComment;
    }
    async getCommentById(id) {
        return this.commentRepository.findCommentById(id);
    }
    async getComments(options) {
        return this.commentRepository.findComments(options);
    }
    async updateComment(id, data) {
        return this.commentRepository.updateComment(id, data);
    }
    async deleteComment(id) {
        return this.commentRepository.deleteComment(id);
    }
}
exports.default = CommentService;
