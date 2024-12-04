import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { WalletContext } from './context/WalletContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <WalletContext>
            <App />
        </WalletContext>
    </React.StrictMode>
);
const originalConsoleWarn = console.warn;
console.warn = (message, ...args) => {
    if (typeof message === 'string' && message.includes('solflare-detect-metamask')) {
        return;
    }
    originalConsoleWarn(message, ...args);
};
