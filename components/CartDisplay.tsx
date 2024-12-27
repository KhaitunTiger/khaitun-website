import React from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartDisplayProps {
  cart: CartItem[];
  convertUSDToKT: (amount: number) => number;
  kapiUsdRate: number;
  recipientAddress: string;
}

const CartDisplay: React.FC<CartDisplayProps> = ({ cart, convertUSDToKT, kapiUsdRate, recipientAddress }) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="mb-6 bg-white border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-xl font-bold text-gray-900">Your Cart</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <span className="mr-2">Quantity: {item.quantity}</span>
                <span>Price per item: ${item.price.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-2 sm:mt-0 text-right">
              <span className="font-semibold text-lg text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 rounded-b-lg">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <div className="text-right">
                <span className="block text-2xl font-bold text-indigo-600">
                  ${subtotal.toFixed(2)}
                </span>
                <span className="block text-sm text-gray-500">
                  {convertUSDToKT(subtotal).toLocaleString()} KT to {recipientAddress.slice(0, 4)}...{recipientAddress.slice(-4)}
                </span>
                <span className="block text-sm text-gray-500">
                  {subtotal}  to {recipientAddress.slice(0, 4)}...{recipientAddress.slice(-4)}
                </span>
                <span className="block text-sm text-gray-500">
                  {(subtotal / kapiUsdRate).toLocaleString()} KAPI to {recipientAddress.slice(0, 4)}...{recipientAddress.slice(-4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDisplay;
