import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useWalletContext } from '../context/WalletContext';
import { useCart, CartItem } from '../context/CartContext';
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

const Store: React.FC = () => {
  const router = useRouter();
  const { isConnected, walletAddress, ktBalance, error: walletError, isLoading } = useWalletContext();
  const { items, addToCart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (item: StoreItem) => {
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

    addToCart(item);
    toast.success(`Added ${item.name} to cart`);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const CartIcon = () => (
    <div 
      className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
      onClick={() => setIsCartOpen(true)}
    >
      <div className="relative">
        <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </div>
    </div>
  );

  const Cart = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl transform transition-transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">Your Cart</h3>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-8">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="relative w-20 h-20">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-blue-500">{item.price.toLocaleString()} KT</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          -
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-blue-500">{totalPrice.toLocaleString()} KT</span>
              </div>
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition-colors"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

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

        {/* KT Token Information Section */}
        <div className="mb-16 bg-gray-800/50 p-8 rounded-xl backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">KT Token</h3>
              <p className="text-gray-300 mb-6">
                The KT Token is a unique digital asset that powers our ecosystem. Built on the Solana blockchain,
                it offers fast transactions and low fees while providing exclusive benefits to holders.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Exclusive access to merchandise</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Early access to new releases</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Community governance rights</span>
                </div>
              </div>
            </div>
            <div className="relative h-64 rounded-xl overflow-hidden">
              <Image
                src="/QtrtTlC53zGn37ZQqGOM.webp"
                alt="KT Token"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          </div>
        </div>
        
        {(error || walletError) && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-6 py-4 rounded-lg mb-8">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p>{error || walletError}</p>
            </div>
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
                onClick={() => handleAddToCart(item)}
                disabled={!isConnected || isLoading}
                className={`
                  w-full text-white text-center py-3 rounded-full transition-all transform
                  flex items-center justify-center gap-2
                  ${!isConnected 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : isLoading
                      ? 'bg-blue-800 cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                  }
                `}
              >
                {!isConnected 
                  ? 'Connect Wallet to Add to Cart' 
                  : isLoading
                    ? 'Syncing Wallet...'
                    : 'Add to Cart'
                }
              </button>
            </div>
          ))}
        </div>
      </div>
      <CartIcon />
      <Cart />
    </section>
  );
};

export default Store;
