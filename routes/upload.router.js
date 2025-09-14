//upload route
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//uploads 디렉토리가 없을 때 생성
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

//multer repository
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    },
});

//multer middleware
const upload = multer({ storage: storage });

//image api
router.post('/upload', upload.single('image'), (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: '이미지 파일이 필요합니다.'});
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({ imageUrl: imageUrl });
});

module.exports = router;
