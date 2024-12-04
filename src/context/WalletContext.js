import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
    LedgerWalletAdapter,
    WalletConnectWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletContext: FC = ({ children }) => {
    // ใช้ Mainnet
    const network = WalletAdapterNetwork.Mainnet;

    // ใช้ endpoint ของ Mainnet
    const endpoint = useMemo(() => 'https://api.mainnet-beta.solana.com', []);

    const wallets = useMemo(
        () => [
            new TorusWalletAdapter(),
            new LedgerWalletAdapter(),
            new WalletConnectWalletAdapter(),
        ],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
