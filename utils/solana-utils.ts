import { Connection, Commitment, PublicKey, RpcResponseAndContext, SignatureStatus, SendOptions } from '@solana/web3.js';
import { NETWORK_CONFIG } from '../config/constants';
import { toast } from 'react-hot-toast';

// Timeout and retry constants
export const RETRY_DELAY = 1000;
export const MAX_RETRIES = 10;
export const CONFIRMATION_TIMEOUT = 120000;
export const RATE_LIMIT_DELAY = 2000;
export const MAX_RATE_LIMIT_DELAY = 60000;
export const TRANSACTION_TIMEOUT = 180000;
export const SEND_TRANSACTION_TIMEOUT = 60000;
export const CONFIRMATION_CHECK_INTERVAL = 3000;

// Enhanced Connection with HTTP-only operations
export class EnhancedConnection {
  private connection: Connection;

  constructor(endpoint: string) {
    // Create connection with HTTP-only configuration
    this.connection = new Connection(endpoint, {
      commitment: 'confirmed' as Commitment,
      confirmTransactionInitialTimeout: 120000,
      disableRetryOnRateLimit: false,
      wsEndpoint: undefined // ปิด WebSocket เพื่อป้องกัน ping
    });
  }

  async confirmTransaction(...args: Parameters<Connection['confirmTransaction']>) {
    const [signature, commitment] = args;
    let attempts = 0;
    const maxAttempts = 40;

    while (attempts < maxAttempts) {
      try {
        // ใช้เฉพาะ HTTP polling
        const status = await this.connection.getSignatureStatus(signature);
        
        if (status?.value?.confirmationStatus === commitment || 
            status?.value?.confirmationStatus === 'finalized') {
          return {
            context: { slot: 0 },
            value: status.value
          };
        }
      } catch (error) {
        console.warn('Confirmation check failed:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;
    }

    throw new Error('Transaction confirmation timeout');
  }

  async getSignatureStatus(...args: Parameters<Connection['getSignatureStatus']>) {
    return await this.connection.getSignatureStatus(...args);
  }

  async getParsedTokenAccountsByOwner(...args: Parameters<Connection['getParsedTokenAccountsByOwner']>) {
    return await this.connection.getParsedTokenAccountsByOwner(...args);
  }

  async getTransaction(...args: Parameters<Connection['getTransaction']>) {
    return await this.connection.getTransaction(...args);
  }

  async getParsedTransaction(...args: Parameters<Connection['getParsedTransaction']>) {
    return await this.connection.getParsedTransaction(...args);
  }

  async getAccountInfo(...args: Parameters<Connection['getAccountInfo']>) {
    return await this.connection.getAccountInfo(...args);
  }

  async getLatestBlockhash(...args: Parameters<Connection['getLatestBlockhash']>) {
    return await this.connection.getLatestBlockhash(...args);
  }

  async sendRawTransaction(transaction: Buffer, options?: SendOptions) {
    return await this.connection.sendRawTransaction(transaction, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
      maxRetries: 5,
      ...options
    });
  }

  async getSignaturesForAddress(...args: Parameters<Connection['getSignaturesForAddress']>) {
    return await this.connection.getSignaturesForAddress(...args);
  }

  async getParsedAccountInfo(...args: Parameters<Connection['getParsedAccountInfo']>) {
    return await this.connection.getParsedAccountInfo(...args);
  }
}

// Create connection instance
export const connection = new EnhancedConnection(NETWORK_CONFIG.mainnet.endpoint);

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isUserRejectionError(error: any): boolean {
  if (!error) return false;
  
  const rejectionPatterns = [
    'user rejected',
    'rejected the request',
    'user denied',
    'user cancelled',
    'transaction was not confirmed',
    'failed to sign transaction',
    'user reject',
    'rejected by user',
    'user declined',
    'wallet adapter error',
    'signature request denied',
    'transaction rejected',
    'wallet disconnected'
  ];

  return (
    error.code === 4001 || 
    error.code === -32603 || 
    error.code === 'USER_REJECTED' ||
    error.name === 'WalletSignTransactionError' ||
    error.name === 'WalletConnectionError' ||
    rejectionPatterns.some(pattern => 
      error.message?.toLowerCase().includes(pattern)
    )
  );
}

export class TransactionError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TransactionError';
    
    if (!['USER_REJECTED', 'USER_CANCELLED'].includes(code || '') && 
        !isUserRejectionError({ message, code })) {
      toast.error(message);
    }
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string,
  operationName = 'Operation'
): Promise<T | null> {
  let timeoutId: NodeJS.Timeout | undefined;

  const cleanup = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  const wrappedPromise = promise.catch(error => {
    if (isUserRejectionError(error)) {
      console.log(`${operationName}: User rejected the transaction`);
      return null;
    }
    throw error;
  });

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`${errorMessage} (${timeoutMs}ms)`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([wrappedPromise, timeoutPromise]);
    cleanup();
    
    return result === undefined ? null : result;
  } catch (error: any) {
    cleanup();
    
    if (error.message?.includes('timed out')) {
      console.log(`${operationName}: Operation timed out`);
      return null;
    }

    if (isUserRejectionError(error)) {
      console.log(`${operationName}: User rejected the transaction`);
      return null;
    }

    console.error(`${operationName} error:`, {
      name: error.name,
      message: error.message,
      code: error.code
    });

    throw new TransactionError(
      error.message || 'Operation failed',
      error.code || 'OPERATION_FAILED'
    );
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  baseDelay = RETRY_DELAY,
  operationName = 'Operation'
): Promise<T | null> {
  let lastError: any;
  let currentDelay = baseDelay;
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`${operationName}: Attempt ${i + 1}/${retries}`);
      const result = await operation();
      
      if (result === undefined) return null;
      
      console.log(`${operationName}: Success`);
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`${operationName}: Error:`, error);
      
      if (isUserRejectionError(error)) {
        console.log(`${operationName}: User rejected`);
        return null;
      }
      
      if (error.message?.includes('rate limit') || error.code === 429) {
        currentDelay = Math.min(currentDelay * 2, MAX_RATE_LIMIT_DELAY);
        console.log(`${operationName}: Rate limited, waiting ${currentDelay}ms`);
        await sleep(currentDelay);
        continue;
      }

      if (error.message?.includes('blockhash not found') || error.code === 404) {
        console.log(`${operationName}: Blockhash expired, retrying with minimal delay`);
        await sleep(1000);
        continue;
      }

      if (i === retries - 1) {
        console.log(`${operationName}: All attempts failed`);
        throw new TransactionError(
          `Operation failed after ${retries} attempts: ${error.message}`,
          error.code || 'OPERATION_FAILED'
        );
      }

      currentDelay = Math.min(currentDelay * 1.5, MAX_RATE_LIMIT_DELAY);
      console.log(`${operationName}: Retrying in ${currentDelay}ms...`);
      await sleep(currentDelay);
    }
  }
  
  return null;
}
