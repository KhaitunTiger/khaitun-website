import { Connection, PublicKey } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const WALLET_ADDRESS = "B9BAojYpky9zSMf8qmnfq7ThD9jZw41gQnZ1xf8qYKx8";
const TOKEN_ADDRESS = "EStPXF2Mh3NVEezeysYfhrWXnuqwmbmjqLSP9vR5pump";

async function swapTokens() {
    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    try {
        // Get token information
        const tokenPublicKey = new PublicKey(TOKEN_ADDRESS);
        const walletPublicKey = new PublicKey(WALLET_ADDRESS);
        
        // Get token account
        const token = new Token(
            connection,
            tokenPublicKey,
            TOKEN_PROGRAM_ID,
            walletPublicKey // payer
        );

        // Get token account info
        const tokenAccountInfo = await connection.getTokenAccountsByOwner(
            walletPublicKey,
            { mint: tokenPublicKey }
        );

        console.log('Token Account Info:', tokenAccountInfo.value);
        
        if (tokenAccountInfo.value.length === 0) {
            console.log('No token account found. Creating new token account...');
            // Create associated token account if it doesn't exist
            const associatedTokenAccount = await token.getOrCreateAssociatedAccountInfo(
                walletPublicKey
            );
            console.log('Created Associated Token Account:', associatedTokenAccount.address.toBase58());
        } else {
            console.log('Existing Token Account:', tokenAccountInfo.value[0].pubkey.toBase58());
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

swapTokens();
