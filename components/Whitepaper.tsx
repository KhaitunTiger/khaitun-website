import React from 'react';
import { useWalletContext } from '../context/WalletContext';

const LoadingSpinner = () => (
  <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const Whitepaper: React.FC = () => {
  const { 
    isConnected, 
    walletAddress, 
    ktBalance, 
    daysAfterWhitepaper, 
    holdingPeriodDays,
    error,
    isLoading
  } = useWalletContext();

  return (
    <section id="whitepaper" className="py-20 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-bold text-center mb-16">Whitepaper</h2>
        <div className="max-w-4xl mx-auto">
          <div className="card bg-gray-800/50 p-8 rounded-xl backdrop-blur-md">
            <div className="video-container mb-8 rounded-lg overflow-hidden">
              <video 
                className="w-full"
                controls
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/9404EC75-5785-4CC4-A5C7-665F5C0A9B84.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <h3 className="text-3xl font-bold text-center mb-4">KT Token Whitepaper</h3>
            <p className="text-xl text-center mb-8 text-gray-300">Learn more about our vision and roadmap</p>
            <div className="text-center">
              <a 
                href="#" 
                className="inline-block bg-blue-600 text-white px-12 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 hover:shadow-xl"
              >
                Download Whitepaper
              </a>
            </div>
          </div>

          {isConnected && (
            <div className="mt-8 card bg-gray-800/50 p-8 rounded-xl backdrop-blur-md">
              <h4 className="text-2xl font-bold text-center mb-6">Your KT Token Status</h4>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <LoadingSpinner />
                  <span className="ml-3 text-blue-400">Loading wallet data...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {walletAddress && (
                    <p className="text-center text-gray-300">
                      Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                  )}
                  <p className="text-center text-gray-300">
                    KT Balance: {ktBalance !== null ? ktBalance.toLocaleString() : '0'} KT
                  </p>
                  {holdingPeriodDays !== null && (
                    <p className="text-center text-blue-400">
                      Holding KT tokens for: {holdingPeriodDays} days
                    </p>
                  )}
                  {ktBalance !== null && (
                    ktBalance >= 100000 ? (
                      <div className="text-center bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <p className="text-green-400 font-semibold flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Eligible Holder (&gt;100,000 KT)
                        </p>
                        {daysAfterWhitepaper && (
                          <p className="text-xl mt-2">
                            Days since whitepaper: <span className="font-bold text-blue-400">{daysAfterWhitepaper}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <p className="text-yellow-400 flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Hold at least 100,000 KT to view days since whitepaper
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-500/20 border border-red-500 text-red-100 px-6 py-4 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Whitepaper;
