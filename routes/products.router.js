// product router
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationProduct, validateProduct } = require('../middlewares/validation.middleware.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

// registration router
router.post('/products', authMiddleware, validateProduct, async (req, res, next) => {
    try {
        const { name, description, price } = req.body;
        const { user } = req;
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                userId: user.id,
            },
        });
        res.status(201).json(product);
    }   catch(error) {
        next(error);
    }
})

// cherck router
router.get('/products', async (req, res, next) => {
    try {
        const { sort, search } = req.query;
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let offset = (page - 1) * limit;

        const where = search
        ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' }},
                { description: { contains: search, mode: 'insensitive'
                } },
            ],
        }
        : {};
        const products = await prisma.product.findMany({
            where,
            select: { id: true, name: true, price: true, createdAt: true, userId: true },
            orderBy: sort === 'recent' ? { createdAt: 'desc' } : undefined,
            skip: offset,
            take: limit,
        });
        res.status(200).json(products);
    }   catch (error) {
        next(error);
    }
});

// datail, modify, delete
router
 .route('/products/:productId')
 .get(async (req, res, next) => {
    try {
        const { productId } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(productId) },
            select: { id: true, name: true, description: true, price: true,
                createdAt: true, userId: true },
            });
            if (!product) return res.status(404).json({ message: '상품을 찾을수 없습니다.'});
            res.status(200).json(product);
        }   catch (error) {
            next(error);
        }
        })
        .patch(validateProduct, authMiddleware, async (req, res, next) => {
            try {
                const { productId } = req.params;
                const { name, description, price } = req.body;
                const { user } = req;

                // 상품 소유자 확인
                const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
                if (!product || product.userId !== user.id) {
                    return res.status(403).json({ message: '상품 수정 권한이 없습니다.' });
                }

                const updatedProduct = await prisma.product.update({
                    where: { id: parseInt(productId) },
                    data: { name, description, price },
                });
                res.status(200).json(updatedProduct);
            }   catch (error) {
                next(error);
            }
        })
        .delete(authMiddleware, async (req, res, next) => {
            try {
                const { productId } = req.params;
                const { user } = req;

                const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
                if (!product || product.userId !== user.id) {
                    return res.status(403).json({ message: '상품 삭제 권한이 없습니다.' });
                }

                await prisma.product.delete({ where: { id: parseInt(productId) }});
                res.status(204).send();
            }   catch (error) {
                next(error);
            }
        });

// comment
router.post('/products/:productId/comments', authMiddleware,  async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { content } = req.body
        const { user } = req;

        if (!content) return res.status(400).json({ message: '댓글을 입력해주세요.' });

        const newComment = await prisma.comment.create({
            data: {
                content,
                productId: parseInt(productId),
                userId: user.id,
            },
        });
        res.status(201).json(newComment);
    }   catch (error) {
        next(error);
    }
});

//comment check
router.get('/products/:productId/comments', async (req, res, next) => {
    try {
        const { productId } = req.params;
        let cursor = req.query.cursor ? parseInt(req.query.cursor): undefined;
        let limit = parseInt(req.query.limit) || 10;

        const comments = await prisma.comment.findMany({
            where: { productId: parseInt(productId) },
            select: { id: true, content: true, createdAt: true, userId: true },
            orderBy: { createdAt: 'desc' },
            cursor: cursor ? { id: cursor } : undefined,
            take: limit,
            skip: cursor ? 1 : 0,
        });
        res.status(200).json(comments);
    }   catch (error) {
        next(error);
    }
});

// comment modify
router.patch('/products/comments/:commentId', authMiddleware, async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const { user } = req;

        if (!content) return res.status(400).json({ message: '수정할 내용을 입력해주세요.'});

        const existingComment = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
        if (!existingComment || existingComment.userId !== user.id) {
            return res.status(403).json({ message: '댓글 수정 권한이 없습니다.' });
        }
    
        const updatedComment = await prisma.comment.update 
({
         where: { id: parseInt(commentId) },
         data: { content },
     });
        res.status(200).json(updatedComment);
    }   catch (error) {
        next(error);
    }
});

// comment delete
router.delete('/products/comments/:commentId', authMiddleware, async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { user } = req;

        const existingComment = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
        if (!existingComment || existingComment.userId !== user.id) {
            return res.status(403).json({ message: '댓글 삭제 권한이 없습니다.' });
        }
        
        await prisma.comment.delete({ where: { id: parseInt(commentId) }});
        res.status(204).send();
    }   catch(error) {
        next(error);
    }
});

module.exports = router;