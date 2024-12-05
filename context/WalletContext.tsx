import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface WalletContextType {
  connectWallet: () => Promise<void>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  walletAddress: string | null;
  ktBalance: number | null;
  daysAfterWhitepaper: number | null;
  holdingPeriodDays: number | null;
  checkKTBalance: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType>({
  connectWallet: async () => {},
  disconnect: async () => {},
  isConnected: false,
  walletAddress: null,
  ktBalance: null,
  daysAfterWhitepaper: null,
  holdingPeriodDays: null,
  checkKTBalance: async () => {},
  error: null,
  isLoading: false,
});

const KT_TOKEN_ADDRESS = 'EStPXF2Mh3NVEezeysYfhrWXnuqwmbmjqLSP9vR5pump';
const WHITEPAPER_DATE = new Date('2024-01-01');
const MIN_KT_REQUIRED = 100000;
const RETRY_DELAY = 2000; // 2 seconds

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ktBalance, setKTBalance] = useState<number | null>(null);
  const [daysAfterWhitepaper, setDaysAfterWhitepaper] = useState<number | null>(null);
  const [holdingPeriodDays, setHoldingPeriodDays] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    const checkRequirements = async () => {
      if (isConnected && walletAddress) {
        console.log('Checking balance for wallet:', walletAddress);
        try {
          await checkKTBalance();
        } catch (err) {
          console.error('Balance check error:', err);
          toast.error(String(err));
        }
      }
    };
    checkRequirements();
  }, [isConnected, walletAddress]);

  const fetchKTBalance = async (retryCount = 0): Promise<any> => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_ALCHEMY_ENDPOINT!, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            walletAddress,
            {
              mint: KT_TOKEN_ADDRESS
            },
            {
              encoding: 'jsonParsed'
            }
          ]
        })
      });

      const data = await response.json();
      console.log('error', data.error);
      if (data.error?.includes("couldn't complete the request")) {
        const retryMessage = `Network is experiencing high traffic. Retry attempt ${retryCount + 1}. Please wait...`;
        console.log(retryMessage);
        setError(retryMessage);
        toast.error(retryMessage);
        await sleep(RETRY_DELAY);
        return fetchKTBalance(retryCount + 1);
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Request failed:', errorMessage);
      const retryMessage = `Request failed: ${errorMessage}. Retrying...`;
      setError(retryMessage);
      toast.error(retryMessage);
      await sleep(RETRY_DELAY);
      return fetchKTBalance(retryCount + 1);
    }
  };

  const checkKTBalance = async (): Promise<void> => {
    if (!walletAddress) {
      console.log('No wallet address available');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      console.log('Fetching KT token balance from Alchemy');

      const data = await fetchKTBalance();
      console.log('Alchemy Response:', data);

      if (data.result?.value?.[0]?.account?.data?.parsed?.info?.tokenAmount) {
        const tokenAmount = data.result.value[0].account.data.parsed.info.tokenAmount;
        const balance = Number(tokenAmount.uiAmountString);
        
        console.log('KT Balance:', balance);
        setKTBalance(balance);

        if (balance >= MIN_KT_REQUIRED) {
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - WHITEPAPER_DATE.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysAfterWhitepaper(diffDays);
        } else {
          setDaysAfterWhitepaper(null);
        }
      } else {
        console.log('No KT token account found');
        setKTBalance(0);
        setDaysAfterWhitepaper(null);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error checking KT balance:', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
      await sleep(RETRY_DELAY);
      return checkKTBalance(); // Retry the entire check
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined') return;

    try {
      setError(null);
      const { solana } = window as any;
      
      if (!solana) {
        const msg = 'Phantom wallet not found. Please install Phantom wallet.';
        setError(msg);
        toast.error(msg);
        return;
      }

      if (!solana.isPhantom) {
        const msg = 'Please install Phantom wallet to continue.';
        setError(msg);
        toast.error(msg);
        return;
      }

      const response = await solana.connect({ onlyIfTrusted: false });
      const address = response.publicKey.toString();
      console.log('Wallet connected:', address);
      
      setWalletAddress(address);
      setIsConnected(true);
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      console.error('Wallet connection error:', errorMsg);
      const msg = 'Failed to connect wallet: ' + errorMsg;
      setError(msg);
      toast.error(msg);
    }
  };

  const disconnect = async () => {
    if (typeof window === 'undefined') return;

    try {
      setError(null);
      const { solana } = window as any;
      if (solana) {
        await solana.disconnect();
        setIsConnected(false);
        setWalletAddress(null);
        setKTBalance(null);
        setDaysAfterWhitepaper(null);
        console.log('Wallet disconnected');
        toast.success('Wallet disconnected successfully');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('Error disconnecting wallet:', errorMsg);
      const msg = 'Failed to disconnect wallet: ' + errorMsg;
      setError(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const { solana } = window as any;
    if (solana) {
      const handleConnect = () => {
        console.log('Wallet connected event');
        setIsConnected(true);
        setWalletAddress(solana.publicKey.toString());
        toast.success('Wallet connected successfully!');
      };

      const handleDisconnect = () => {
        console.log('Wallet disconnected event');
        setIsConnected(false);
        setWalletAddress(null);
        setKTBalance(null);
        setDaysAfterWhitepaper(null);
        setError(null);
        toast.success('Wallet disconnected successfully');
      };

      solana.on('connect', handleConnect);
      solana.on('disconnect', handleDisconnect);
      solana.on('accountChanged', handleConnect);

      if (solana.isConnected) {
        console.log('Wallet already connected');
        handleConnect();
      }

      return () => {
        solana.removeListener('connect', handleConnect);
        solana.removeListener('disconnect', handleDisconnect);
        solana.removeListener('accountChanged', handleConnect);
      };
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connectWallet,
        disconnect,
        isConnected,
        walletAddress,
        ktBalance,
        daysAfterWhitepaper,
        holdingPeriodDays,
        checkKTBalance,
        error,
        isLoading,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
