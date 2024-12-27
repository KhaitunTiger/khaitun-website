import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';

interface SolanaWallet {
  solanaAddress: string;
  error: string;
  fetchSavedAddresses: (address: string) => Promise<void>;
}

export const useSolanaWallet = (): SolanaWallet => {
  const [solanaAddress, setSolanaAddress] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const getSolanaWallet = async () => {
      try {
        if (typeof window !== 'undefined' && (window as any).solana) {
          const provider = (window as any).solana;
          
          const resp = await provider.connect();
          const address = resp.publicKey.toString();
          
          if (isValidSolanaAddress(address)) {
            setSolanaAddress(address);
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
      // Handle the fetched addresses as needed
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const isValidSolanaAddress = (address: string): boolean => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };

  return { solanaAddress, error, fetchSavedAddresses };
};
