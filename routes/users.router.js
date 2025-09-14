import express from 'express';
import { UserService } from '../UserService.js';

const router = express.Router();
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

export default router;