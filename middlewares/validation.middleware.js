//validation
const validateProduct = (req, res, next) => {
    const { name, content } = req.body;
    if (!name || !content) {
        return res.status(400).json({ message: '이름, 내용을 입력해야 합니다.'});
    }
    next();
}

//article validation
const validateArticle = (req, res, next) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: '제목, 내용을 입력해야 합니다.'});
    }
    next();
}

module.exports = { validateProduct, validateArticle };