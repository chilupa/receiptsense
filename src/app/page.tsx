'use client';

import { useState } from 'react';
import ReceiptUpload from '@/components/ReceiptUpload';
import PriceComparison from '@/components/PriceComparison';
import ReceiptHistory from '@/components/ReceiptHistory';

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🧾 ReceiptSense
            </h1>
            <p className="text-gray-600">Analyze your grocery spending patterns</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'upload', label: 'Upload Receipt', icon: '📤' },
              { id: 'compare', label: 'Price Comparison', icon: '💰' },
              { id: 'history', label: 'Receipt History', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow">
          {activeTab === 'upload' && <ReceiptUpload />}
          {activeTab === 'compare' && <PriceComparison />}
          {activeTab === 'history' && <ReceiptHistory />}
        </div>
      </main>
    </div>
  );
}