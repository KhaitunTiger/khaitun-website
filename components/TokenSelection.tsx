import React from 'react';

interface TokenSelectionProps {
  selectedToken: 'kt' | 'usdc' | 'kapi';
  handleTokenSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const TokenSelection: React.FC<TokenSelectionProps> = ({ selectedToken, handleTokenSelect }) => {
  return (
    <div className="mb-6">
      <label className="block text-gray-700 mb-2">
        Select Payment Token
      </label>
      <select
        className="w-full p-2 border rounded text-gray-900"
        value={selectedToken}
        onChange={handleTokenSelect}
      >
        <option value="kt">Transfer KT Token</option>
        <option value="usdc">Transfer </option>
        <option value="kapi">Transfer KAPI</option>
      </select>
    </div>
  );
};

export default TokenSelection;
