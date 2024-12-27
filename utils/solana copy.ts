import { DONATION_ADDRESS, KT_TOKEN_ADDRESS, NETWORK_CONFIG } from '../config/constants';
import { 
  Connection, 
  Transaction, 
  PublicKey,
  Commitment,
  TransactionSignature,
  VersionedTransaction,
  RpcResponseAndContext,
  SignatureResult
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  createTransferInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  getAccount,
  Account
} from '@solana/spl-token';

// Increased timeouts for better transaction handling
const RETRY_DELAY = 1000; // 1 second initial delay
const MAX_RETRIES = 10; // Increased retries
const CONFIRMATION_TIMEOUT = 120000; // 2 minutes max wait
const RATE_LIMIT_DELAY = 2000; // 2 seconds initial rate limit delay
const MAX_RATE_LIMIT_DELAY = 30000; // 30 seconds max delay
const TRANSACTION_TIMEOUT = 180000; // 3 minutes total transaction timeout
const SEND_TRANSACTION_TIMEOUT = 60000; // 1 minute for sending transaction

// Initialize connection with better timeout settings
const connection = new Connection(NETWORK_CONFIG.mainnet.endpoint, {
  commitment: 'confirmed' as Commitment,
  confirmTransactionInitialTimeout: 60000, // 1 minute initial timeout
  disableRetryOnRateLimit: false // Let the RPC handle some retries
});

export const donationPubKey = DONATION_ADDRESS;
export const ktTokenPubKey = KT_TOKEN_ADDRESS;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class TransactionError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TransactionError';
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string,
  operationName = 'Operation'
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  let isCompleted = false;
  
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      if (!isCompleted) {
        console.error(`${operationName} timed out after ${timeoutMs}ms`);
        reject(new Error(`${errorMessage} (${timeoutMs}ms)`));
      }
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    isCompleted = true;
    clearTimeout(timeoutHandle!);
    return result;
  } catch (error) {
    isCompleted = true;
    clearTimeout(timeoutHandle!);
    throw error;
  }
}

async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  baseDelay = RETRY_DELAY,
  operationName = 'Operation'
): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`${operationName}: Attempt ${i + 1}/${retries}`);
      const result = await operation();
      console.log(`${operationName}: Success`);
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`${operationName}: Error:`, error);
      
      // Check for specific error types
      if (error.message?.includes('rate limit') || error.code === 429) {
        const delay = Math.min(RATE_LIMIT_DELAY * Math.pow(1.5, i), MAX_RATE_LIMIT_DELAY);
        console.log(`${operationName}: Rate limited, waiting ${delay}ms`);
        await sleep(delay);
        continue;
      }

      if (error.message?.includes('blockhash not found') || error.code === 404) {
        console.log(`${operationName}: Blockhash expired, retrying immediately`);
        continue;
      }

      if (i === retries - 1) {
        console.log(`${operationName}: All attempts failed`);
        throw new TransactionError(
          `Failed after ${retries} attempts: ${error.message}`,
          error.code || 'OPERATION_FAILED'
        );
      }

      const delay = Math.min(baseDelay * Math.pow(1.5, i), MAX_RATE_LIMIT_DELAY);
      console.log(`${operationName}: Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  throw lastError;
}

async function confirmTransaction(connection: Connection, signature: string): Promise<void> {
  console.log('Confirming transaction:', signature);
  
  try {
    const confirmation = await withTimeout(
      withRetry(
        async () => {
          const result = await connection.confirmTransaction(
            signature, 
            'confirmed'
          );
          return result as RpcResponseAndContext<SignatureResult>;
        },
        MAX_RETRIES,
        RETRY_DELAY,
        'Transaction confirmation'
      ),
      CONFIRMATION_TIMEOUT,
      'Transaction confirmation timed out',
      'Transaction confirmation'
    );

    if (confirmation.value.err) {
      throw new TransactionError(
        `Transaction failed: ${JSON.stringify(confirmation.value.err)}`,
        'CONFIRMATION_ERROR'
      );
    }

    console.log('Transaction confirmed successfully');
  } catch (error) {
    console.error('Transaction confirmation failed:', error);
    throw new TransactionError(
      'Transaction confirmation failed. Please check your wallet for status.',
      'CONFIRMATION_ERROR'
    );
  }
}

export async function getTokenBalance(
  walletAddress: string
): Promise<number> {
  try {
    console.log('Fetching token balance...');
    const tokenAccounts = await withTimeout(
      withRetry(
        async () => {
          const result = await connection.getParsedTokenAccountsByOwner(
            new PublicKey(walletAddress),
            { mint: new PublicKey(KT_TOKEN_ADDRESS) }
          );
          return result;
        },
        MAX_RETRIES,
        RETRY_DELAY,
        'Balance fetch'
      ),
      30000,
      'Balance fetch timed out',
      'Balance fetch'
    );

    if (tokenAccounts.value.length > 0) {
      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      console.log('Balance fetch successful:', balance);
      return balance || 0;
    }

    return 0;
  } catch (error) {
    console.error('Error getting token balance:', error);
    return 0;
  }
}

export async function getDonationProgress(): Promise<number> {
  try {
    console.log('Fetching donation progress...');
    const tokenAccounts = await withTimeout(
      withRetry(
        async () => {
          const result = await connection.getParsedTokenAccountsByOwner(
            new PublicKey(DONATION_ADDRESS),
            { mint: new PublicKey(KT_TOKEN_ADDRESS) }
          );
          return result;
        },
        MAX_RETRIES,
        RETRY_DELAY,
        'Progress fetch'
      ),
      30000,
      'Progress fetch timed out',
      'Progress fetch'
    );

    if (tokenAccounts.value.length > 0) {
      const progress = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      console.log('Progress fetch successful:', progress);
      return progress || 0;
    }

    return 0;
  } catch (error) {
    console.error('Error getting donation progress:', error);
    return 0;
  }
}

async function initializeTokenAccount(
  mintPubkey: PublicKey,
  owner: PublicKey,
  payer: PublicKey,
  userWallet: any
): Promise<PublicKey> {
  const ata = await getAssociatedTokenAddress(mintPubkey, owner);
  
  try {
    console.log('Checking token account...');
    await withTimeout(
      withRetry(
        () => getAccount(connection, ata),
        MAX_RETRIES,
        RETRY_DELAY,
        'Account check'
      ),
      30000,
      'Account check timed out',
      'Account check'
    );
    console.log('Token account exists:', ata.toString());
    return ata;
  } catch (error: any) {
    if (error.name === 'TokenAccountNotFoundError') {
      console.log('Creating token account:', ata.toString());
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer,
          ata,
          owner,
          mintPubkey
        )
      );

      const blockHashData = await withTimeout(
        withRetry(
          async () => {
            const result = await connection.getLatestBlockhash('confirmed');
            return result;
          },
          MAX_RETRIES,
          RETRY_DELAY,
          'Blockhash fetch'
        ),
        30000,
        'Blockhash fetch timed out',
        'Blockhash fetch'
      );
      
      transaction.recentBlockhash = blockHashData.blockhash;
      transaction.lastValidBlockHeight = blockHashData.lastValidBlockHeight;
      transaction.feePayer = payer;

      const signedTransaction = await userWallet.signTransaction(transaction);
      const signature = await withTimeout(
        withRetry(
          async () => {
            const sig = await connection.sendRawTransaction(signedTransaction.serialize(), {
              skipPreflight: false,
              preflightCommitment: 'confirmed',
              maxRetries: 3
            });
            return sig as TransactionSignature;
          },
          MAX_RETRIES,
          RETRY_DELAY,
          'Transaction send'
        ),
        SEND_TRANSACTION_TIMEOUT,
        'Transaction send timed out',
        'Transaction send'
      );

      try {
        await confirmTransaction(connection, signature);
        console.log('Token account created:', ata.toString());
        await sleep(2000);
        return ata;
      } catch (confirmError) {
        console.error('Error confirming token account creation:', confirmError);
        throw new TransactionError('Failed to create token account', 'ACCOUNT_CREATION_ERROR');
      }
    }
    throw error;
  }
}

export async function sendTokens(
  amount: number,
  fromWallet: any
): Promise<string> {
  if (!fromWallet || !fromWallet.signTransaction) {
    throw new TransactionError('Invalid wallet configuration', 'WALLET_ERROR');
  }

  const transactionPromise = async () => {
    try {
      console.log('Starting token transfer...');
      const mintPubkey = new PublicKey(KT_TOKEN_ADDRESS);
      const fromPubkey = new PublicKey(fromWallet.publicKey);
      const toPubkey = new PublicKey(donationPubKey);

      console.log('Initializing token accounts...');
      const fromATA = await initializeTokenAccount(
        mintPubkey,
        fromPubkey,
        fromPubkey,
        fromWallet
      );

      const toATA = await initializeTokenAccount(
        mintPubkey,
        toPubkey,
        fromPubkey,
        fromWallet
      );

      console.log('Checking balance...');
      const fromAccount = await withRetry<Account>(
        () => getAccount(connection, fromATA),
        MAX_RETRIES,
        RETRY_DELAY,
        'Balance check'
      );
      
      const balance = Number(fromAccount.amount);
      if (balance < amount) {
        throw new TransactionError('Insufficient funds in wallet', 'INSUFFICIENT_FUNDS');
      }

      console.log('Creating transfer transaction...');
      const transaction = new Transaction();
      transaction.add(
        createTransferInstruction(
          fromATA,
          toATA,
          fromPubkey,
          BigInt(amount),
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const blockHashData = await withTimeout(
        withRetry(
          async () => {
            const result = await connection.getLatestBlockhash('confirmed');
            return result;
          },
          MAX_RETRIES,
          RETRY_DELAY,
          'Blockhash fetch'
        ),
        30000,
        'Blockhash fetch timed out',
        'Blockhash fetch'
      );
      
      transaction.recentBlockhash = blockHashData.blockhash;
      transaction.lastValidBlockHeight = blockHashData.lastValidBlockHeight;
      transaction.feePayer = fromPubkey;

      console.log('Signing transaction...');
      const signedTransaction = await fromWallet.signTransaction(transaction);
      
      console.log('Sending transaction...');
      const signature = await withTimeout(
        withRetry(
          async () => {
            const sig = await connection.sendRawTransaction(signedTransaction.serialize(), {
              skipPreflight: false,
              preflightCommitment: 'confirmed',
              maxRetries: 3
            });
            return sig as TransactionSignature;
          },
          MAX_RETRIES,
          RETRY_DELAY,
          'Transaction send'
        ),
        SEND_TRANSACTION_TIMEOUT,
        'Transaction send timed out',
        'Transaction send'
      );
      
      console.log('Transaction sent:', signature);
      await confirmTransaction(connection, signature);
      console.log('Transaction completed successfully');
      return signature;

    } catch (error: any) {
      console.error('Transaction error:', error);
      
      if (error instanceof TransactionError) {
        throw error;
      }

      if (error.message?.includes('timeout')) {
        throw new TransactionError(
          'Transaction processing took too long. Please try again.',
          'TIMEOUT_ERROR'
        );
      }

      if (error.message?.includes('rate limit') || error.code === 429) {
        throw new TransactionError(
          'Service is busy. Please try again in a moment.',
          'RATE_LIMIT'
        );
      }

      if (error.message?.toLowerCase().includes('user rejected')) {
        throw new TransactionError('Transaction cancelled', 'USER_REJECTED');
      }

      throw new TransactionError(
        error.message || 'An unexpected error occurred',
        'TRANSACTION_ERROR'
      );
    }
  };

  return await withTimeout(
    transactionPromise(),
    TRANSACTION_TIMEOUT,
    'Overall transaction process timed out',
    'Transaction process'
  );
}
