"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommentService {
    constructor(commentRepository) {
        this.commentRepository = commentRepository;
    }
    async createComment(data) {
        return this.commentRepository.createComment(data);
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
