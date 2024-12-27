import { useState, useCallback, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TransactionError } from '../utils/solana-utils';
import { getDonationProgress, sendTokens, getTokenBalance } from '../utils/solana-transactions';
import { UI_CONFIG } from '../config/constants';
import { ErrorMessage } from '../types';

export const useDonation = () => {
  const { connection } = useConnection();
  const { connected, publicKey, signTransaction } = useWallet();
  const [currentAmount, setCurrentAmount] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorMessage | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);

  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
  }, [connected]);

  const fetchBalances = useCallback(async () => {
    try {
      // Always fetch donation progress regardless of wallet connection
      const progress = await getDonationProgress();
      setCurrentAmount(progress);

      // Only fetch user balance if wallet is connected
      if (connected && publicKey) {
        const balance = await getTokenBalance(publicKey.toString());
        setUserBalance(balance);
      } else {
        setUserBalance(0);
      }
    } catch (err) {
      console.error('Error fetching balances:', err);
    }
  }, [connected, publicKey]);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, UI_CONFIG.refreshInterval);
    return () => clearInterval(interval);
  }, [fetchBalances]);

  const showError = (message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    setError({ message, type });
    if (type !== 'error') {
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDonate = async (amount: number) => {
    if (!connected || !publicKey) {
      showError('Please connect your wallet first', 'warning');
      return;
    }

    if (amount <= 0) {
      showError('Please enter a valid amount', 'warning');
      return;
    }

    if (amount > userBalance) {
      showError('Insufficient balance in your wallet', 'warning');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Wrap the entire donation process in a try-catch to handle rejections early
      const result = await Promise.resolve().then(async () => {
        try {
          return await sendTokens(
            amount,
            { publicKey, signTransaction }
          );
        } catch (error: any) {
          // Handle user rejection immediately
          if (error?.message?.includes('User rejected') || 
              error?.code === 4001 ||
              error?.name === 'WalletSignTransactionError' ||
              error?.message?.includes('rejected the request')) {
            console.log('Transaction cancelled by user');
            return 'USER_CANCELLED';
          }
          throw error;
        }
      });

      // Handle user cancellation with info message
      if (result === 'USER_CANCELLED') {
        showError('Transaction cancelled', 'info');
        return;
      }

      // Update balances and UI state together
      await fetchBalances();
      setCustomAmount('');
      setSuccessMessage(`Successfully donated ${amount.toLocaleString()} KT!`);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (err: any) {
      console.error('Donation error:', err);
      
      // Enhanced error handling
      if (err instanceof TransactionError) {
        switch (err.code) {
          case 'USER_REJECTED':
            showError('Transaction cancelled', 'info');
            break;
          case 'INSUFFICIENT_FUNDS':
            showError('Insufficient funds in your wallet', 'warning');
            break;
          case 'WALLET_ERROR':
            showError('Please reconnect your wallet and try again', 'warning');
            break;
          case 'NETWORK_ERROR':
            showError('Network error. Please try again', 'warning');
            break;
          case 'SIGNING_ERROR':
            showError('Failed to sign transaction. Please try again', 'warning');
            break;
          case 'TIMEOUT_ERROR':
            showError('Transaction timed out. Please try again', 'warning');
            break;
          case 'RATE_LIMIT':
            showError('Service is busy. Please try again in a moment', 'warning');
            break;
          default:
            showError(err.message || 'An unexpected error occurred', 'error');
        }
      } else {
        // Handle any other errors as warnings to maintain user-friendly experience
        showError('Failed to process donation. Please try again', 'warning');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || Number(value) >= 0) {
      setCustomAmount(value);
      setError(null);
    }
  };

  return {
    currentAmount,
    customAmount,
    isLoading,
    error,
    successMessage,
    userBalance,
    connected,
    handleDonate,
    handleCustomAmountChange,
  };
};
