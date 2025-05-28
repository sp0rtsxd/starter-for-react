import { account, databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { ID } from 'appwrite';

class AuthService {
  async getCurrentUser() {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  }

  async login(email, password) {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(email, password, name) {
    try {
      const userId = ID.unique();
      
      // Create account
      await account.create(userId, email, password, name);
      
      // Create session
      await this.login(email, password);
      
      // Create user profile in database
      try {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          userId,
          {
            email,
            name,
            role: 'customer',
            createdAt: new Date().toISOString()
          }
        );
      } catch (dbError) {
        console.warn('User profile creation failed (collection may not exist):', dbError);
      }
      
      return await this.getCurrentUser();
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async logout() {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  async updateProfile(userId, data) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        data
      );
    } catch (error) {
      throw new Error(error.message || 'Profile update failed');
    }
  }
  // Real-time authentication state change listener
  onAuthStateChange(callback) {
    // Check current auth state immediately
    this.getCurrentUser().then(user => {
      callback(user);
    });

    // Set up interval to check auth state changes
    const interval = setInterval(async () => {
      try {
        const user = await this.getCurrentUser();
        callback(user);
      } catch (error) {
        callback(null);
      }
    }, 30000); // Check every 30 seconds

    // Return unsubscribe function
    return () => {
      clearInterval(interval);
    };
  }
}

export const authService = new AuthService();
export default authService;
