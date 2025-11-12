import { Router } from 'express';
import ProductsController from '../controllers/ProductsController';
import ProductService from '../ProductService';
import ProductRepository from '../repositories/ProductRepository';
import LikeRepository from '../repositories/LikeRepository';
import NotificationService from '../services/NotificationService';
import authMiddleware from '../middlewares/auth.middleware';
import optionalAuthMiddleware from '../middlewares/optionalAuth.middleware';
import { validateProduct } from '../middlewares/validation.middleware';

const router = Router();

// Initialize repositories and services
const productRepository = new ProductRepository();
const likeRepository = new LikeRepository();
const notificationService = new NotificationService();
const productService = new ProductService(productRepository, likeRepository, notificationService);
const productsController = new ProductsController(productService);

// registration router
router.post('/products', authMiddleware, validateProduct, productsController.createProduct);

// cherck router
router.get('/products', optionalAuthMiddleware, productsController.getProducts);

// datail, modify, delete
router
  .route('/products/:productId')
  .get(optionalAuthMiddleware, productsController.getProductById)
  .patch(validateProduct, authMiddleware, productsController.updateProduct)
  .delete(authMiddleware, productsController.deleteProduct);

// comment
router.post('/products/:productId/comments', authMiddleware, productsController.createComment);

//comment check
router.get('/products/:productId/comments', productsController.getComments);

// comment modify
router.patch('/products/comments/:commentId', authMiddleware, productsController.updateComment);

// comment delete
router.delete('/products/comments/:commentId', authMiddleware, productsController.deleteComment);

// 상품 좋아요 API
router.post('/:productId/like', authMiddleware, productsController.toggleLike);

export default router;
