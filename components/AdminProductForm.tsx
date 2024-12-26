import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import Image from 'next/image';
import { useWalletContext } from '../context/WalletContext';

interface StoreItem {
  _id?: string;  // Changed from id: number to _id?: string for MongoDB
  name: string;
  price: number;
  image: string;
}

const initialItem: Omit<StoreItem, '_id'> = {
  name: '',
  price: 0,
  image: ''
};

const AdminProductForm = () => {
  const { convertUSDToKT } = useWalletContext();
  const [item, setItem] = useState<Omit<StoreItem, '_id'>>(initialItem);
  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/store-items');
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError('Failed to load items. Please refresh the page.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: name === 'price' ? parseInt(value) || 0 : value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      const base64String = await convertFileToBase64(file);
      setItem(prev => ({
        ...prev,
        image: base64String
      }));
    } catch (err) {
      setError('Failed to process image. Please try again.');
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const validateItem = (data: Omit<StoreItem, '_id'>): boolean => {
    if (!data.name || data.name.trim() === '') {
      setError('Product name is required');
      return false;
    }
    if (data.price <= 0) {
      setError('Price must be greater than 0');
      return false;
    }
    if (!data.image) {
      setError('Product image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateItem(item)) {
      return;
    }

    setLoading(true);

    try {
      if (editingId !== null) {
        // Update existing item
        const response = await fetch(`/api/store-items/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          throw new Error('Failed to update item');
        }

        setSuccess('Item updated successfully');
      } else {
        // Add new item
        const response = await fetch('/api/store-items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          throw new Error('Failed to add item');
        }

        setSuccess('Item added successfully');
      }

      // Refresh the items list
      await fetchItems();
      
      // Reset form
      setItem(initialItem);
      setEditingId(null);
    } catch (err) {
      setError('Failed to save item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (editItem: StoreItem) => {
    if (!editItem._id) return;
    
    setItem({
      name: editItem.name,
      price: editItem.price,
      image: editItem.image
    });
    setEditingId(editItem._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/store-items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      await fetchItems();
      setSuccess('Item deleted successfully');
    } catch (error) {
      setError('Failed to delete item. Please try again.');
    }
  };

  const handleCancel = () => {
    setItem(initialItem);
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {editingId !== null ? 'Edit Store Item' : 'Add New Store Item'}
          </h2>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 text-green-700">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={item.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                Price
              </label>
              <div className="space-y-2">
                <input
                  type="number"
                  name="price"
                  value={item.price}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter price in USD"
                />
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  USD: ${item.price.toFixed(2)}
                  <br />
                  KT: {convertUSDToKT(item.price).toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                Product Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {item.image && (
                <div className="mt-2 relative w-32 h-32">
                  <Image
                    src={item.image}
                    alt="Product preview"
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2 px-4 rounded-full text-white ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Saving...' : editingId !== null ? 'Update Item' : 'Add Item'}
              </button>
              
              {editingId !== null && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-2 px-4 rounded-full text-gray-700 bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Store Items</h2>
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No items added yet</p>
          ) : (
            <div className="space-y-4">
              {items.map((storeItem) => (
                <div key={storeItem._id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="relative w-20 h-20">
                    <Image
                      src={storeItem.image}
                      alt={storeItem.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{storeItem.name}</h4>
                    <div>
                      <p className="text-blue-500">${storeItem.price.toFixed(2)} USD</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{convertUSDToKT(storeItem.price).toLocaleString()} KT</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => storeItem._id && handleEdit(storeItem)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => storeItem._id && handleDelete(storeItem._id)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;
