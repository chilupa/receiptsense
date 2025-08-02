'use client';

import { useState, useEffect } from 'react';

interface ReceiptItem {
  id: string;
  name: string;
  price: number;
}

interface Receipt {
  id: string;
  storeName: string;
  items: ReceiptItem[];
  timestamp: string;
}

export default function ReceiptHistory() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await fetch('/api/receipts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch receipts');
      }

      const data = await response.json();
      setReceipts(data.sort((a: Receipt, b: Receipt) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (err) {
      setError('Failed to load receipt history');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (receiptId: string) => {
    setConfirmDelete(receiptId);
  };

  const confirmDeleteReceipt = async () => {
    if (!confirmDelete) return;

    setDeleting(confirmDelete);
    setConfirmDelete(null);
    
    try {
      const response = await fetch(`/api/receipts/${confirmDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete receipt');
      }

      // Remove from local state
      setReceipts(prev => prev.filter(receipt => receipt.id !== confirmDelete));
    } catch (err) {
      setError('Failed to delete receipt');
      console.error('Delete error:', err);
    } finally {
      setDeleting(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotal = (items: ReceiptItem[]) => {
    return items.reduce((sum, item) => sum + item.price, 0);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500">Loading receipt history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchReceipts}
            className="mt-2 text-red-700 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Receipt History</h2>
        <button
          onClick={fetchReceipts}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Refresh
        </button>
      </div>

      {receipts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts yet</h3>
          <p className="text-gray-500">Upload your first receipt to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">📊 Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{receipts.length}</div>
                <div className="text-sm text-gray-600">Total Receipts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${receipts.reduce((sum, receipt) => sum + calculateTotal(receipt.items), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {receipts.reduce((sum, receipt) => sum + receipt.items.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  ${receipts.length > 0 ? (receipts.reduce((sum, receipt) => sum + calculateTotal(receipt.items), 0) / receipts.length).toFixed(2) : '0.00'}
                </div>
                <div className="text-sm text-gray-600">Avg per Receipt</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {receipts.map((receipt) => (
              <div key={receipt.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {receipt.storeName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(receipt.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      ${calculateTotal(receipt.items).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {receipt.items.length} items
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="grid gap-2 max-h-40 overflow-y-auto mb-3">
                    {receipt.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteClick(receipt.id)}
                      disabled={deleting === receipt.id}
                      className="text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50 text-sm underline"
                      title="Delete receipt"
                    >
                      {deleting === receipt.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Custom Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Receipt?
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this receipt? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReceipt}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}