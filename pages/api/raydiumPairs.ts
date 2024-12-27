import { Alchemy, Network } from "alchemy-sdk";
import { NextApiRequest, NextApiResponse } from 'next';
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
if (!process.env.ALCHEMY_API_KEY) {
  throw new Error('ALCHEMY_API_KEY is not defined');
}
if (!process.env.NEXT_PUBLIC_KT_TOKEN_ADDRESS) {
  throw new Error('NEXT_PUBLIC_KT_TOKEN_ADDRESS is not defined');
}

const apiKey = process.env.ALCHEMY_API_KEY;
const tokenAddress = process.env.NEXT_PUBLIC_KT_TOKEN_ADDRESS;
const kapiTokenAddress = "J2Zgqgim2biihmV6rzadRbdKAuKHxHy61aQCydfWpump";

// Configure Alchemy for Solana
const settings = {
  apiKey,
  network: Network.ETH_MAINNET // Using ETH_MAINNET as a workaround since Alchemy's TypeScript types don't include Solana
};

const alchemy = new Alchemy(settings);

interface TokenPriceResponse {
  ktUsdPrice: number;
  ktSolPrice: number;
  kapiUsdPrice: number;
}

interface AlchemyPriceResponse {
  data: Array<{
    prices: Array<{
      value: string;
    }>;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenPriceResponse | { error: string }>
) {
  try {
    // Using type assertion since we know the actual runtime values will be correct
    const addresses = [
      {
        network: "solana-mainnet" as any,
        address: tokenAddress
      },
      {
        network: "solana-mainnet" as any,
        address: "So11111111111111111111111111111111111111112" // SOL token address
      },
      {
        network: "solana-mainnet" as any,
        address: kapiTokenAddress
      }
    ];

    const data = await alchemy.prices.getTokenPriceByAddress(addresses) as AlchemyPriceResponse;

    if (!data?.data?.[0]?.prices?.[0]?.value || 
        !data?.data?.[1]?.prices?.[0]?.value || 
        !data?.data?.[2]?.prices?.[0]?.value) {
      throw new Error('Invalid price data received from Alchemy');
    }

    const ktUsdPrice = parseFloat(data.data[0].prices[0].value);
    const solUsdPrice = parseFloat(data.data[1].prices[0].value);
    const ktSolPrice = solUsdPrice > 0 ? ktUsdPrice / solUsdPrice : 0;
    const kapiUsdPrice = parseFloat(data.data[2].prices[0].value);
    
    return res.status(200).json({ ktUsdPrice, ktSolPrice, kapiUsdPrice });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}
