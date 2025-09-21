import { Like as PrismaLike, Prisma } from '@prisma/client';
import LikeRepository from './repositories/LikeRepository';

interface LikeCreateInput {
  userId: number;
  productId?: number;
  articleId?: number;
}

class LikeService {
  private likeRepository: LikeRepository;

  constructor(likeRepository: LikeRepository) {
    this.likeRepository = likeRepository;
  }

  async createLike(data: LikeCreateInput): Promise<PrismaLike> {
    return this.likeRepository.createLike(data);
  }

  async deleteLike(id: number): Promise<PrismaLike> {
    return this.likeRepository.deleteLike(id);
  }

  async findLikeByUserIdAndProductId(userId: number, productId: number): Promise<PrismaLike | null> {
    return this.likeRepository.findLikeByUserIdAndProductId(userId, productId);
  }

  async findLikeByUserIdAndArticleId(userId: number, articleId: number): Promise<PrismaLike | null> {
    return this.likeRepository.findLikeByUserIdAndArticleId(userId, articleId);
  }
}

export default LikeService;
