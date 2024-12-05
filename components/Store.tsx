import Image from 'next/image';
import { useState } from 'react';
import { useWalletContext } from '../context/WalletContext';
import toast from 'react-hot-toast';

interface StoreItem {
  id: number;
  name: string;
  price: number;
  image: string;
}

const storeItems: StoreItem[] = [
  {
    id: 1,
    name: "KT Limited Edition T-Shirt",
    price: 500,
    image: "/467970237_956852316472370_5862938173089959610_n.jpg"
  },
  {
    id: 2,
    name: "KT Edition Smartwatch",
    price: 2000,
    image: "/Qmc1qdSe7y82kR7rbWgPLD1poWXnQXHFxjJbRLwUJgSaF7.jpg"
  },
  {
    id: 3,
    name: "KT Digital Wallet",
    price: 1500,
    image: "/QtrtTlC53zGn37ZQqGOM.webp"
  }
];

const Store = () => {
  const { isConnected, walletAddress, ktBalance, error: walletError, isLoading, checkKTBalance } = useWalletContext();
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (item: StoreItem) => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setPurchasing(item.id);
      setError(null);

      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Processing purchase for ${item.name} from wallet ${walletAddress}`);

      // Simulating the alchemy error response
      const response = {
        request_id: "8562c39d7a",
        error: "couldn't complete the request, try again later"
      };

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success(`Successfully purchased ${item.name}!`);
      // Refresh balance after purchase
      checkKTBalance();
    } catch (err) {
      console.error('Purchase error:', err);
      toast.error('Failed to complete request. Please try again later.');
      setError('Failed to complete purchase. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <section id="store" className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-16">
          <h2 className="text-5xl font-bold">KT Token Store</h2>
          {isConnected && (
            <div className="bg-gray-800/50 px-6 py-3 rounded-full backdrop-blur-md">
              <p className="text-lg">
                {isLoading ? (
                  <span className="text-blue-400">Syncing wallet...</span>
                ) : ktBalance !== null ? (
                  <>
                    Balance: <span className="text-blue-400 font-bold">{ktBalance.toLocaleString()} KT</span>
                  </>
                ) : (
                  <span className="text-gray-400">No KT tokens found</span>
                )}
              </p>
            </div>
          )}
        </div>
        
        {(error || walletError) && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-lg mb-6">
            {error || walletError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {storeItems.map((item) => (
            <div key={item.id} className="card bg-gray-800/50 p-6 rounded-xl backdrop-blur-md hover:bg-gray-800/70 transition-all">
              <div className="relative w-full h-64 mb-6 overflow-hidden rounded-lg group">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">{item.name}</h3>
              <p className="text-2xl font-bold text-blue-400 mb-4">{item.price} KT</p>
              <button
                onClick={() => handlePurchase(item)}
                disabled={!isConnected || purchasing !== null || isLoading}
                className={`
                  w-full text-white text-center py-3 rounded-full transition-all transform
                  ${!isConnected 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : isLoading
                      ? 'bg-blue-800 cursor-wait'
                      : purchasing === item.id
                        ? 'bg-blue-800 cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                  }
                `}
              >
                {!isConnected 
                  ? 'Connect Wallet to Buy' 
                  : isLoading
                    ? 'Syncing Wallet...'
                    : purchasing === item.id
                      ? 'Processing...'
                      : 'Buy with KT Token'
                }
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Store;
