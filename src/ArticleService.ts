import { Article as PrismaArticle, Prisma } from '@prisma/client';
import ArticleRepository from './repositories/ArticleRepository';

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
  private articleRepository: ArticleRepository;

  constructor(articleRepository: ArticleRepository) {
    this.articleRepository = articleRepository;
  }

  async createArticle(data: ArticleCreateInput): Promise<PrismaArticle> {
    return this.articleRepository.createArticle(data);
  }

  async getArticleById(id: number): Promise<PrismaArticle | null> {
    return this.articleRepository.findArticleById(id);
  }

  async getArticles(options?: { skip?: number; take?: number; where?: Prisma.ArticleWhereInput; orderBy?: Prisma.ArticleOrderByWithRelationInput }): Promise<PrismaArticle[]> {
    return this.articleRepository.findArticles(options);
  }

  async updateArticle(id: number, data: ArticleUpdateInput): Promise<PrismaArticle> {
    return this.articleRepository.updateArticle(id, data);
  }

  async deleteArticle(id: number): Promise<PrismaArticle> {
    return this.articleRepository.deleteArticle(id);
  }
}

export default ArticleService;