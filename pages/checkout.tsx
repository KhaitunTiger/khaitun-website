import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';

// Solana token address from environment variable
const KT_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_KT_TOKEN_ADDRESS as string;
if (!KT_TOKEN_ADDRESS) {
  throw new Error('NEXT_PUBLIC_KT_TOKEN_ADDRESS environment variable is not set');
}

interface Address {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  solanaAddress?: string;
}

// Helper function to validate Solana address
const isValidSolanaAddress = (address: string): boolean => {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

export default function Checkout() {
  const router = useRouter();
  const { items: cart, clearCart } = useCart();
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
  const [solanaAddress, setSolanaAddress] = useState<string>('');

  useEffect(() => {
    // Get connected Solana wallet address
    const getSolanaWallet = async () => {
      try {
        if (typeof window !== 'undefined' && (window as any).solana) {
          const provider = (window as any).solana;
          
          // Request wallet connection
          const resp = await provider.connect();
          const address = resp.publicKey.toString();
          
          if (isValidSolanaAddress(address)) {
            setSolanaAddress(address);
            // Fetch addresses for this wallet
            fetchSavedAddresses(address);
          } else {
            setError('Invalid Solana address detected');
          }
        }
      } catch (error) {
        console.error('Failed to connect to Solana wallet:', error);
        setError('Please connect your Solana wallet to continue');
      }
    };

    getSolanaWallet();
  }, []);

  const fetchSavedAddresses = async (address: string) => {
    try {
      const response = await fetch(`/api/addresses?userId=${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
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
    
    if (!solanaAddress) {
      setError('Please connect your Solana wallet to continue');
      return;
    }

    if (!cart || cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save new address if selected
      if (selectedAddress === 'new') {
        const addressResponse = await fetch('/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            userId: solanaAddress,
            solanaAddress,
            tokenAddress: KT_TOKEN_ADDRESS
          }),
        });

        if (!addressResponse.ok) {
          throw new Error('Failed to save address');
        }
      }

      // Submit the order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: formData,
          items: cart,
          solanaAddress,
          tokenAddress: KT_TOKEN_ADDRESS
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to submit order');
      }

      // Clear the cart after successful order
      clearCart();
      
      // Redirect to order confirmation
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

  // Show wallet connection message if wallet is not connected
  if (!solanaAddress) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <p className="text-center text-gray-600 mb-4">Please connect your Solana wallet to continue</p>
          <p className="text-center text-sm text-gray-500">Using token: {KT_TOKEN_ADDRESS}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Checkout</h2>

        {/* Display cart summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-2">
              <span>{item.name} x {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center font-semibold">
              <span>Total</span>
              <span>${cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Display connected wallet address */}
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Connected Solana Wallet</p>
          <p className="text-gray-800 font-mono break-all">{solanaAddress}</p>
          <p className="text-sm text-gray-500 mt-1">Token: {KT_TOKEN_ADDRESS}</p>
        </div>

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
                className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
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
                className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
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
                className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
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
                  className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
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
                  className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
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
                  className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
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
                  className="w-full p-2 border rounded text-gray-900 placeholder-gray-500"
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
