import { 
  DetectedInputType, 
  NormalizedAddress, 
  NormalizedTransaction, 
  NormalizedBlock, 
  UTXO 
} from '../../types/forensics';
import { BlockchainProvider, ProviderError } from './types';
import { MempoolProvider } from './mempoolProvider';

export class BlockchainService {
  private primaryProvider: BlockchainProvider;
  private fallbackProvider: BlockchainProvider;
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private inFlightRequests: Map<string, Promise<any>> = new Map();

  constructor() {
    this.primaryProvider = new MempoolProvider('https://mempool.space/api');
    this.fallbackProvider = new MempoolProvider('https://blockstream.info/api');
  }

  /**
   * Automatically detects input type to prevent sending transaction hashes to address endpoints.
   */
  public detectInputType(query: string): DetectedInputType {
    const q = query.trim();
    if (!q) return 'UNKNOWN';

    // 1. Ethereum
    if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
      return 'ETHEREUM_ADDRESS';
    }
    if (/^0x[a-fA-F0-9]{64}$/.test(q)) {
      return 'ETHEREUM_TRANSACTION';
    }

    // 2. Bitcoin Block Height
    if (/^\d{1,7}$/.test(q) && parseInt(q, 10) < 5000000) {
      return 'BITCOIN_BLOCK_HEIGHT';
    }

    // 3. Bitcoin Block Hash (usually has multiple leading zeros e.g. 00000000...)
    if (/^00000000[a-fA-F0-9]{56}$/.test(q)) {
      return 'BITCOIN_BLOCK_HASH';
    }

    // 4. Bitcoin Transaction Hash (64 hex characters)
    if (/^[a-fA-F0-9]{64}$/.test(q)) {
      return 'BITCOIN_TRANSACTION';
    }

    // 5. Bitcoin Address (Bech32 Native Segwit / Taproot)
    if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(q)) {
      return 'BITCOIN_ADDRESS';
    }

    return 'UNKNOWN';
  }

  private async executeWithFallback<T>(
    cacheKey: string,
    operation: (p: BlockchainProvider) => Promise<T>,
    ttlMs = 30000
  ): Promise<T> {
    // 1. Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data as T;
    }

    // 2. Request deduplication (single in-flight request for identical key)
    if (this.inFlightRequests.has(cacheKey)) {
      return await this.inFlightRequests.get(cacheKey);
    }

    const requestPromise = (async () => {
      try {
        const result = await operation(this.primaryProvider);
        this.cache.set(cacheKey, { data: result, expiry: Date.now() + ttlMs });
        return result;
      } catch (err: any) {
        console.warn(`Primary provider (${this.primaryProvider.name}) failed, attempting fallback:`, err);
        try {
          const fallbackResult = await operation(this.fallbackProvider);
          this.cache.set(cacheKey, { data: fallbackResult, expiry: Date.now() + ttlMs });
          return fallbackResult;
        } catch (fallbackErr: any) {
          // Both failed, throw normalized error
          throw fallbackErr;
        }
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, requestPromise);
    return await requestPromise;
  }

  public async getAddress(address: string): Promise<NormalizedAddress> {
    const inputType = this.detectInputType(address);
    if (inputType === 'BITCOIN_TRANSACTION' || inputType === 'ETHEREUM_TRANSACTION') {
      throw {
        type: 'INVALID_INPUT',
        message: 'Transaction hash detected. Refusing to send transaction hash to address endpoint.'
      } as ProviderError;
    }

    return await this.executeWithFallback(
      `addr:${address}`,
      p => p.getAddress(address),
      15000
    );
  }

  public async getAddressUtxos(address: string): Promise<UTXO[]> {
    return await this.executeWithFallback(
      `utxo:${address}`,
      p => p.getAddressUtxos(address),
      15000
    );
  }

  public async getTransaction(txid: string): Promise<NormalizedTransaction> {
    return await this.executeWithFallback(
      `tx:${txid}`,
      p => p.getTransaction(txid),
      60000
    );
  }

  public async getBlock(hashOrHeight: string | number): Promise<NormalizedBlock> {
    return await this.executeWithFallback(
      `block:${hashOrHeight}`,
      p => p.getBlock(hashOrHeight),
      60000
    );
  }

  public async getLatestBlocks(limit = 6): Promise<NormalizedBlock[]> {
    return await this.executeWithFallback(
      `latest_blocks:${limit}`,
      p => p.getLatestBlocks(limit),
      20000
    );
  }

  public async getBtcPriceUsd(): Promise<number> {
    return await this.executeWithFallback(
      'btc_price_usd',
      p => p.getBtcPriceUsd(),
      60000
    );
  }

  public clearCache() {
    this.cache.clear();
  }
}

export const blockchainService = new BlockchainService();
