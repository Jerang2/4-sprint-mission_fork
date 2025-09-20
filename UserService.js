const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService {    
    prisma = new PrismaClient();

    // 회원가입 로직
    signUp = async (email, nickname, password) => {
        
        // 이메일 중복 확인
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('이미 사용중인 이메일입니다.');
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 유저 생성
        const user = await this.prisma.user.create({
            data: {
                email,
                nickname,
                password: hashedPassword,
            },
        });

        // 사용자 정보 반환
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    };

    signIn = async (email, password) => {
        // 이메일로 사용자 조회
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('존재하지 않는 이메일입니다.');
        }

        // 비밀번호 확인
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            throw new Error('비밀번호가 일치하지 않습니다.');
        }

        // Access Token 생성 (12시간)
        const accessToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '12h' }
        );

        // Refresh Token 생성 (7일)
        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.REFRESH_TOKEN_SECRET_KEY,
            { expiresIn: '7d' }
        );

        // Refresh Token을 해싱해서 DB에 저장
        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
        });

    
        return { accessToken, refreshToken };
    }
}

module.exports = UserService;
