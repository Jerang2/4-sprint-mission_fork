class Article {
    constructor(title, content, writer) {
        this.title = title;
        this.content = content;
        this.writer = writer;
        this.likeCount = 0;
        this.createdAt = new Date();
    }
    like() {
        this.likeCount++;
    }
}

const BASE_URL = 'https://panda-market-api-crud.vercel.app';

function getAarticleList (page = 1, pageSize = 10, keyword = '') {
    fetch (`${BASE_URL}/articles?page=${page}&pageSize=${pageSize}&keyword=${keyword}`)
    .then (response => {
        if (!response.ok) {
            throw new Error (`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then (data => console.log (`Article list:`, data))
    .catch (error => console.error ('Error fetching article list:', error));
}

function getArticle(articleId) {
    fetch (`${BASE_URL}/articles/${articleId}`)
    .then (response => {
        if (!response.ok) {
            throw new Error (`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then (data => console.log(`Article ${articleId}:`, data))
    .catch (error => console.error (`Error fetching article ${articleId}:`, error));
}

function createArticle(articleData) {
    fetch (`${BASE_URL}/articles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
    })
    .then (response => {
        if (!response.ok) {
            throw new Error (`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => console.log('Created article:', data))
    .catch (error => console.error ('Error creating article:', error))
}

function patchArticle(articleId, articleData) {
    fetch (`${BASE_URL}/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
    })
    .then (response => {
        if (!response.ok) {
            throw new Error (`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => console.log(`Patched article ${articleId}:`, data))
    .catch (error => console.error (`Error patching article ${articleId}:`, error))
}

function deleteArticle(articleId) {
    fetch (`${BASE_URL}/articles/${articleId}`, {
        method: 'DELETE',
        })
    .then (response => {
        if (!response.ok) {
            throw new Error (`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => console.log(`Deleted article ${articleId}:`, data))
    .catch (error => console.error (`Error deleting article ${articleId}:`, error))
}

export { Article, getAarticleList, getArticle, createArticle, patchArticle, deleteArticle };