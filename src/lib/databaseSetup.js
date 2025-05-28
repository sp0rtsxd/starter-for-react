// Database Setup for Khmer Seafood Restaurant
import { client, databases, storage, DATABASE_ID, COLLECTIONS, STORAGE_BUCKETS, ID } from './appwrite.js';
import { Permission, Role } from 'appwrite';

/**
 * Database and Collection Setup Script
 * This script creates the database schema for the restaurant management system
 */

export class DatabaseSetup {
    constructor() {
        this.databaseId = DATABASE_ID;
        this.collections = COLLECTIONS;
        this.buckets = STORAGE_BUCKETS;
    }

    /**
     * Create the main database
     */
    async createDatabase() {
        try {
            const database = await databases.create(
                this.databaseId,
                'Khmer Seafood Restaurant Database',
                true // enabled
            );
            console.log('✅ Database created:', database);
            return database;
        } catch (error) {
            if (error.code === 409) {
                console.log('📋 Database already exists');
                return await databases.get(this.databaseId);
            }
            console.error('❌ Error creating database:', error);
            throw error;
        }
    }

    /**
     * Create all collections with their attributes
     */
    async createCollections() {
        const collectionsConfig = {
            [this.collections.USERS]: {
                name: 'Users',
                attributes: [
                    { key: 'name', type: 'string', size: 255, required: true },
                    { key: 'email', type: 'string', size: 255, required: true },
                    { key: 'phone', type: 'string', size: 20, required: false },
                    { key: 'role', type: 'string', size: 50, required: true, default: 'customer' },
                    { key: 'status', type: 'string', size: 20, required: true, default: 'active' },
                    { key: 'createdAt', type: 'datetime', required: true },
                    { key: 'updatedAt', type: 'datetime', required: true }
                ],
                indexes: [
                    { key: 'email_index', type: 'unique', attributes: ['email'] },
                    { key: 'role_index', type: 'key', attributes: ['role'] }
                ]
            },
            [this.collections.CATEGORIES]: {
                name: 'Menu Categories',
                attributes: [
                    { key: 'name', type: 'string', size: 100, required: true },
                    { key: 'description', type: 'string', size: 500, required: false },
                    { key: 'image', type: 'string', size: 255, required: false },
                    { key: 'sortOrder', type: 'integer', required: true, default: 0 },
                    { key: 'isActive', type: 'boolean', required: true, default: true },
                    { key: 'createdAt', type: 'datetime', required: true },
                    { key: 'updatedAt', type: 'datetime', required: true }
                ],
                indexes: [
                    { key: 'name_index', type: 'unique', attributes: ['name'] },
                    { key: 'sort_index', type: 'key', attributes: ['sortOrder'] },
                    { key: 'active_index', type: 'key', attributes: ['isActive'] }
                ]
            },
            [this.collections.MENU_ITEMS]: {
                name: 'Menu Items',
                attributes: [
                    { key: 'name', type: 'string', size: 150, required: true },
                    { key: 'description', type: 'string', size: 1000, required: false },
                    { key: 'price', type: 'double', required: true },
                    { key: 'categoryId', type: 'string', size: 36, required: true },
                    { key: 'image', type: 'string', size: 255, required: false },
                    { key: 'ingredients', type: 'string', size: 500, required: false },
                    { key: 'allergens', type: 'string', size: 200, required: false },
                    { key: 'isSpicy', type: 'boolean', required: true, default: false },
                    { key: 'isVegetarian', type: 'boolean', required: true, default: false },
                    { key: 'isAvailable', type: 'boolean', required: true, default: true },
                    { key: 'prepTime', type: 'integer', required: false },
                    { key: 'calories', type: 'integer', required: false },
                    { key: 'sortOrder', type: 'integer', required: true, default: 0 },
                    { key: 'createdAt', type: 'datetime', required: true },
                    { key: 'updatedAt', type: 'datetime', required: true }
                ],
                indexes: [
                    { key: 'category_index', type: 'key', attributes: ['categoryId'] },
                    { key: 'price_index', type: 'key', attributes: ['price'] },
                    { key: 'available_index', type: 'key', attributes: ['isAvailable'] },
                    { key: 'sort_index', type: 'key', attributes: ['sortOrder'] }
                ]
            },
            [this.collections.ORDERS]: {
                name: 'Orders',
                attributes: [
                    { key: 'orderNumber', type: 'string', size: 20, required: true },
                    { key: 'customerId', type: 'string', size: 36, required: true },
                    { key: 'customerName', type: 'string', size: 255, required: true },
                    { key: 'customerPhone', type: 'string', size: 20, required: false },
                    { key: 'customerEmail', type: 'string', size: 255, required: false },
                    { key: 'tableNumber', type: 'integer', required: false },
                    { key: 'orderType', type: 'string', size: 20, required: true }, // dine-in, takeaway, delivery
                    { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
                    { key: 'subtotal', type: 'double', required: true },
                    { key: 'tax', type: 'double', required: true, default: 0 },
                    { key: 'tip', type: 'double', required: false, default: 0 },
                    { key: 'total', type: 'double', required: true },
                    { key: 'paymentMethod', type: 'string', size: 30, required: false },
                    { key: 'paymentStatus', type: 'string', size: 20, required: true, default: 'pending' },
                    { key: 'notes', type: 'string', size: 500, required: false },
                    { key: 'estimatedTime', type: 'integer', required: false },
                    { key: 'createdAt', type: 'datetime', required: true },
                    { key: 'updatedAt', type: 'datetime', required: true }
                ],
                indexes: [
                    { key: 'order_number_index', type: 'unique', attributes: ['orderNumber'] },
                    { key: 'customer_index', type: 'key', attributes: ['customerId'] },
                    { key: 'status_index', type: 'key', attributes: ['status'] },
                    { key: 'type_index', type: 'key', attributes: ['orderType'] },
                    { key: 'date_index', type: 'key', attributes: ['createdAt'] }
                ]
            },
            [this.collections.ORDER_ITEMS]: {
                name: 'Order Items',
                attributes: [
                    { key: 'orderId', type: 'string', size: 36, required: true },
                    { key: 'menuItemId', type: 'string', size: 36, required: true },
                    { key: 'menuItemName', type: 'string', size: 150, required: true },
                    { key: 'quantity', type: 'integer', required: true },
                    { key: 'unitPrice', type: 'double', required: true },
                    { key: 'totalPrice', type: 'double', required: true },
                    { key: 'specialInstructions', type: 'string', size: 300, required: false },
                    { key: 'status', type: 'string', size: 20, required: true, default: 'pending' },
                    { key: 'createdAt', type: 'datetime', required: true }
                ],
                indexes: [
                    { key: 'order_index', type: 'key', attributes: ['orderId'] },
                    { key: 'menu_item_index', type: 'key', attributes: ['menuItemId'] },
                    { key: 'status_index', type: 'key', attributes: ['status'] }
                ]
            }
        };

        const results = {};
        for (const [collectionId, config] of Object.entries(collectionsConfig)) {
            try {
                results[collectionId] = await this.createCollection(collectionId, config);
            } catch (error) {
                console.error(`❌ Error creating collection ${collectionId}:`, error);
                throw error;
            }
        }
        return results;
    }

    /**
     * Create a single collection with attributes and indexes
     */
    async createCollection(collectionId, config) {
        try {
            // Create collection
            const collection = await databases.createCollection(
                this.databaseId,
                collectionId,
                config.name,
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                true // enabled
            );
            console.log(`✅ Collection created: ${config.name}`);

            // Create attributes
            for (const attr of config.attributes) {
                await this.createAttribute(collectionId, attr);
            }

            // Create indexes
            if (config.indexes) {
                for (const index of config.indexes) {
                    await this.createIndex(collectionId, index);
                }
            }

            return collection;
        } catch (error) {
            if (error.code === 409) {
                console.log(`📋 Collection ${config.name} already exists`);
                return await databases.getCollection(this.databaseId, collectionId);
            }
            throw error;
        }
    }

    /**
     * Create an attribute for a collection
     */
    async createAttribute(collectionId, attr) {
        try {
            let result;
            switch (attr.type) {
                case 'string':
                    result = await databases.createStringAttribute(
                        this.databaseId,
                        collectionId,
                        attr.key,
                        attr.size,
                        attr.required,
                        attr.default || null,
                        attr.array || false
                    );
                    break;
                case 'integer':
                    result = await databases.createIntegerAttribute(
                        this.databaseId,
                        collectionId,
                        attr.key,
                        attr.required,
                        attr.min || null,
                        attr.max || null,
                        attr.default || null,
                        attr.array || false
                    );
                    break;
                case 'double':
                    result = await databases.createFloatAttribute(
                        this.databaseId,
                        collectionId,
                        attr.key,
                        attr.required,
                        attr.min || null,
                        attr.max || null,
                        attr.default || null,
                        attr.array || false
                    );
                    break;
                case 'boolean':
                    result = await databases.createBooleanAttribute(
                        this.databaseId,
                        collectionId,
                        attr.key,
                        attr.required,
                        attr.default || null,
                        attr.array || false
                    );
                    break;
                case 'datetime':
                    result = await databases.createDatetimeAttribute(
                        this.databaseId,
                        collectionId,
                        attr.key,
                        attr.required,
                        attr.default || null,
                        attr.array || false
                    );
                    break;
                default:
                    throw new Error(`Unsupported attribute type: ${attr.type}`);
            }
            console.log(`  ✅ Attribute created: ${attr.key} (${attr.type})`);
            return result;
        } catch (error) {
            if (error.code === 409) {
                console.log(`  📋 Attribute ${attr.key} already exists`);
                return null;
            }
            console.error(`  ❌ Error creating attribute ${attr.key}:`, error);
            throw error;
        }
    }

    /**
     * Create an index for a collection
     */
    async createIndex(collectionId, index) {
        try {
            const result = await databases.createIndex(
                this.databaseId,
                collectionId,
                index.key,
                index.type,
                index.attributes,
                index.orders || []
            );
            console.log(`  ✅ Index created: ${index.key} (${index.type})`);
            return result;
        } catch (error) {
            if (error.code === 409) {
                console.log(`  📋 Index ${index.key} already exists`);
                return null;
            }
            console.error(`  ❌ Error creating index ${index.key}:`, error);
            throw error;
        }
    }

    /**
     * Create storage buckets
     */
    async createStorageBuckets() {
        const bucketsConfig = {
            [this.buckets.IMAGES]: {
                name: 'Restaurant Images',
                permissions: [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                fileSecurity: true,
                enabled: true,
                maximumFileSize: 10000000, // 10MB
                allowedFileExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                compression: 'gzip',
                encryption: true,
                antivirus: true
            },
            [this.buckets.DOCUMENTS]: {
                name: 'Restaurant Documents',
                permissions: [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                fileSecurity: true,
                enabled: true,
                maximumFileSize: 50000000, // 50MB
                allowedFileExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
                compression: 'gzip',
                encryption: true,
                antivirus: true
            }
        };

        const results = {};
        for (const [bucketId, config] of Object.entries(bucketsConfig)) {
            try {
                const bucket = await storage.createBucket(
                    bucketId,
                    config.name,
                    config.permissions,
                    config.fileSecurity,
                    config.enabled,
                    config.maximumFileSize,
                    config.allowedFileExtensions,
                    config.compression,
                    config.encryption,
                    config.antivirus
                );
                console.log(`✅ Storage bucket created: ${config.name}`);
                results[bucketId] = bucket;
            } catch (error) {
                if (error.code === 409) {
                    console.log(`📋 Storage bucket ${config.name} already exists`);
                    results[bucketId] = await storage.getBucket(bucketId);
                } else {
                    console.error(`❌ Error creating storage bucket ${config.name}:`, error);
                    throw error;
                }
            }
        }
        return results;
    }

    /**
     * Run the complete setup process
     */
    async setupComplete() {
        console.log('🚀 Starting Khmer Seafood Restaurant database setup...\n');
        
        try {
            // Create database
            console.log('📊 Creating database...');
            await this.createDatabase();
            
            // Create storage buckets
            console.log('\n📁 Creating storage buckets...');
            await this.createStorageBuckets();
            
            // Create collections
            console.log('\n📋 Creating collections...');
            await this.createCollections();
            
            console.log('\n✅ Database setup completed successfully!');
            console.log('\n📋 Summary:');
            console.log(`- Database: ${this.databaseId}`);
            console.log(`- Collections: ${Object.keys(this.collections).length}`);
            console.log(`- Storage Buckets: ${Object.keys(this.buckets).length}`);
            
            return {
                success: true,
                database: this.databaseId,
                collections: this.collections,
                buckets: this.buckets
            };
        } catch (error) {
            console.error('❌ Database setup failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Seed sample data for testing
     */
    async seedSampleData() {
        console.log('🌱 Seeding sample data...\n');
        
        try {
            // Sample categories
            const categories = [
                {
                    name: 'Appetizers',
                    description: 'Start your meal with our delicious appetizers',
                    sortOrder: 1,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    name: 'Seafood Specialties',
                    description: 'Fresh seafood dishes with authentic Khmer flavors',
                    sortOrder: 2,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    name: 'Traditional Khmer',
                    description: 'Classic Cambodian dishes prepared with love',
                    sortOrder: 3,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    name: 'Beverages',
                    description: 'Refreshing drinks and traditional beverages',
                    sortOrder: 4,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            // Create categories
            const createdCategories = [];
            for (const category of categories) {
                const created = await databases.createDocument(
                    this.databaseId,
                    this.collections.CATEGORIES,
                    ID.unique(),
                    category
                );
                createdCategories.push(created);
                console.log(`✅ Category created: ${category.name}`);
            }

            // Sample menu items
            const menuItems = [
                {
                    name: 'Fresh Spring Rolls',
                    description: 'Vietnamese-style spring rolls with shrimp and fresh herbs',
                    price: 8.90,
                    categoryId: createdCategories[0].$id,
                    isSpicy: false,
                    isVegetarian: false,
                    isAvailable: true,
                    prepTime: 10,
                    calories: 180,
                    sortOrder: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    name: 'Grilled Barramundi',
                    description: 'Grilled barramundi with lemongrass and Khmer spices',
                    price: 24.90,
                    categoryId: createdCategories[1].$id,
                    isSpicy: true,
                    isVegetarian: false,
                    isAvailable: true,
                    prepTime: 25,
                    calories: 320,
                    sortOrder: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    name: 'Amok Fish',
                    description: 'Traditional Cambodian fish curry steamed in banana leaves',
                    price: 19.90,
                    categoryId: createdCategories[2].$id,
                    isSpicy: true,
                    isVegetarian: false,
                    isAvailable: true,
                    prepTime: 30,
                    calories: 280,
                    sortOrder: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    name: 'Iced Coffee',
                    description: 'Strong Cambodian coffee served with condensed milk over ice',
                    price: 4.50,
                    categoryId: createdCategories[3].$id,
                    isSpicy: false,
                    isVegetarian: true,
                    isAvailable: true,
                    prepTime: 5,
                    calories: 120,
                    sortOrder: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            // Create menu items
            for (const item of menuItems) {
                const created = await databases.createDocument(
                    this.databaseId,
                    this.collections.MENU_ITEMS,
                    ID.unique(),
                    item
                );
                console.log(`✅ Menu item created: ${item.name}`);
            }

            console.log('\n✅ Sample data seeded successfully!');
            return { success: true };
        } catch (error) {
            console.error('❌ Error seeding sample data:', error);
            return { success: false, error: error.message };
        }
    }
}

export default DatabaseSetup;
