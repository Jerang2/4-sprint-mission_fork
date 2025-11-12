import { Comment as PrismaComment, Prisma } from '@prisma/client';
import CommentRepository from './repositories/CommentRepository';
import ArticleRepository from './repositories/ArticleRepository';
import NotificationService from './services/NotificationService';

interface CommentCreateInput {
  content: string;
  userId: number;
  productId?: number;
  articleId?: number;
}

interface CommentUpdateInput {
  content?: string;
}

class CommentService {
  constructor(
    private commentRepository: CommentRepository,
    private articleRepository: ArticleRepository,
        private notificationService: NotificationService
  ) {}

  async createComment(data: CommentCreateInput): Promise<PrismaComment> {
    const { userId, productId, articleId, ...rest } = data;

    const createdComment = await this.commentRepository.createComment({
      ...rest,
      user: { connect: { id: userId } },
      ...(productId && { product: { connect: { id: productId } } }),
      ...(articleId && { article: { connect: { id: articleId } } }),
    });

    if (articleId) {
      const article = await this.articleRepository.findArticleById(articleId);
      if (article && article.userId !== userId) {
        const message = `'${article.title}' 게시글에 새로운 댓글이 달렸습니다.`;
        await this.notificationService.create(
          article.userId,
          'NEW_COMMENT',
          message,
          articleId
        );
      }
    }

    return createdComment;
  }

  async getCommentById(id: number): Promise<PrismaComment | null> {
    return this.commentRepository.findCommentById(id);
  }

  async getComments(options?: {
    skip?: number;
    take?: number;
    where?: Prisma.CommentWhereInput;
    orderBy?: Prisma.CommentOrderByWithRelationInput;
  }): Promise<PrismaComment[]> {
    return this.commentRepository.findComments(options);
  }

  async updateComment(id: number, data: CommentUpdateInput): Promise<PrismaComment> {
    return this.commentRepository.updateComment(id, data);
  }

  async deleteComment(id: number): Promise<PrismaComment> {
    return this.commentRepository.deleteComment(id);
  }
}

export default CommentService;
