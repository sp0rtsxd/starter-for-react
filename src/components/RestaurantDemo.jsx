import { useState, useEffect } from 'react';
import { databases, DATABASE_ID } from '../lib/appwrite';
import { authService } from '../lib/authService';
import { menuService } from '../lib/menuService';
import { AppwriteException } from 'appwrite';

function RestaurantDemo() {
  const [status, setStatus] = useState('idle');
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  // Test function to check database connectivity
  const testDatabaseConnection = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Try to list documents from a collection
      const result = await databases.listDocuments(DATABASE_ID, 'menuItems');
      setMenuItems(result.documents || []);
      setStatus('success');
    } catch (err) {
      console.log('Database test error (expected if no collections exist yet):', err);
      if (err instanceof AppwriteException) {
        if (err.code === 404) {
          setError('Database or collection not found - this is expected for a new project');
          setStatus('warning');
        } else {
          setError(err.message);
          setStatus('error');
        }
      } else {
        setError('Failed to connect to database');
        setStatus('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const testMenuService = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const items = await menuService.getMenuItems();
      setMenuItems(items.documents || []);
      setStatus('success');
    } catch (err) {
      setError(`Menu service test failed: ${err.message}`);
      setStatus('warning');
    } finally {
      setLoading(false);
    }
  };

  const testCategoriesService = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const cats = await menuService.getCategories();
      setCategories(cats.documents || []);
      setStatus('success');
    } catch (err) {
      setError(`Categories service test failed: ${err.message}`);
      setStatus('warning');
    } finally {
      setLoading(false);
    }
  };

  const testAuthentication = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Test auth by checking current user
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setStatus('success');
      } else {
        setError('No authenticated user found. Authentication service is working but no user is logged in.');
        setStatus('warning');
      }
    } catch (err) {
      setError(`Authentication test failed: ${err.message}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🍤 Khmer Seafood Restaurant - Appwrite Integration Demo
        </h2>
        
        {/* User Status */}
        {user && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-green-800 font-medium">Authenticated User:</h3>
            <p className="text-green-700 text-sm">
              {user.name} ({user.email}) - ID: {user.$id}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Database Connection Test */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Database Connection</h3>
            <button
              onClick={testDatabaseConnection}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded mb-3"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </button>
            
            <div className="text-sm text-gray-600">
              Test direct database connectivity
            </div>
          </div>

          {/* Authentication Test */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Authentication</h3>
            <button
              onClick={testAuthentication}
              disabled={loading}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded mb-3"
            >
              {loading ? 'Testing...' : 'Test Auth'}
            </button>
            
            <div className="text-sm text-gray-600">
              Check authentication service
            </div>
          </div>

          {/* Menu Service Test */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Menu Service</h3>
            <button
              onClick={testMenuService}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded mb-3"
            >
              {loading ? 'Testing...' : 'Test Menu'}
            </button>
            
            <div className="text-sm text-gray-600">
              Test menu items service
            </div>
          </div>

          {/* Categories Service Test */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Categories</h3>
            <button
              onClick={testCategoriesService}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded mb-3"
            >
              {loading ? 'Testing...' : 'Test Categories'}
            </button>
            
            <div className="text-sm text-gray-600">
              Test categories service
            </div>
          </div>
        </div>

        {/* Status Display */}
        {status !== 'idle' && (
          <div className="mb-6">
            {status === 'success' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-green-600 font-medium">
                  ✅ Test completed successfully!
                </div>
              </div>
            )}
            
            {status === 'warning' && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-yellow-600 font-medium">
                  ⚠️ Test completed with warnings
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600 font-medium">
                  ❌ Test failed
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-red-800 font-medium">Error Details:</h4>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Results Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Categories Display */}
          {categories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Categories ({categories.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.$id} className="border border-gray-200 rounded p-3">
                    <h4 className="font-medium">{category.name}</h4>
                    {category.description && (
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    )}
                    <p className="text-xs text-gray-500">Order: {category.displayOrder}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Menu Items Display */}
          {menuItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Menu Items ({menuItems.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {menuItems.map((item) => (
                  <div key={item.$id} className="border border-gray-200 rounded p-3">
                    <h4 className="font-medium">{item.name}</h4>
                    {item.description && (
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    )}
                    {item.price && (
                      <p className="text-green-600 font-medium">${item.price}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-blue-800 font-medium mb-2">Next Steps:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>1. ✅ Basic Appwrite connectivity established</li>
            <li>2. ✅ Service architecture implemented</li>
            <li>3. ⏳ Set up database collections in Appwrite console</li>
            <li>4. ⏳ Configure authentication methods</li>
            <li>5. ⏳ Create storage buckets for images</li>
            <li>6. ⏳ Import menu data from existing system</li>
            <li>7. ⏳ Integrate with main restaurant application</li>
          </ul>
        </div>

        {/* Back to Main Demo */}
        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="inline-block bg-[#FD366E] text-white px-6 py-2 rounded hover:bg-[#e02c5a] transition-colors"
          >
            ← Back to Appwrite Ping Demo
          </a>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDemo;
