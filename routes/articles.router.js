//adricle router
const express = require('express');
const router = express.Router();
const { PrismaClient } =require('@prisma/client');
const prisma = new PrismaClient();
const { validateArticle } = require('../middlewares/validation.middleware.js');
const authMiddleware = require('../middlewares/auth.middleware.js');
const optionalAuthMiddleware = require('../middlewares/optionalAuth.middleware.js');

//article registration 
router
 .route('/articles')
 .post(authMiddleware, validateArticle, async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const { user } = req;

        const article = await prisma.article.create({ data: { 
            title,
            content,
            userId: user.id,
        }
    });
        res.status(201).json(article);
    }   catch (error) {
        next(error);
    }
})
  // 게시글 목록 조회
 .get(optionalAuthMiddleware, async (req, res, next) => {
    try {
        const { sort, search } = req.query;
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let offset = (page - 1) * limit;

        const where = search
          ? {
            OR: [
                { title: { contains: search, mode: 'insensitive' }},
                { content: { contains: search, mode: 'insensitive' }},
            ],
          }
          : {};

        const user = req.user;
        const articles = await prisma.article.findMany({
        where,
        select: { id: true, title: true, content: true, createdAt: true, userId: true },
        orderBy: sort === 'recent' ? { createdAt: 'desc' } : undefined,
        skip: offset,
        take: limit,
        });

        let responseArticle = articles;

        if (user) {
        const articleIds = articles.map(article => article.id);
        const likes = await prisma.like.findMany({
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
        } else {
        responseArticles = articles.map(article => ({
            ...article,
            isLiked: false,
        }));
        }

        res.status(200).json(responseArticles);
    } catch (error) {
        next(error);
    }
});

// article detail, modify, delete
router
 .route('/articles/:articleId')
 .get(optionalAuthMiddleware, async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const user = req.user;

        const article = await prisma.article.findUnique({
            where: { id: parseInt(articleId) },
            select: { id: true, title: true, content: true, createdAt: true, userId: true },
        });

        if (!article) {
            return res.status(404).json({ message: '게시글을 찾을 수 없습니다.'});
        }

        let isLiked = false;
        if (user) {
            const like = await prisma.like.findFirst({
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

    }   catch (error) {
        next(error);
    }
})

 .patch(authMiddleware, validateArticle, async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { title, content } = req.body;
        const { user } = req;

        // 게시글 소유 확인
        const article = await prisma.article.findUnique({ where: { id: parseInt(articleId) } });
        const updatedArticle = await prisma.article.update({
            where: { id: parseInt(articleId) },
            data: { title, content },
        });
        res.status(200).json(updatedArticle);
    }   catch (error) {
        next(error);
    }
})
 .delete(authMiddleware, async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { user } = req;

        const article = await prisma.article.findUnique({ where: { id: parseInt(articleId) } });
        if (!article || article.userId !== user.id) {
            return res.status(403).json({ message: '게시글 삭제 권한이 없습니다.' });
        }

        await prisma.article.delete({ where: { id: parseInt(articleId) }});
        res.status(204).send();
    }   catch (error) {
        next(error);
    }
    });

// article comment creation 
router.post('/articles/:articleId/comments', authMiddleware, async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { content } = req.body;
        const { user } = req;

        if (!content) return res.status(400).json({ message: '댓글을 입력해주세요.'});
        
        const newComment = await prisma.comment.create({
            data: {
                content,
                articleId: parseInt(articleId),
                userId: user.id,
            },
        });
        res.status(201).json(newComment);
    }   catch (error) {
        next(error);
    }
});
   
// article comments check
router.get('/articles/:articleId/comments', async (req, res, next) => {
    try {
        const { articleId } = req.params;
        let cursor = req.query.cursor ? parseInt(req.query.cursor): undefined;
        let limit = parseInt(req.query.limit) || 10;

        const comments = await prisma.comment.findMany({
            where: { articleId: parseInt(articleId) },
            select: { id: true, content: true, createdAt: true, userId: true },
            orderBy: { createdAt: 'desc' },
            cursor: cursor ? { id: cursor } : undefined,
            take: limit,
            skip: cursor ? 1 : 0,
        });
        res.status(200).json(comments);
    } catch(error) {
        next(error);
    }
});

//article comment modify
router.patch('/articles/comments/:commentId', authMiddleware, async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const { user } = req;

        if (!content) return res.status(400).json({ message: '수정할 내용을 입력하세요.' });

        const comment = await prisma.comment.findUnique({ where: { id: parseInt(commentId) }});
        if (!comment || comment.userId !== user.id) {
            return res.status(403).json({ message: '댓글 수정 권한이 없습니다.' });
        }

        const updatedComment = await prisma.comment.update
        ({
            where: { id: parseInt(commentId) },
            data: { content },
        });
        res.status(200).json(updatedComment);
    }   catch (error) {
        next(error)
    }
});

//article comment delete
router.delete('/articles/comments/:commentId', authMiddleware, async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { user } = req;

        const comment = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
        if (!comment || comment.userId !== user.id) {
            return res.status(403).json({ message: '댓글 삭제 권환이 없습니다.' });
        }

        await prisma.comment.delete({ where: { id: parseInt(commentId) }});
        res.status(204).send();
    }   catch (error) {
        next(error);
    }
});

// 게시글 좋아요 API
router.post('/:articleId/like', authMiddleware, async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const { user } = req;

        // 게시글 존재 확인
        const article = await prisma.article.findUnique({ where: { id: parseInt(articleId) } });
    if (!article) {
        return res.status(404).json({ message: '게시글을 찾을 수 없습니다.'});
    }

        // 기존 좋아요 확인
        const existingLike = await prisma.like.findFirst({
            where: {
                userId: user.id,
                articleId: parseInt(articleId),
            },
        });

        if (existingLike) {
            // 좋아요가 이미 존재하면 취소
            await prisma.like.delete({
                where: { id: existingLike.id },
            });
            res.status(200).json({ message: '게시글 좋아요를 취소했습니다.' });
          } else {
            // 좋아요가 없으면 좋아요 생성
            await prisma.like.create({
                data: {
                    userId: user.id,
                    articleId: parseInt(articleId),
                },
            });
            res.status(201).json({ message: '게시글에 좋아요를 눌렀습니다.' });
        }
    } catch (error) {
       next (error);
    }
});
     
module.exports = router;