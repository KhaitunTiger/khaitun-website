// prices-alchemy-sdk-script.js
import { Alchemy } from "alchemy-sdk";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Use the API key and token address from the .env file
const apiKey = process.env.ALCHEMY_API_KEY;
const tokenAddress = process.env.NEXT_PUBLIC_KT_TOKEN_ADDRESS;

const alchemy = new Alchemy({ apiKey });

// Define the network and contract address you want to fetch prices for.
const addresses = [
  {
    network: "solana-mainnet",
    address: tokenAddress
  }
];

alchemy.prices.getTokenPriceByAddress(addresses)
  .then(data => {
    console.log("Token Prices By Address:");
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(error => console.error("Error:", error));
