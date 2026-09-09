import { 
  NormalizedAddress, 
  NormalizedTransaction, 
  NormalizedBlock, 
  UTXO, 
  DetectedInputType 
} from '../../types/forensics';

export interface BlockchainProvider {
  name: string;
  getAddress(address: string): Promise<NormalizedAddress>;
  getAddressUtxos(address: string): Promise<UTXO[]>;
  getTransaction(txid: string): Promise<NormalizedTransaction>;
  getBlock(hashOrHeight: string | number): Promise<NormalizedBlock>;
  getLatestBlocks(limit?: number): Promise<NormalizedBlock[]>;
  getBtcPriceUsd(): Promise<number>;
}

export interface ProviderError {
  type: 'RATE_LIMIT' | 'UNAVAILABLE' | 'NOT_FOUND' | 'INVALID_INPUT' | 'NO_ACTIVITY';
  message: string;
  statusCode?: number;
  providerName?: string;
}

export function isProviderError(err: any): err is ProviderError {
  return err && typeof err === 'object' && 'type' in err && 'message' in err;
}
