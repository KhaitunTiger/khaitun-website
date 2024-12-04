# **Khaitun Website Integration with Solana Chain**

Welcome to the **Khaitun Website**, a platform integrated with the **Solana Blockchain**. This platform enables users to check whitelist statuses, purchase items, and perform transactions using the **KT token**.

---

## **Features**
- **Whitelist Verification**: Check eligibility for special perks.
- **Token Payments**: Purchase exclusive products with KT tokens.
- **Blockchain Integration**: Seamless interaction with Solana chain.
- **Future Roadmap**: Expansion into products, partnerships, and exclusive content.

---

## **Getting Started**

### **Prerequisites**
Ensure you have the following installed:
- **Node.js** (v14 or later)
- **npm** or **yarn**
- A **Solana Wallet** (e.g., Phantom, Torus)

---

### **Installation**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/KhaitunTiger/khaitun-website.git
   cd khaitun-website```

2. **Install Dependencies**
   ```bash
   npm install
3. **Set Up Polyfills Create or edit the 'config-overrides.js' file in the project root:**
   ```bash
   const webpack = require('webpack');
   module.exports = function override(config) {
    config.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        url: require.resolve('url/'),
    };

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);

    config.ignoreWarnings = [
        { module: /source-map-loader/ }, // Ignore source-map-loader warnings
    ];

    return config;};
4. **Set Up Wallet Context Create or update src/context/WalletContext.js with:**
   ```bash
   import React, { FC, useMemo } from 'react';
   import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
   import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';import {
    PhantomWalletAdapter,
    TorusWalletAdapter,
    LedgerWalletAdapter,
    WalletConnectWalletAdapter,
   } from '@solana/wallet-adapter-wallets';
   import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
   import '@solana/wallet-adapter-react-ui/styles.css';
   export const WalletContext: FC = ({ children }) => {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => 'https://api.mainnet-beta.solana.com', []);

    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new TorusWalletAdapter(),
        new LedgerWalletAdapter(),
        new WalletConnectWalletAdapter(),
    ], []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );};


5. **Start the Development Server**
   ```bash
   npm start


Open [http://localhost:3000](http://localhost:3000) in your browser.


6.Build for Production
   ```bash
    npm run build
   ```

---
## Roadmap

### 2025: Exclusive Product Campaign
Launch premium products purchasable with KT tokens.

### Phase 2: Expanding Product Offerings
Introduce diverse products and offer token holder benefits.

### Phase 3: Tourism Partnerships
Collaborate with airlines, hotels, and travel operators.

### Phase 4: Livestream Content
Provide exclusive zoo content for KT token holders.

## Contributing
We welcome contributions! Please submit a pull request or open an issue.














