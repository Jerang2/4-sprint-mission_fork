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
// registration router
router.post('/products', auth_middleware_1.default, validation_middleware_1.validateProduct, async (req, res, next) => {
    try {
        const { name, description, price } = req.body;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        const product = await index_1.default.product.create({
            data: {
                name,
                content: description, // Map description to content
                price,
                userId: user.id,
            },
        });
        res.status(201).json(product);
    }
    catch (error) {
        next(error);
    }
});
// cherck router
router.get('/products', optionalAuth_middleware_1.default, async (req, res, next) => {
    try {
        const { sort, search } = req.query;
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let offset = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { content: { contains: search, mode: 'insensitive'
                        } },
                ],
            }
            : {};
        const user = req.user;
        const products = await index_1.default.product.findMany({
            where,
            select: { id: true, name: true, price: true, createdAt: true, userId: true, updatedAt: true },
            orderBy: sort === 'recent' ? { createdAt: 'desc' } : undefined,
            skip: offset,
            take: limit,
        });
        let responseProducts = products;
        if (user) {
            // 로그인한 사용자의 좋아요 누른 상품 목록 조회
            const productIds = products.map(product => product.id);
            const likes = await index_1.default.like.findMany({
                where: {
                    userId: user.id,
                    productId: { in: productIds },
                },
            });
            const likedProductIds = new Set(likes.map(like => like.productId));
            // 각 상품에 isLiked 필드 추가
            responseProducts = products.map(product => ({
                ...product,
                isLiked: likedProductIds.has(product.id),
            }));
        }
        else {
            // 로그인 하지 않은 사용자의 경우 모든 isLiked = false
            responseProducts = products.map(product => ({
                ...product,
                isLiked: false,
            }));
        }
        res.status(200).json(responseProducts);
    }
    catch (error) {
        next(error);
    }
});
// datail, modify, delete
router
    .route('/products/:productId')
    .get(optionalAuth_middleware_1.default, async (req, res, next) => {
    try {
        const { productId } = req.params;
        const user = req.user;
        const product = await index_1.default.product.findUnique({
            where: { id: parseInt(productId) },
            select: { id: true, name: true, description: true, price: true,
                createdAt: true, userId: true, updatedAt: true },
        });
        if (!product)
            return res.status(404).json({ message: '상품을 찾을수 없습니다.' });
        let isLiked = false;
        if (user) {
            // 로그인한 경우 좋아요 여부 확인
            const like = await index_1.default.like.findFirst({
                where: {
                    productId: product.id,
                    userId: user.id,
                },
            });
            if (like) {
                isLiked = true;
            }
        }
        const responseProduct = { ...product, isLiked };
        res.status(200).json(responseProduct);
    }
    catch (error) {
        next(error);
    }
})
    .patch(validation_middleware_1.validateProduct, auth_middleware_1.default, async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { name, description, price } = req.body;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        // 상품 소유자 확인
        const product = await index_1.default.product.findUnique({ where: { id: parseInt(productId) } });
        if (!product || product.userId !== user.id) {
            return res.status(403).json({ message: '상품 수정 권한이 없습니다.' });
        }
        const updatedProduct = await index_1.default.product.update({
            where: { id: parseInt(productId) },
            data: { name, content: description, price },
        });
        res.status(200).json(updatedProduct);
    }
    catch (error) {
        next(error);
    }
})
    .delete(auth_middleware_1.default, async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        const product = await index_1.default.product.findUnique({ where: { id: parseInt(productId) } });
        if (!product || product.userId !== user.id) {
            return res.status(403).json({ message: '상품 삭제 권한이 없습니다.' });
        }
        await index_1.default.product.delete({ where: { id: parseInt(productId) } });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// comment
router.post('/products/:productId/comments', auth_middleware_1.default, async (req, res, next) => {
    try {
        const { productId } = req.params;
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
                productId: parseInt(productId),
                userId: user.id,
            },
        });
        res.status(201).json(newComment);
    }
    catch (error) {
        next(error);
    }
});
//comment check
router.get('/products/:productId/comments', async (req, res, next) => {
    try {
        const { productId } = req.params;
        let cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
        let limit = parseInt(req.query.limit) || 10;
        const comments = await index_1.default.comment.findMany({
            where: { productId: parseInt(productId) },
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
// comment modify
router.patch('/products/comments/:commentId', auth_middleware_1.default, async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        if (!content)
            return res.status(400).json({ message: '수정할 내용을 입력해주세요.' });
        const existingComment = await index_1.default.comment.findUnique({ where: { id: parseInt(commentId) } });
        if (!existingComment || existingComment.userId !== user.id) {
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
// comment delete
router.delete('/products/comments/:commentId', auth_middleware_1.default, async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        const existingComment = await index_1.default.comment.findUnique({ where: { id: parseInt(commentId) } });
        if (!existingComment || existingComment.userId !== user.id) {
            return res.status(403).json({ message: '댓글 삭제 권한이 없습니다.' });
        }
        await index_1.default.comment.delete({ where: { id: parseInt(commentId) } });
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
// 상품 좋아요 API
router.post('/:productId/like', auth_middleware_1.default, async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: '사용자 정보를 찾을 수 없습니다.' });
        }
        // 상품 존재 확인
        const product = await index_1.default.product.findUnique({ where: { id: parseInt(productId) } });
        if (!product) {
            return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
        }
        // 기존 좋아요 확인
        const existingLike = await index_1.default.like.findFirst({
            where: {
                userId: user.id,
                productId: parseInt(productId),
            },
        });
        if (existingLike) {
            // 좋아요가 이미 있으면 좋아요 취소
            await index_1.default.like.delete({
                where: { id: existingLike.id },
            });
            res.status(200).json({ message: '상품 좋아요를 취소했습니다.' });
        }
        else {
            // 좋아요가 없으면 좋아요 생성
            await index_1.default.like.create({
                data: {
                    userId: user.id,
                    productId: parseInt(productId),
                },
            });
            res.status(201).json({ message: '상품에 좋아요를 눌렀습니다.' });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
