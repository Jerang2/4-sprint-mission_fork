import prisma from './index';
import { Product as PrismaProduct, Prisma } from '@prisma/client';

interface ProductCreateInput {
  name: string;
  content: string; // Changed from description to content
  price: number;
  status?: string;
  userId: number;
}

interface ProductUpdateInput {
  name?: string;
  content?: string; // Changed from description to content
  price?: number;
  status?: string;
}

class ProductService {
  async createProduct(data: ProductCreateInput): Promise<PrismaProduct> {
    return prisma.product.create({ data });
  }

  async getProductById(id: number): Promise<PrismaProduct | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async getProducts(options?: { skip?: number; take?: number; where?: Prisma.ProductWhereInput; orderBy?: Prisma.ProductOrderByWithRelationInput }): Promise<PrismaProduct[]> {
    return prisma.product.findMany(options);
  }

  async updateProduct(id: number, data: ProductUpdateInput): Promise<PrismaProduct> {
    return prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id: number): Promise<PrismaProduct> {
    return prisma.product.delete({ where: { id } });
  }
}

export default ProductService;
