import React from 'react';

interface WalletInfoProps {
  solanaAddress: string;
  ktBalance: number | null;
  usdcBalance: number | null;
  kapiBalance: number | null;
}

const WalletInfo: React.FC<WalletInfoProps> = ({ solanaAddress, ktBalance, usdcBalance, kapiBalance }) => {
  return (
    <div className="mb-4 p-3 bg-gray-50 rounded">
      <p className="text-sm text-gray-600">Connected Solana Wallet</p>
      <p className="text-gray-800 font-mono break-all">{solanaAddress}</p>
      <div className="mt-2 space-y-1">
        <p className="text-sm">
          <span className="text-gray-600">KT Balance:</span>
          <span className="ml-2 text-blue-600 font-semibold">{ktBalance?.toLocaleString() ?? '0'}</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-600">USDC Balance:</span>
          <span className="ml-2 text-green-600 font-semibold">{usdcBalance?.toLocaleString() ?? '0'}</span>
        </p>
        <p className="text-sm">
          <span className="text-gray-600">KAPI Balance:</span>
          <span className="ml-2 text-purple-600 font-semibold">{kapiBalance?.toLocaleString() ?? '0'}</span>
        </p>
      </div>
    </div>
  );
};

export default WalletInfo;
