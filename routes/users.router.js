const express = require('express');
const UserService = require('../UserService.js');

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

module.exports = router; 