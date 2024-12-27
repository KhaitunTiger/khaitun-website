// import { Connection, PublicKey, Transaction } from '@solana/web3.js';
// import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

// interface TransferParams {
//   connection: Connection;
//   provider: any;
//   recipientAddress: string;
//   tokenMintAddress: string;
//   amount: number;
// }

// export const transferTokens = async ({ connection, provider, recipientAddress, tokenMintAddress, amount }: TransferParams) => {
//   try {
//     const recipientPublicKey = new PublicKey(recipientAddress);
//     const tokenMint = new PublicKey(tokenMintAddress);

//     const fromTokenAccount = await getAssociatedTokenAddress(
//       tokenMint,
//       provider.publicKey,
//       false,
//       TOKEN_PROGRAM_ID,
//       ASSOCIATED_TOKEN_PROGRAM_ID
//     );

//     const toTokenAccount = await getAssociatedTokenAddress(
//       tokenMint,
//       recipientPublicKey,
//       false,
//       TOKEN_PROGRAM_ID,
//       ASSOCIATED_TOKEN_PROGRAM_ID
//     );

//     const recipientAccountInfo = await connection.getAccountInfo(toTokenAccount);
//     const transaction = new Transaction();

//     if (!recipientAccountInfo) {
//       const createAtaInstruction = createAssociatedTokenAccountInstruction(
//         provider.publicKey,
//         toTokenAccount,
//         recipientPublicKey,
//         tokenMint,
//         TOKEN_PROGRAM_ID,
//         ASSOCIATED_TOKEN_PROGRAM_ID
//       );
//       transaction.add(createAtaInstruction);
//     }

//     const transferInstruction = createTransferInstruction(
//       fromTokenAccount,
//       toTokenAccount,
//       provider.publicKey,
//       Math.floor(amount * Math.pow(10, 6)),
//       [],
//       TOKEN_PROGRAM_ID
//     );
//     transaction.add(transferInstruction);
//     transaction.feePayer = provider.publicKey;
//     transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

//     const signed = await provider.signTransaction(transaction);
//     const signature = await connection.sendRawTransaction(signed.serialize());
//     const confirmed = await confirmTransaction(signature, toTokenAccount, BigInt(Math.floor(amount * Math.pow(10, 6))));
//     if (!confirmed) {
//       throw new Error('Transaction confirmation failed');
//     }
//     console.log('Transfer successful:', signature);
//   } catch (error) {
//     console.error('Failed to transfer tokens:', error);
//     throw error;
//   }
// };
