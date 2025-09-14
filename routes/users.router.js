const express = require('express');
const UserService = require('../UserService.js');
const authMiddleware = require('../middlewares/auth.middleware.js');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const router = express.Router();
const prisma = new PrismaClient();
const userService = new UserService();

// 회원가입 API
router.post('/sign-up', async (req, res, next) => {
    try {
        const { email, nickname, password } = req.body;

        // 유효성 검사
        if (!email || !nickname || !password) {
            return res.status(400).json({ message: '모든 정보를 입력해주세요'});
        }

        const newUser = await userService.signUp(email, nickname, password);

        return res.status(201).json({
            message: '회원가입이 완료되었습니다.',
            data: newUser,
        });
    } catch (error) {
        return res.status(409).json({ message: error.message });
    }
});

// 로그인 API
router.post('/sign-in', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: '이메일과 비밀번호를 모두 입력해주세요.'});
        }
            const token = await userService.signIn(email, password);

            return res.status(200).json({
                message: '로그인에 성공했습니다.',
                data: { token },
            });
        } catch (error) {
            return res.status(401).json({ message: Error.message });
        }
});

// 내 정보 조회 API
router.get('/me', authMiddleware, async (req, res, next) => {
    try {
        const { user } = req;

        res.status(200).json({
            message: '내 정보 조회 성공',
            data: {
                id: user.id,
                email: user.email,
                nickname: user.nickname,
                image: user.image,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
});

// 내 정보 수정 API
router.patch('/me', authMiddleware, async (req, res, next) => {
    try {
        const { nickname, image } = req.body;
        const { user } = req;

        if (!nickname && !image) {
            return res.status(400).json({ message: '수정할 내용을 입력해주세요.' });
        }

        // 수정할 사용자 정보
        const updatedData = {
            ...(nickname && { nickname }),
            ...(image && { image }),
        };

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updatedData,
        });

        res.status(200).json({
            message: '내 정보 수정에 성공했습니다.',
            data: {
                id: updatedUser.id,
                email: updatedUser.email,
                nickname: updatedUser.nickname,
                image: updatedUser.image,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
});

// 비밀번호 변경 API
router.patch('/me/password', authMiddleware, async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const { user } = req;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: '모든 정보를 입력해주세요.' });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.' });
        }
        

    // 현재 비밀번호 확인
    const isPasswordMatched = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatched) {
        return res.status(401).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
    }

    // 새 비밀번호 해싱
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword },
    });

    res.status(200).json({ message: '비밀번호 변경이 완료되었습니다.' });
  } catch (error) {
    next(error);
  }
});

// 내가 작성한 상품 목록 조회 API
router.get('/me/products', authMiddleware, async (req, res, next) => {
    try {
        const { user } = req;

        const products = await prisma.product.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            message: '내가 작성한 상품 목록 조회에 성공했습니다.',
            data: products,
        });
      } catch (error) {
        next(error);
      }
});

module.exports = router; 