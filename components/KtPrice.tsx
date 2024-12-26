import { useWalletContext } from '../context/WalletContext';

export function KtPrice() {
  const { ktUsdRate } = useWalletContext();

  const formatPrice = (price: number) => {
    console.log('price', price);
    if (price === 0) return '0.0';
    const [integerPart, decimalPart = ''] = price.toString().split('.');
    const nonZeroIndex = decimalPart.search(/[1-9]/);
    if (nonZeroIndex === -1) return '0.0';
    const significantDigits = decimalPart.slice(nonZeroIndex, nonZeroIndex + 4);
    return `0.{${nonZeroIndex}}${significantDigits}`;
  };

  return (
    <div className="text-sm font-medium">
      <span className="text-white">KT/USD:</span>{' '}
      <span className="text-white">${ktUsdRate ? formatPrice(ktUsdRate) : '---'}</span>
    </div>
  );
}
