const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

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
}

module.exports = UserService;
