import { Connection, PublicKey } from '@solana/web3.js';
import { PythConnection, getPythProgramKeyForCluster } from '@pythnetwork/client';

async function getPriceFromPyth() {
  // This is the cluster you want to connect to, e.g. 'mainnet-beta'
  const cluster = 'mainnet-beta';

  // 1) Connect to Solana
  const connection = new Connection('https://api.mainnet-beta.solana.com');

  // 2) Pyth program ID for the cluster
  const pythPublicKey = getPythProgramKeyForCluster(cluster);

  // 3) Initialize PythConnection
  const pythConnection = new PythConnection(connection, pythPublicKey);

  // 4) Poll for price updates (subscribe on-chain) 
  // pythConnection.onPriceChange((product, price) => {
  //   if (product.symbol === 'BTC/USD') {
  //     console.log(`BTC price is now: ${price.price}`);
  //   }
  // });

  // Start listening for price updates
  pythConnection.start();
}

getPriceFromPyth();
