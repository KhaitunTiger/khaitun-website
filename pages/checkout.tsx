import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';

interface Address {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export default function Checkout() {
  const router = useRouter();
  const { items: cart } = useCart();
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('new');
  const [formData, setFormData] = useState<Address>({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    try {
      // In a real app, you'd get the userId from auth context
      const userId = 'test-user';
      const response = await fetch(`/api/addresses?userId=${userId}`);
      const data = await response.json();
      setSavedAddresses(data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedAddress(value);
    if (value !== 'new') {
      const address = savedAddresses.find(addr => addr.fullName === value);
      if (address) {
        setFormData(address);
      }
    } else {
      setFormData({
        fullName: '',
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (selectedAddress === 'new') {
        // Save new address
        const response = await fetch('/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            userId: 'test-user' // In a real app, get from auth context
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save address');
        }
      }

      // Here you would typically:
      // 1. Process the order
      // 2. Handle payment
      // 3. Clear cart
      // 4. Redirect to order confirmation

      router.push('/order-confirmation');
    } catch (err) {
      setError('Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <p className="text-center text-gray-600">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Checkout</h2>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {savedAddresses.length > 0 && (
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Select Address
              </label>
              <select
                className="w-full p-2 border rounded"
                value={selectedAddress}
                onChange={handleAddressSelect}
              >
                <option value="new">Use New Address</option>
                {savedAddresses.map((addr, index) => (
                  <option key={index} value={addr.fullName}>
                    {addr.fullName} - {addr.streetAddress}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleInputChange}
                required
                className="w-full p-2 border rounded"
                placeholder="Enter your street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                  placeholder="Enter postal code"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border rounded"
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : 'Complete Checkout'}
          </button>
        </form>
      </div>
    </div>
  );
}
