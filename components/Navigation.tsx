import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useWalletContext } from '../context/WalletContext';

interface IntrinsicElements extends React.IntrinsicElements {
  'svg': React.DetailedHTMLProps<React.SVGAttributes<SVGElement>, SVGElement>;
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends IntrinsicElements {}
  }
}


const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { connectWallet, disconnect, isConnected, walletAddress, ktBalance, error, isLoading, selectedWallet, setSelectedWallet } = useWalletContext();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <nav className={`fixed w-full z-40 transition-all ${scrolled ? 'bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-lg' : ''}`}>
      <div className="container mx-auto px-4">
        <div className={`nav-links flex justify-between items-center py-6 ${isMenuOpen ? 'active' : ''}`}>
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">KT</span>
            <div className="flex items-center gap-6 mx-4"> {/* Increased gap */}
              {/* X (Twitter) */}
              <a href="https://x.com/KhaitunTiger" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Telegram */}
              <a href="https://t.me/KhaitunTiger" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.52-.46-.01-1.33-.26-1.98-.48-.8-.27-1.44-.42-1.38-.89.03-.25.38-.51 1.03-.78 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.01.05.01.13 0 .21z"/>
                </svg>
              </a>
              {/* Discord */}
              <a href="https://discord.com/invite/SYZQzNn6" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'zh' | 'th')}
              className="bg-transparent border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 dark:border-gray-700"
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="th">ไทย</option>
            </select>
          </div>
          <div className="flex items-center gap-6"> {/* Increased gap */}
            <a href="#hero" className="mx-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</a>
            <a href="#about" className="mx-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
            <a href="#store" className="mx-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Store</a>
            <a href="#whitepaper" className="mx-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Whitepaper</a>
            
            {!isConnected ? (
              <>
                <div className="flex flex-col items-center mb-2"> {/* Changed to flex-col */}
                  <label className="text-sm font-medium mb-1" htmlFor="wallet-select">Select Wallet:</label> {/* Added label styling */}
                  <div className="flex items-center space-x-2"> {/* Added container for radio buttons */}
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wallet-select"
                        value="phantom"
                        checked={selectedWallet === 'phantom'}
                        onChange={(e) => setSelectedWallet(e.target.value as 'phantom' | 'solflare')}
                        className="mr-2"
                      />
                      Phantom
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wallet-select"
                        value="solflare"
                        checked={selectedWallet === 'solflare'}
                        onChange={(e) => setSelectedWallet(e.target.value as 'phantom' | 'solflare')}
                        className="mr-2"
                      />
                      Solflare
                    </label>
                  </div>
                </div>
                <div className="flex items-center mt-4 ml-12"> {/* Added margin-top and margin-left */}
                  <button
                    onClick={connectWallet}
                    disabled={isLoading}
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2
                      ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      'Connect Wallet'
                    )}
                  </button>
                  {error && (
                    <div className="relative ml-4">
                      <div 
                        className="text-sm text-red-500 cursor-help max-w-[200px] truncate"
                        onMouseEnter={(e) => {
                          const target = e.currentTarget;
                          if (target.scrollWidth > target.clientWidth) {
                            target.title = error;
                          }
                        }}
                      >
                        {error}
                      </div>
                      {error.includes('retry') && (
                        <div className="absolute top-full left-0 mt-1 text-xs text-gray-400">
                          Retrying automatically...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-gray-500">Balance:</span>
                  <span className="ml-2 font-bold">{ktBalance !== null ? ktBalance.toLocaleString() : '...'} KT</span>
                </div>
                <button
                  onClick={disconnect}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {walletAddress ? shortenAddress(walletAddress) : 'Connected'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
