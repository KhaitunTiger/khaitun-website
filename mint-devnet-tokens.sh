#!/bin/bash

WALLET_ADDRESS="B9BAojYpky9zSMf8qmnfq7ThD9jZw41gQnZ1xf8qYKx8"

# Add Solana to PATH
export PATH="/root/.local/share/solana/install/active_release/bin:$PATH"

# Set network to devnet
echo "Setting network to devnet..."
/root/.local/share/solana/install/active_release/bin/solana config set --url https://api.devnet.solana.com

# Request airdrop of SOL for gas fees
echo "Requesting SOL airdrop for gas fees..."
/root/.local/share/solana/install/active_release/bin/solana airdrop 1

# Create new token mint
echo "Creating new token mint..."
TOKEN_MINT=$(/root/.local/share/solana/install/active_release/bin/spl-token create-token --decimals 9 | grep "Creating token" | awk '{print $3}')
echo "Token mint address: $TOKEN_MINT"

# Create token account
echo "Creating token account..."
/root/.local/share/solana/install/active_release/bin/spl-token create-account $TOKEN_MINT

# Mint 10,000 tokens
echo "Minting 10,000 tokens..."
/root/.local/share/solana/install/active_release/bin/spl-token mint $TOKEN_MINT 10000

# Transfer tokens to target wallet
echo "Transferring tokens to wallet: $WALLET_ADDRESS"
/root/.local/share/solana/install/active_release/bin/spl-token transfer $TOKEN_MINT 10000 $WALLET_ADDRESS --allow-unfunded-recipient

echo "Done! Wallet $WALLET_ADDRESS now has 10,000 tokens on devnet."
