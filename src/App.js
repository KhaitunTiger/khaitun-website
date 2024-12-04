import React from 'react';
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';

const App = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
            <h1>Connect to Solana Wallet</h1>
            <WalletMultiButton />
            <WalletDisconnectButton />
        </div>
    );
};

export default App;
