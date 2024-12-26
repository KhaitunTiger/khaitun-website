import { Alchemy } from "alchemy-sdk";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.ALCHEMY_API_KEY;
const tokenAddress = process.env.NEXT_PUBLIC_KT_TOKEN_ADDRESS;
const kapiTokenAddress = "J2Zgqgim2biihmV6rzadRbdKAuKHxHy61aQCydfWpump";

const alchemy = new Alchemy({ apiKey });

export default async function handler(req, res) {
  try {
    const addresses = [
      {
        network: "solana-mainnet",
        address: tokenAddress
      },
      {
        network: "solana-mainnet",
        address: "So11111111111111111111111111111111111111112" // SOL token address
      },
      {
        network: "solana-mainnet",
        address: kapiTokenAddress
      }
    ];

    const data = await alchemy.prices.getTokenPriceByAddress(addresses);

    const ktUsdPrice = parseFloat(data.data[0].prices[0].value);
    const solUsdPrice = parseFloat(data.data[1].prices[0].value);
    const ktSolPrice = ktUsdPrice / solUsdPrice;
    const kapiUsdPrice = parseFloat(data.data[2].prices[0].value);
    
    res.status(200).json({ ktUsdPrice, ktSolPrice, kapiUsdPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
