import { databases, storage, DATABASE_ID, COLLECTIONS, STORAGE_BUCKETS, Query } from './appwrite';
import { ID } from 'appwrite';

class MenuService {
  async getCategories() {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CATEGORIES,
        [
          Query.equal('isActive', true),
          Query.orderAsc('displayOrder')
        ]
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch categories');
    }
  }

  async getMenuItems(categoryId = null) {
    try {
      const queries = [Query.equal('isAvailable', true)];
      
      if (categoryId) {
        queries.push(Query.equal('categoryId', categoryId));
      }

      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MENU_ITEMS,
        queries
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch menu items');
    }
  }

  async getMenuItemById(itemId) {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.MENU_ITEMS,
        itemId
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch menu item');
    }
  }

  async createMenuItem(itemData, imageFile = null) {
    try {
      let imageId = null;
      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        const uploadResult = await storage.createFile(
          STORAGE_BUCKETS.IMAGES,
          ID.unique(),
          imageFile
        );
        imageId = uploadResult.$id;
        imageUrl = this.getImageUrl(imageId);
      }

      // Create menu item document
      const menuItem = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MENU_ITEMS,
        ID.unique(),
        {
          ...itemData,
          imageId,
          imageUrl,
          createdAt: new Date().toISOString()
        }
      );

      return menuItem;
    } catch (error) {
      throw new Error(error.message || 'Failed to create menu item');
    }
  }

  async updateMenuItem(itemId, itemData, imageFile = null) {
    try {
      let updateData = { ...itemData };

      // Upload new image if provided
      if (imageFile) {
        const uploadResult = await storage.createFile(
          STORAGE_BUCKETS.IMAGES,
          ID.unique(),
          imageFile
        );
        updateData.imageId = uploadResult.$id;
        updateData.imageUrl = this.getImageUrl(uploadResult.$id);
      }

      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.MENU_ITEMS,
        itemId,
        updateData
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to update menu item');
    }
  }

  async deleteMenuItem(itemId) {
    try {
      return await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.MENU_ITEMS,
        itemId
      );
    } catch (error) {
      throw new Error(error.message || 'Failed to delete menu item');
    }
  }

  getImageUrl(fileId, width = 400, height = 300) {
    try {
      return storage.getFilePreview(
        STORAGE_BUCKETS.IMAGES,
        fileId,
        width,
        height
      );
    } catch (error) {
      console.error('Error getting image URL:', error);
      return null;
    }
  }

  async searchMenuItems(searchTerm) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MENU_ITEMS,
        [
          Query.search('name', searchTerm),
          Query.equal('isAvailable', true)
        ]
      );
    } catch (error) {
      throw new Error(error.message || 'Search failed');
    }
  }
}

export const menuService = new MenuService();
export default menuService;
