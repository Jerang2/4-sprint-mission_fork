const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 선택적 인증 미들웨어
// 인증에 성공하면 사용자 정보를 추가하고 실패해도 에러없이 다음 미들웨어 진행
module.exports = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return next();
        }

        const [tokenType, token] = authorization.split(' ');
        if (tokenType !== 'Bearer' || !token) {
            return next();
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.userId },
        });

        if (user) {
            req.user = user;
        }
    } catch (error) {
    }

    return next();
};