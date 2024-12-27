import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';

const RECIPIENT = new PublicKey('A8kVniPHm7gZsxqxEpeUfHK6XkdtPKwCojaAJVg2Xh6w');
const AMOUNT = 300 * Math.pow(10, 6); // 300 USDC (6 decimals)

async function airdropUSDC() {
    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    try {
        // Use USDC mint authority and create a payer for transactions
        const mintAuthority = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");
        const payer = Keypair.generate();
        
        // Request SOL airdrop for gas fees
        console.log('Requesting SOL airdrop for gas fees...');
        const airdropSignature = await connection.requestAirdrop(
            payer.publicKey,
            2 * LAMPORTS_PER_SOL // 2 SOL should be enough for gas
        );
        await connection.confirmTransaction(airdropSignature);
        
        // Create new USDC mint
        console.log('Creating USDC mint...');
        const mint = await createMint(
            connection,
            payer,
            mintAuthority,
            mintAuthority,
            6 // 6 decimals like real USDC
        );
        
        // Create associated token account for recipient
        console.log('Creating token account for recipient...');
        const recipientAta = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mint,
            RECIPIENT
        );
        
        // Mint USDC tokens directly to recipient
        console.log('Minting 300 USDC to recipient...');
        const mintTx = await mintTo(
            connection,
            payer,
            mint,
            recipientAta.address,
            mintAuthority,
            AMOUNT
        );
        
        console.log('Airdrop successful!');
        console.log('Transaction signature:', mintTx);
        console.log('USDC mint address:', mint.toBase58());
        console.log('Recipient token account:', recipientAta.address.toBase58());
    } catch (error) {
        console.error('Error:', error);
    }
}

airdropUSDC();
