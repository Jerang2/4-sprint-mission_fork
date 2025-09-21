class Product {
    constructor(name, destription, price, tags, images) {
        this.name = name;
        this.destription = destription;
        this.price = price;
        this.tags = tags;
        this.images = images;
        this.favoriteCount = 0;
    }
    favorite() {
        this.favoriteCount++;
    }
}

class ElectronicProduct extends Product {
    (name, destription, price, tags, images, manufacturer) {
        super (name, destription, price, tags, images);
        this.manufacturer = manufacturer;
    }
}

const BASE_URL = 'https://panda-market-api-crud.vercel.app';

async function getProductList (page = 1, pageSize = 10, keyword = '') {
    try {
        const response = await fetch (`${BASE_URL}/products?page=${page}&pageSize=
            ${pageSize}&keyword=${keyword}`);
        if (!response.ok) {
            throw new Error (`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const products = data.map (item => {
            if (item.tag.includes ('전자제품')) {
                return new ElectronicProduct(item.name, item.destription, item.price, item.tags,
                     item.images, item.manufacturer);
            } else {
                return new Product (item.name, item.destription, item.price, item.tags, item.images)
            }
        });
        return products;
    } catch (error) {
        console.error('Error fetching product list:', error);
    }
}

async function getProduct(productId) {
    
    try {
        const response = await fetch(`${BASE_URL}/products/${productId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
    }
}
   
async function createProduct(productData) {
    try {
        const response = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating product:', error);
    }
}
   
async function patchProduct(productId, productData) {
    try {
        const response = await fetch(`${BASE_URL}/products/${productId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error patching product ${productId}:`, error);
    }
}
   
async function deleteProduct(productId) {
    try {
        const response = await fetch(`${BASE_URL}/products/${productId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error deleting product ${productId}:`, error);
    }
}

export { Product, ElectronicProduct, getProductList, getProduct, createProduct, patchProduct, 
    deleteProduct };