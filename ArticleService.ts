import prisma from './index';
import { Article as PrismaArticle, Prisma } from '@prisma/client';

interface ArticleCreateInput {
  title: string;
  content: string;
  userId: number;
}

interface ArticleUpdateInput {
  title?: string;
  content?: string;
}

class ArticleService {
  async createArticle(data: ArticleCreateInput): Promise<PrismaArticle> {
    return prisma.article.create({ data });
  }

  async getArticleById(id: number): Promise<PrismaArticle | null> {
    return prisma.article.findUnique({ where: { id } });
  }

  async getArticles(options?: { skip?: number; take?: number; where?: Prisma.ArticleWhereInput; orderBy?: Prisma.ArticleOrderByWithRelationInput }): Promise<PrismaArticle[]> {
    return prisma.article.findMany(options);
  }

  async updateArticle(id: number, data: ArticleUpdateInput): Promise<PrismaArticle> {
    return prisma.article.update({ where: { id }, data });
  }

  async deleteArticle(id: number): Promise<PrismaArticle> {
    return prisma.article.delete({ where: { id } });
  }
}

export default ArticleService;
