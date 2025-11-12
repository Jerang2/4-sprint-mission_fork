import { Product as PrismaProduct, Prisma } from '@prisma/client';
import ProductRepository from './repositories/ProductRepository';
import LikeRepository from './repositories/LikeRepository';
import NotificationService from './services/NotificationService';
import { ProductUpdateDto } from './dtos/ProductDto';

interface ProductCreateServiceInput {
  name: string;
  content: string;
  price: number;
  userId: number;
  status?: string;
}

class ProductService {
  constructor(
    private productRepository: ProductRepository,
    private likeRepository: LikeRepository,
    private notificationService: NotificationService
  ) {}

  async createProduct(data: ProductCreateServiceInput): Promise<PrismaProduct> {
    const { userId, ...rest } = data;
    return this.productRepository.createProduct({
      ...rest,
      user: { connect: { id: userId } },
    });
  }

  async getProductById(id: number): Promise<PrismaProduct | null> {
    return this.productRepository.findProductById(id);
  }

  async getProducts(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }): Promise<PrismaProduct[]> {
    return this.productRepository.findProducts(options);
  }

  async updateProduct(id: number, data: ProductUpdateDto, userId: number): Promise<PrismaProduct> {
    const originalProduct = await this.productRepository.findProductById(id) as PrismaProduct & { price: number };
    if (!originalProduct) {
      throw new Error('Product not found');
    }
    if (originalProduct.userId !== userId) {
      throw new Error('You do not have permission to update this product.');
    }

    const { description, ...restOfData } = data;
    const updateData: Prisma.ProductUpdateInput = { ...restOfData };
    if (description) {
      updateData.content = description;
    }

    const updatedProduct = await this.productRepository.updateProduct(id, updateData) as PrismaProduct & { price: number };

    if (data.price && originalProduct.price !== updatedProduct.price) {
      const likes = await this.likeRepository.findLikes({ where: { productId: id } });
      for (const like of likes) {
        // Skip notification for the user who updated the product
        if (like.userId === userId) {
          continue;
        }
        const message = `'${originalProduct.name}' 상품의 가격이 ${originalProduct.price}원에서 ${updatedProduct.price}원으로 변경되었습니다.`;
        await this.notificationService.create(
          like.userId,
          'PRICE_CHANGE',
          message,
          id
        );
      }
    }

    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<PrismaProduct> {
    return this.productRepository.deleteProduct(id);
  }
}

export default ProductService;
