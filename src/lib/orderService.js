import { Client, Databases, ID, Query } from 'appwrite';
import { appwriteConfig } from './appwrite.js';

class OrderService {
    constructor() {
        this.client = new Client()
            .setEndpoint(appwriteConfig.endpoint)
            .setProject(appwriteConfig.projectId);
        
        this.databases = new Databases(this.client);
    }

    // Create a new order
    async createOrder(orderData) {
        try {
            const order = await this.databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                ID.unique(),
                {
                    userId: orderData.userId,
                    customerName: orderData.customerName,
                    customerEmail: orderData.customerEmail,
                    customerPhone: orderData.customerPhone,
                    deliveryAddress: orderData.deliveryAddress,
                    orderType: orderData.orderType, // 'delivery', 'pickup', 'dine-in'
                    status: 'pending',
                    subtotal: parseFloat(orderData.subtotal),
                    tax: parseFloat(orderData.tax),
                    deliveryFee: parseFloat(orderData.deliveryFee || 0),
                    total: parseFloat(orderData.total),
                    paymentMethod: orderData.paymentMethod,
                    paymentStatus: 'pending',
                    specialInstructions: orderData.specialInstructions || '',
                    estimatedDeliveryTime: orderData.estimatedDeliveryTime
                }
            );
            return order;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    // Add items to an order
    async addOrderItems(orderId, items) {
        try {
            const orderItems = [];
            for (const item of items) {
                const orderItem = await this.databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.collections.orderItems,
                    ID.unique(),
                    {
                        orderId: orderId,
                        menuItemId: item.menuItemId,
                        quantity: parseInt(item.quantity),
                        price: parseFloat(item.price),
                        subtotal: parseFloat(item.quantity * item.price),
                        specialRequests: item.specialRequests || ''
                    }
                );
                orderItems.push(orderItem);
            }
            return orderItems;
        } catch (error) {
            console.error('Error adding order items:', error);
            throw error;
        }
    }

    // Get order by ID with items
    async getOrder(orderId) {
        try {
            const order = await this.databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                orderId
            );

            // Get order items
            const orderItems = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orderItems,
                [Query.equal('orderId', orderId)]
            );

            return {
                ...order,
                items: orderItems.documents
            };
        } catch (error) {
            console.error('Error getting order:', error);
            throw error;
        }
    }

    // Get orders for a user
    async getUserOrders(userId, limit = 25, offset = 0) {
        try {
            const orders = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
            return orders;
        } catch (error) {
            console.error('Error getting user orders:', error);
            throw error;
        }
    }

    // Get all orders (admin)
    async getAllOrders(status = null, limit = 50, offset = 0) {
        try {
            const queries = [
                Query.orderDesc('$createdAt'),
                Query.limit(limit),
                Query.offset(offset)
            ];

            if (status) {
                queries.push(Query.equal('status', status));
            }

            const orders = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                queries
            );
            return orders;
        } catch (error) {
            console.error('Error getting all orders:', error);
            throw error;
        }
    }

    // Update order status
    async updateOrderStatus(orderId, status, estimatedDeliveryTime = null) {
        try {
            const updateData = { status };
            if (estimatedDeliveryTime) {
                updateData.estimatedDeliveryTime = estimatedDeliveryTime;
            }

            const order = await this.databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                orderId,
                updateData
            );
            return order;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    // Update payment status
    async updatePaymentStatus(orderId, paymentStatus, transactionId = null) {
        try {
            const updateData = { paymentStatus };
            if (transactionId) {
                updateData.transactionId = transactionId;
            }

            const order = await this.databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                orderId,
                updateData
            );
            return order;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }

    // Get today's orders
    async getTodaysOrders() {
        try {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            const endOfDay = new Date(today.setHours(23, 59, 59, 999));

            const orders = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                [
                    Query.greaterThanEqual('$createdAt', startOfDay.toISOString()),
                    Query.lessThanEqual('$createdAt', endOfDay.toISOString()),
                    Query.orderDesc('$createdAt')
                ]
            );
            return orders;
        } catch (error) {
            console.error('Error getting today\'s orders:', error);
            throw error;
        }
    }

    // Get order statistics
    async getOrderStats(startDate = null, endDate = null) {
        try {
            const queries = [Query.orderDesc('$createdAt')];
            
            if (startDate) {
                queries.push(Query.greaterThanEqual('$createdAt', startDate));
            }
            if (endDate) {
                queries.push(Query.lessThanEqual('$createdAt', endDate));
            }

            const orders = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                queries
            );

            const stats = {
                totalOrders: orders.total,
                totalRevenue: 0,
                averageOrderValue: 0,
                ordersByStatus: {},
                ordersByType: {}
            };

            orders.documents.forEach(order => {
                stats.totalRevenue += order.total;
                
                // Count by status
                stats.ordersByStatus[order.status] = 
                    (stats.ordersByStatus[order.status] || 0) + 1;
                
                // Count by type
                stats.ordersByType[order.orderType] = 
                    (stats.ordersByType[order.orderType] || 0) + 1;
            });

            stats.averageOrderValue = stats.totalOrders > 0 
                ? stats.totalRevenue / stats.totalOrders 
                : 0;

            return stats;
        } catch (error) {
            console.error('Error getting order statistics:', error);
            throw error;
        }
    }

    // Cancel order
    async cancelOrder(orderId, reason = '') {
        try {
            const order = await this.databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                orderId,
                {
                    status: 'cancelled',
                    cancellationReason: reason
                }
            );
            return order;
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    }

    // Search orders
    async searchOrders(searchTerm, limit = 25) {
        try {
            const orders = await this.databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                [
                    Query.search('customerName', searchTerm),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit)
                ]
            );
            return orders;
        } catch (error) {
            console.error('Error searching orders:', error);
            throw error;
        }
    }
}

export const orderService = new OrderService();
