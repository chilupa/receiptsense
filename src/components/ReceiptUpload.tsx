"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";

export default function ReceiptUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [progress, setProgress] = useState("");
  const [editing, setEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [editedStoreName, setEditedStoreName] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setProgress("Processing image...");

    try {
      // Client-side OCR
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: m => setProgress(`OCR: ${m.status} ${Math.round(m.progress * 100)}%`)
      });

      setProgress("Sending to server...");

      // Send extracted text to server
      const formData = new FormData();
      formData.append('extractedText', text);
      formData.append('storeName', storeName || 'Unknown Store');

      const response = await fetch('/api/upload-receipt', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setResult(data);
      setEditedItems(data.items || []);
      setEditedStoreName(storeName || 'Unknown Store');
      setProgress("Complete!");
      
      // Clear form
      setFile(null);
      setStoreName("");
    } catch (error) {
      console.error('Upload error:', error);
      setProgress("Error processing receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!result?.receiptId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/receipts/${result.receiptId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: editedItems,
          storeName: editedStoreName
        })
      });

      if (response.ok) {
        const updatedData = await response.json();
        setResult(updatedData);
        setEditing(false);
        setProgress("Updated successfully!");
      }
    } catch (error) {
      console.error('Edit error:', error);
      setProgress("Error updating receipt");
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...editedItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditedItems(updated);
  };

  const removeItem = (index: number) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Receipt</h2>
      
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Store name (optional)"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? progress : "Upload Receipt"}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-green-800">Receipt Processed!</h3>
              {!editing ? (
                <button
                  onClick={handleEdit}
                  className="text-blue-600 hover:text-blue-700 text-sm underline"
                >
                  Edit
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="text-green-600 hover:text-green-700 text-sm underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="text-gray-600 hover:text-gray-700 text-sm underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editedStoreName}
                  onChange={(e) => setEditedStoreName(e.target.value)}
                  placeholder="Store name"
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                {editedItems.map((item: any, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(i, 'name', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(i, 'price', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => removeItem(i)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-green-700 mb-2">Store: {editedStoreName}</p>
                <p className="text-green-700 mb-2">Found {editedItems.length} items</p>
                {editedItems.map((item: any, i: number) => (
                  <div key={i} className="text-sm text-green-600">
                    {item.name}: ${item.price.toFixed(2)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}