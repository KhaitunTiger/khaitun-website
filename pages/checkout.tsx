import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../context/CartContext';
import { useWalletContext } from '../context/WalletContext';
import { PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { EnhancedConnection } from '../utils/solana-utils';
import AddressForm from '../components/AddressForm';
import CartDisplay from '../components/CartDisplay';
import WalletInfo from '../components/WalletInfo';
import TokenSelection from '../components/TokenSelection';
import ErrorDisplay from '../components/ErrorDisplay';

declare global {
  interface Window {
    solana?: {
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      publicKey: PublicKey;
      signTransaction: (transaction: Transaction) => Promise<Transaction>;
      isPhantom?: boolean;
    };
  }
}

// Token addresses
const KT_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_KT_TOKEN_ADDRESS as string;
const USDT_TOKEN_ADDRESS = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";
const KAPI_TOKEN_ADDRESS = "J2Zgqgim2biihmV6rzadRbdKAuKHxHy61aQCydfWpump";
const RECIPIENT_ADDRESS = "6nWu5k18T8Va9tx3LXQ9eoBBKGpgjhp8JVbHj9eMoSvm";

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
  const { ktBalance, usdcBalance, kapiBalance, convertUSDToKT, kapiUsdRate } = useWalletContext();
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
  const [selectedToken, setSelectedToken] = useState<'kt' | 'usdc' | 'kapi'>('kt');

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

  const handleTokenSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedToken(e.target.value as 'kt' | 'usdc' | 'kapi');
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

    // Check if user has sufficient balance
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const requiredAmount = selectedToken === 'kt'
      ? convertUSDToKT(total)
      : selectedToken === 'kapi'
        ? total / kapiUsdRate
        : total;

    const currentBalance = selectedToken === 'kt'
      ? ktBalance
      : selectedToken === 'usdc'
        ? usdcBalance
        : kapiBalance;

    if (!currentBalance || currentBalance < requiredAmount) {
      setError(`Insufficient ${selectedToken.toUpperCase()} balance`);
      return;
    }

    setLoading(true);
    setError('');

    // Create token transfer transaction using EnhancedConnection
    const connection = new EnhancedConnection(process.env.NEXT_PUBLIC_ALCHEMY_ENDPOINT!);
    console.log(`Initiating transfer of ${requiredAmount} ${selectedToken.toUpperCase()} to ${RECIPIENT_ADDRESS}`);
    const provider = window.solana;
    if (!provider) {
      throw new Error('Wallet not connected');
    }

    const recipientAddress = new PublicKey(RECIPIENT_ADDRESS);
    const tokenMint = new PublicKey(
      selectedToken === 'kt'
        ? KT_TOKEN_ADDRESS
        : selectedToken === 'usdc'
          ? USDT_TOKEN_ADDRESS
          : KAPI_TOKEN_ADDRESS
    );

    // Get associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      provider.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      recipientAddress,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Check if recipient's token account exists
    const recipientAccountInfo = await connection.getAccountInfo(toTokenAccount);

    // Create transaction
    const transaction = new Transaction();

    // If recipient token account doesn't exist, add creation instruction
    if (!recipientAccountInfo) {
      console.log('Creating associated token account for recipient');
      const createAtaInstruction = createAssociatedTokenAccountInstruction(
        provider.publicKey, // payer
        toTokenAccount, // ata
        recipientAddress, // owner
        tokenMint, // mint
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      transaction.add(createAtaInstruction);
    }

    // Add transfer instruction
    const transferInstruction = createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      provider.publicKey,
      Math.floor(requiredAmount * Math.pow(10, 6)), // Convert to smallest token unit (6 decimals)
      [],
      TOKEN_PROGRAM_ID
    );
    transaction.add(transferInstruction);
    transaction.feePayer = provider.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const signed = await provider.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    if (!confirmation?.value) {
      throw new Error('Transaction confirmation failed');
    }
    console.log('Transfer successful:', signature);

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
          tokenAddress: selectedToken === 'kt'
            ? KT_TOKEN_ADDRESS
            : selectedToken === 'usdc'
              ? USDT_TOKEN_ADDRESS
              : KAPI_TOKEN_ADDRESS
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
        tokenAddress: selectedToken === 'kt'
          ? KT_TOKEN_ADDRESS
          : selectedToken === 'usdc'
            ? USDT_TOKEN_ADDRESS
            : KAPI_TOKEN_ADDRESS,
        paymentToken: selectedToken
      }),
    });

    if (!orderResponse.ok) {
      throw new Error('Failed to submit order');
    }

    // Clear the cart after successful order
    clearCart();

    // Redirect to order confirmation
    router.push('/order-confirmation');
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Checkout</h2>

        <CartDisplay cart={cart} convertUSDToKT={convertUSDToKT} kapiUsdRate={kapiUsdRate} recipientAddress={RECIPIENT_ADDRESS} />

        <WalletInfo solanaAddress={solanaAddress} ktBalance={ktBalance} usdcBalance={usdcBalance} kapiBalance={kapiBalance} />

        <TokenSelection selectedToken={selectedToken} handleTokenSelect={handleTokenSelect} />

        <ErrorDisplay error={error} />

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

          <AddressForm formData={formData} handleInputChange={handleInputChange} />

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {loading ? 'Processing Transfer...' : `Transfer ${selectedToken.toUpperCase()} to ${RECIPIENT_ADDRESS.slice(0, 4)}...${RECIPIENT_ADDRESS.slice(-4)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
