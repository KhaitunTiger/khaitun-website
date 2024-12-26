import { PriceStatus } from '@pythnetwork/client';

async function main() {
  try {
    console.log('Fetching Pyth price data...');
    
    // Using Pyth's price service endpoint
    const response = await fetch('https://xc-mainnet.pyth.network/api/latest_price_feeds');
    const priceFeeds = await response.json();
    
    // Sort price feeds by symbol
    const sortedFeeds = priceFeeds.sort((a: any, b: any) => a.symbol.localeCompare(b.symbol));
    
    for (const feed of sortedFeeds) {
      if (feed.price && feed.confidence) {
        console.log(
          `${feed.symbol}: $${Number(feed.price).toFixed(4)} ±$${Number(feed.confidence).toFixed(4)} Status: ${
            PriceStatus[feed.status] || 'Trading'
          }`
        );
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
