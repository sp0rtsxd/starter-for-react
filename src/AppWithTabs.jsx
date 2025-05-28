import { useState } from 'react';
import RestaurantDemo from './components/RestaurantDemo';

function AppWithTabs() {
  const [activeTab, setActiveTab] = useState('ping');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('ping')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ping'
                  ? 'border-[#FD366E] text-[#FD366E]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Appwrite Ping Demo
            </button>
            <button
              onClick={() => setActiveTab('restaurant')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'restaurant'
                  ? 'border-[#FD366E] text-[#FD366E]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🍤 Restaurant Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'ping' && (
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold mb-4">Appwrite Connection Test</h1>
              <p className="text-gray-600 mb-4">
                This is the original Appwrite ping demo. Use the "Send a ping" button to test your connection.
              </p>
              <a 
                href="/" 
                className="inline-block bg-[#FD366E] text-white px-4 py-2 rounded hover:bg-[#e02c5a]"
              >
                Go to Original Ping Demo
              </a>
            </div>
          </div>
        )}
        
        {activeTab === 'restaurant' && <RestaurantDemo />}
      </div>
    </div>
  );
}

export default AppWithTabs;
