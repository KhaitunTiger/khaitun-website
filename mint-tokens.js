import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { createMint, createAccount, mintTo } from '@solana/spl-token';

const WALLET_ADDRESS = "B9BAojYpky9zSMf8qmnfq7ThD9jZw41gQnZ1xf8qYKx8";
const MINT_AUTHORITY = "EStPXF2Mh3NVEezeysYfhrWXnuqwmbmjqLSP9vR5pump";

async function mintTokens() {
    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    try {
        // Use specific public key for mint authority
        const mintAuthority = new PublicKey(MINT_AUTHORITY);
        
        // Request airdrop for the mint authority
        console.log('Requesting airdrop...');
        const airdropSignature = await connection.requestAirdrop(
            mintAuthority,
            LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(airdropSignature);
        
        // Create new token mint
        console.log('Creating token mint...');
        const mint = await createMint(
            connection,
            mintAuthority,
            mintAuthority.publicKey,
            mintAuthority.publicKey,
            6 // 6 decimals (standard for Solana tokens like USDC)
        );
        
        // Create token account for recipient
        console.log('Creating token account...');
        const recipientTokenAccount = await createAccount(
            connection,
            mintAuthority,
            mint,
            new PublicKey(WALLET_ADDRESS)
        );
        
        // Mint 10,000 tokens
        console.log('Minting 10,000 tokens...');
        await mintTo(
            connection,
            mintAuthority,
            mint,
            recipientTokenAccount,
            mintAuthority.publicKey,
            10000 * Math.pow(10, 6) // 10000 tokens with 6 decimals
        );
        
        console.log('Success! Minted 10,000 tokens to:', WALLET_ADDRESS);
        console.log('Token mint address:', mint.toBase58());
        console.log('Token account address:', recipientTokenAccount.toBase58());
    } catch (error) {
        console.error('Error:', error);
    }
}

mintTokens();
