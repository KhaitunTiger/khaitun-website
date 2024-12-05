import React, { useState } from 'react';
import Image from 'next/image';
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
    image: "/Handsome_KT.webp"
  },
  {
    id: 2,
    name: "KT KID Edition ",
    price: 2000,
    image: "/KT_kid.webp"
  },
  {
    id: 3,
    name: "KT Water Bottle",
    price: 1500,
    image: "/water_bottle.webp"
  }
];

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const MAX_PURCHASE_RETRIES = 3;
const RETRY_DELAY = 2000;

const Store: React.FC = () => {
  const { isConnected, walletAddress, ktBalance, error: walletError, isLoading, checkKTBalance } = useWalletContext();
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [purchaseRetries, setPurchaseRetries] = useState(0);
  const [retrying, setRetrying] = useState(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const attemptPurchase = async (item: StoreItem): Promise<void> => {
    try {
      // Simulate transaction processing
      await sleep(2000);
      console.log(`Processing purchase for ${item.name} from wallet ${walletAddress}`);

      // Simulating the alchemy error response
      const response = {
        request_id: "8562c39d7a",
        error: "couldn't complete the request, try again later"
      };

      if (response.error) {
        throw new Error(response.error);
      }

      // If successful, reset retries
      setPurchaseRetries(0);
      setRetrying(false);
      toast.success(`Successfully purchased ${item.name}!`);
      checkKTBalance();
    } catch (err) {
      console.error('Purchase error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete request';
      
      if (purchaseRetries < MAX_PURCHASE_RETRIES && errorMessage.includes("couldn't complete the request")) {
        setPurchaseRetries(prev => prev + 1);
        setRetrying(true);
        const retryMessage = `Network busy. Retry attempt ${purchaseRetries + 1}/${MAX_PURCHASE_RETRIES}...`;
        setError(retryMessage);
        toast.error(retryMessage);
        await sleep(RETRY_DELAY);
        return attemptPurchase(item);
      }

      setRetrying(false);
      setPurchaseRetries(0);
      const finalError = purchaseRetries >= MAX_PURCHASE_RETRIES
        ? 'Purchase failed after multiple attempts. Please try again later.'
        : 'Failed to complete purchase. Please try again.';
      setError(finalError);
      toast.error(finalError);
      throw new Error(finalError);
    }
  };

  const handlePurchase = async (item: StoreItem) => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      toast.error("Please connect your wallet to make purchases");
      return;
    }

    if (ktBalance !== null && ktBalance < item.price) {
      setError(`Insufficient balance. You need ${item.price.toLocaleString()} KT to purchase this item.`);
      toast.error("Insufficient balance");
      return;
    }

    try {
      setPurchasing(item.id);
      setError(null);
      setPurchaseRetries(0);
      setRetrying(false);
      await attemptPurchase(item);
    } catch (err) {
      console.error('Purchase handler error:', err);
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <section id="store" className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-16">
          <h2 className="text-5xl font-bold">KT Token Store</h2>
          {isConnected && (
            <div className="bg-gray-800/50 px-6 py-3 rounded-full backdrop-blur-md flex items-center gap-3">
              {isLoading && <LoadingSpinner />}
              <p className="text-lg whitespace-nowrap">
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
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-6 py-4 rounded-lg mb-8">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p>{error || walletError}</p>
            </div>
            {retrying && (
              <div className="mt-2 text-sm text-blue-400 flex items-center gap-2 pl-8">
                <LoadingSpinner />
                <span>Retrying automatically...</span>
              </div>
            )}
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
              <p className="text-2xl font-bold text-blue-400 mb-4">{item.price.toLocaleString()} KT</p>
              <button
                onClick={() => handlePurchase(item)}
                disabled={!isConnected || purchasing !== null || isLoading}
                className={`
                  w-full text-white text-center py-3 rounded-full transition-all transform
                  flex items-center justify-center gap-2
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
                {purchasing === item.id && <LoadingSpinner />}
                {!isConnected 
                  ? 'Connect Wallet to Buy' 
                  : isLoading
                    ? 'Syncing Wallet...'
                    : purchasing === item.id
                      ? retrying ? `Retrying (${purchaseRetries}/${MAX_PURCHASE_RETRIES})...` : 'Processing...'
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
