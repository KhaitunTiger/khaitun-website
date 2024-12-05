import { useWalletContext } from '../context/WalletContext';

const Whitepaper = () => {
  const { 
    isConnected, 
    walletAddress, 
    ktBalance, 
    daysAfterWhitepaper, 
    holdingPeriodDays,
    error 
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
              <h4 className="text-2xl font-bold text-center mb-4">Your KT Token Status</h4>
              <div className="space-y-4">
                <p className="text-center text-gray-300">
                  Wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </p>
                <p className="text-center text-gray-300">
                  KT Balance: {ktBalance?.toLocaleString() || '0'} KT
                </p>
                {holdingPeriodDays !== null && (
                  <p className="text-center text-blue-400">
                    Holding KT tokens for: {holdingPeriodDays} days
                  </p>
                )}
                {ktBalance && ktBalance >= 100000 ? (
                  <div className="text-center">
                    <p className="text-green-400 font-semibold">
                      ✓ Eligible Holder (&gt;100,000 KT)
                    </p>
                    {daysAfterWhitepaper && (
                      <p className="text-xl mt-2">
                        Days since whitepaper: <span className="font-bold text-blue-400">{daysAfterWhitepaper}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-yellow-400">
                    Hold at least 100,000 KT to view days since whitepaper
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Whitepaper;
