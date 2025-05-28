import { Client, Account, Databases, Storage, Query, ID } from "appwrite";

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Database and collection configuration for Khmer Seafood Restaurant
export const DATABASE_ID = 'restaurant-db';

export const COLLECTIONS = {
    USERS: 'users',
    CATEGORIES: 'categories',
    MENU_ITEMS: 'menuItems',
    ORDERS: 'orders',
    ORDER_ITEMS: 'orderItems'
};

export const STORAGE_BUCKETS = {
    IMAGES: 'images',
    DOCUMENTS: 'documents'
};

// Helper functions
export const getFilePreview = (bucketId, fileId, width = 400, height = 300) => {
    try {
        return storage.getFilePreview(bucketId, fileId, width, height);
    } catch (error) {
        console.error('Error getting file preview:', error);
        return null;
    }
};

export const getFileDownload = (bucketId, fileId) => {
    try {
        return storage.getFileDownload(bucketId, fileId);
    } catch (error) {
        console.error('Error getting file download:', error);
        return null;
    }
};

export { client, account, databases, storage, Query, ID };
