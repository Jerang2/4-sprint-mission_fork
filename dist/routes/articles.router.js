"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = __importDefault(require("../index")); // Import prisma from index.ts
const validation_middleware_1 = require("../middlewares/validation.middleware");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const optionalAuth_middleware_1 = __importDefault(require("../middlewares/optionalAuth.middleware"));
const router = (0, express_1.Router)();
//article registration 
router
    .route('/articles')
    .post(auth_middleware_1.default, validation_middleware_1.validateArticle, async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        const article = await index_1.default.article.create({ data: {
                title,
                content,
                userId: user.id,
            }
        });
        res.status(201).json(article);
    }
    catch (error) {
        next(error);
    }
})
    // 게시글 목록 조회
    .get(optionalAuth_middleware_1.default, async (req, res, next) => {
    try {
        const { sort, search } = req.query;
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let offset = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { content: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const user = req.user;
        const articles = await index_1.default.article.findMany({
            where,
            select: { id: true, title: true, content: true, createdAt: true, userId: true },
            orderBy: sort === 'recent' ? { createdAt: 'desc' } : undefined,
            skip: offset,
            take: limit,
        });
        let responseArticles = articles;
        if (user) {
            const articleIds = articles.map(article => article.id);
            const likes = await index_1.default.like.findMany({
                where: {
                    userId: user.id,
                    articleId: { in: articleIds },
                },
            });
            const likedArticleIds = new Set(likes.map(like => like.articleId));
            responseArticles = articles.map(article => ({
                ...article,
                isLiked: likedArticleIds.has(article.id),
            }));
        }
        else {
            responseArticles = articles.map(article => ({
                ...article,
                isLiked: false,
            }));
        }
        res.status(200).json(responseArticles);
    }
    catch (error) {
        next(error);
    }
});
// article detail, modify, delete
router
    .route('/articles/:articleId')
    .get(optionalAuth_middleware_1.default, async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const user = req.user;
        const article = await index_1.default.article.findUnique({
            where: { id: parseInt(articleId) },
            select: { id: true, title: true, content: true, createdAt: true, userId: true },
        });
        if (!article) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
        let isLiked = false;
        if (user) {
            const like = await index_1.default.like.findFirst({
                where: {
                    articleId: article.id,
                    userId: user.id,
                },
            });
            if (like) {
                isLiked = true;
            }
        }
        const responseArticle = { ...article, isLiked };
        res.status(200).json(responseArticle);
    }
    catch (error) {
        next(error);
    }
})
    .patch(auth_middleware_1.default, validation_middleware_1.validateArticle, async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { title, content } = req.body;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        // 게시글 소유 확인
        const article = await index_1.default.article.findUnique({ where: { id: parseInt(articleId) } });
        if (!article || article.userId !== user.id) {
            return res.status(403).json({ message: '게시글 수정 권한이 없습니다.' });
        }
        const updatedArticle = await index_1.default.article.update({
            where: { id: parseInt(articleId) },
            data: { title, content },
        });
        res.status(200).json(updatedArticle);
    }
    catch (error) {
        next(error);
    }
})
    .delete(auth_middleware_1.default, async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        const article = await index_1.default.article.findUnique({ where: { id: parseInt(articleId) } });
        if (!article || article.userId !== user.id) {
            return res.status(403).json({ message: '게시글 삭제 권한이 없습니다.' });
        }
        await index_1.default.article.delete({ where: { id: parseInt(articleId) } });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// article comment creation 
router.post('/articles/:articleId/comments', auth_middleware_1.default, async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { content } = req.body;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        if (!content)
            return res.status(400).json({ message: '댓글을 입력해주세요.' });
        const newComment = await index_1.default.comment.create({
            data: {
                content,
                articleId: parseInt(articleId),
                userId: user.id,
            },
        });
        res.status(201).json(newComment);
    }
    catch (error) {
        next(error);
    }
});
// article comments check
router.get('/articles/:articleId/comments', async (req, res, next) => {
    try {
        const { articleId } = req.params;
        let cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
        let limit = parseInt(req.query.limit) || 10;
        const comments = await index_1.default.comment.findMany({
            where: { articleId: parseInt(articleId) },
            select: { id: true, content: true, createdAt: true, userId: true },
            orderBy: { createdAt: 'desc' },
            cursor: cursor ? { id: cursor } : undefined,
            take: limit,
            skip: cursor ? 1 : 0,
        });
        res.status(200).json(comments);
    }
    catch (error) {
        next(error);
    }
});
//article comment modify
router.patch('/articles/comments/:commentId', auth_middleware_1.default, async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        if (!content)
            return res.status(400).json({ message: '수정할 내용을 입력하세요.' });
        const comment = await index_1.default.comment.findUnique({ where: { id: parseInt(commentId) } });
        if (!comment || comment.userId !== user.id) {
            return res.status(403).json({ message: '댓글 수정 권한이 없습니다.' });
        }
        const updatedComment = await index_1.default.comment.update({
            where: { id: parseInt(commentId) },
            data: { content },
        });
        res.status(200).json(updatedComment);
    }
    catch (error) {
        next(error);
    }
});
//article comment delete
router.delete('/articles/comments/:commentId', auth_middleware_1.default, async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        const comment = await index_1.default.comment.findUnique({ where: { id: parseInt(commentId) } });
        if (!comment || comment.userId !== user.id) {
            return res.status(403).json({ message: '댓글 삭제 권환이 없습니다.' });
        }
        await index_1.default.comment.delete({ where: { id: parseInt(commentId) } });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// 게시글 좋아요 API
router.post('/:articleId/like', auth_middleware_1.default, async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        // 게시글 존재 확인
        const article = await index_1.default.article.findUnique({ where: { id: parseInt(articleId) } });
        if (!article) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
        }
        // 기존 좋아요 확인
        const existingLike = await index_1.default.like.findFirst({
            where: {
                userId: user.id,
                articleId: parseInt(articleId),
            },
        });
        if (existingLike) {
            // 좋아요가 이미 존재하면 취소
            await index_1.default.like.delete({
                where: { id: existingLike.id },
            });
            res.status(200).json({ message: '게시글 좋아요를 취소했습니다.' });
        }
        else {
            // 좋아요가 없으면 좋아요 생성
            await index_1.default.like.create({
                data: {
                    userId: user.id,
                    articleId: parseInt(articleId),
                },
            });
            res.status(201).json({ message: '게시글에 좋아요를 눌렀습니다.' });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
