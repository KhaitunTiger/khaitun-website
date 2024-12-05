#!/bin/bash

# Replace YOUR_WALLET_ADDRESS with your actual wallet address
WALLET_ADDRESS="B9BAojYpky9zSMf8qmnfq7ThD9jZw41gQnZ1xf8qYKx8"
KT_TOKEN="EStPXF2Mh3NVEezeysYfhrWXnuqwmbmjqLSP9vR5pump"

# Fetch all token accounts for the wallet
echo "Fetching token accounts for wallet: $WALLET_ADDRESS"
curl -X POST https://api.mainnet-beta.solana.com -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTokenAccountsByOwner",
  "params": [
    "'$WALLET_ADDRESS'",
    {
      "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    },
    {
      "encoding": "jsonParsed"
    }
  ]
}'

# Fetch specific KT token account info
echo -e "\n\nFetching KT token info:"
curl -X POST https://api.mainnet-beta.solana.com -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTokenAccountsByOwner",
  "params": [
    "'$WALLET_ADDRESS'",
    {
      "mint": "'$KT_TOKEN'"
    },
    {
      "encoding": "jsonParsed"
    }
  ]
}'
