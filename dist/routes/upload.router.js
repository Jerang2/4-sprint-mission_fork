"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const router = (0, express_1.Router)();
//uploads 디렉토리가 없을 때 생성
const uploadDir = 'uploads/';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
const storage = multer_1.default.memoryStorage();
//multer middleware
const upload = (0, multer_1.default)({ storage: storage });
//image api
router.post('/upload', upload.single('image'), async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
    }
    try {
        const ext = path_1.default.extname(req.file.originalname);
        const filename = Date.now() + ext;
        const imagePath = path_1.default.join(uploadDir, filename);
        await (0, sharp_1.default)(req.file.buffer)
            .resize({ width: 500 })
            .toFile(imagePath);
        const imageUrl = `/uploads/${filename}`;
        res.status(201).json({ imageUrl: imageUrl });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
