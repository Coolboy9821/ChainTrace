import { BlockchainProvider, ProviderError } from './types';
import { 
  NormalizedAddress, 
  NormalizedTransaction, 
  NormalizedBlock, 
  UTXO, 
  TxInput, 
  TxOutput 
} from '../../types/forensics';
import { findVaspByAddress } from '../vasp/vaspRegistry';

export class MempoolProvider implements BlockchainProvider {
  public name = 'Mempool.space API';
  private baseUrl: string;

  constructor(baseUrl = 'https://mempool.space/api') {
    this.baseUrl = baseUrl;
  }

  private async fetchJson<T>(endpoint: string, timeoutMs = 8000): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}${endpoint}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });

      if (res.status === 429) {
        const err: ProviderError = {
          type: 'RATE_LIMIT',
          message: 'Blockchain provider rate limited (HTTP 429). Please wait a moment or switch to fallback.',
          statusCode: 429,
          providerName: this.name
        };
        throw err;
      }

      if (res.status >= 500) {
        const err: ProviderError = {
          type: 'UNAVAILABLE',
          message: `Blockchain data unavailable (HTTP ${res.status}). External node temporarily unreachable.`,
          statusCode: res.status,
          providerName: this.name
        };
        throw err;
      }

      if (res.status === 404) {
        const err: ProviderError = {
          type: 'NOT_FOUND',
          message: 'Object not found on Bitcoin mainnet.',
          statusCode: 404,
          providerName: this.name
        };
        throw err;
      }

      if (!res.ok) {
        const err: ProviderError = {
          type: 'UNAVAILABLE',
          message: `Blockchain query failed: ${res.statusText}`,
          statusCode: res.status,
          providerName: this.name
        };
        throw err;
      }

      return await res.json() as T;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        throw {
          type: 'UNAVAILABLE',
          message: 'Blockchain data request timed out.',
          providerName: this.name
        } as ProviderError;
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  public async getBtcPriceUsd(): Promise<number> {
    try {
      const data = await this.fetchJson<{ USD: number }>('/v1/prices');
      return data.USD || 92450;
    } catch {
      return 92450;
    }
  }

  public async getAddress(address: string): Promise<NormalizedAddress> {
    const cleanAddr = address.trim();
    // 1. Fetch address stats
    const addrData = await this.fetchJson<any>(`/address/${cleanAddr}`);
    
    // 2. Fetch UTXOs
    const utxos = await this.getAddressUtxos(cleanAddr).catch(() => []);

    // 3. Fetch recent txs
    const rawTxs = await this.fetchJson<any[]>(`/address/${cleanAddr}/txs`).catch(() => []);
    const normalizedTxs = rawTxs.map(tx => this.normalizeEsploraTx(tx));

    const fundedSum = (addrData.chain_stats?.funded_txo_sum || 0) + (addrData.mempool_stats?.funded_txo_sum || 0);
    const spentSum = (addrData.chain_stats?.spent_txo_sum || 0) + (addrData.mempool_stats?.spent_txo_sum || 0);
    const balanceSats = fundedSum - spentSum;
    const txCount = (addrData.chain_stats?.tx_count || 0) + (addrData.mempool_stats?.tx_count || 0);

    // Address type determination
    let addressType: NormalizedAddress['addressType'] = 'Unknown';
    if (cleanAddr.startsWith('bc1q')) addressType = 'Native SegWit (P2WPKH)';
    else if (cleanAddr.startsWith('bc1p')) addressType = 'Taproot (P2TR)';
    else if (cleanAddr.startsWith('3')) addressType = 'Nested SegWit (P2SH)';
    else if (cleanAddr.startsWith('1')) addressType = 'Legacy (P2PKH)';

    // Counterparties calculation
    const counterpartyMap: Record<string, { count: number; volumeSats: number }> = {};
    normalizedTxs.forEach(tx => {
      tx.inputs.forEach(inp => {
        const cp = inp.prevout?.scriptpubkey_address;
        if (cp && cp !== cleanAddr) {
          if (!counterpartyMap[cp]) counterpartyMap[cp] = { count: 0, volumeSats: 0 };
          counterpartyMap[cp].count += 1;
          counterpartyMap[cp].volumeSats += inp.prevout?.value || 0;
        }
      });
      tx.outputs.forEach(out => {
        const cp = out.scriptpubkey_address;
        if (cp && cp !== cleanAddr) {
          if (!counterpartyMap[cp]) counterpartyMap[cp] = { count: 0, volumeSats: 0 };
          counterpartyMap[cp].count += 1;
          counterpartyMap[cp].volumeSats += out.value || 0;
        }
      });
    });

    const counterparties = Object.entries(counterpartyMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([addr, data]) => {
        const vasp = findVaspByAddress(addr);
        return {
          address: addr,
          count: data.count,
          volumeBtc: data.volumeSats / 1e8,
          entity: vasp?.name
        };
      });

    const knownVasp = findVaspByAddress(cleanAddr);
    const riskIndicators: string[] = [];
    if (txCount === 0) riskIndicators.push('Dormant or uninitialized wallet');
    if (txCount > 500) riskIndicators.push('High volume transaction frequency (potential service/hot wallet)');
    if (counterparties.some(cp => cp.entity && cp.entity.includes('Wasabi'))) {
      riskIndicators.push('Direct interaction with CoinJoin coordinator');
    }

    return {
      address: cleanAddr,
      network: 'bitcoin',
      addressType,
      balanceSats,
      balanceBtc: balanceSats / 1e8,
      totalReceivedBtc: fundedSum / 1e8,
      totalSentBtc: spentSum / 1e8,
      txCount,
      unspentOutputCount: utxos.length,
      firstSeenTimestamp: normalizedTxs.length > 0 ? normalizedTxs[normalizedTxs.length - 1].timestamp : undefined,
      lastSeenTimestamp: normalizedTxs.length > 0 ? normalizedTxs[0].timestamp : undefined,
      utxos,
      recentTransactions: normalizedTxs,
      counterparties,
      knownEntity: knownVasp,
      riskScore: knownVasp?.riskScore || (riskIndicators.length * 20),
      riskIndicators,
      addressReuseCount: txCount > 1 ? txCount - 1 : 0
    };
  }

  public async getAddressUtxos(address: string): Promise<UTXO[]> {
    const clean = address.trim();
    const rawUtxos = await this.fetchJson<any[]>(`/address/${clean}/utxo`);
    return rawUtxos.map(u => ({
      txid: u.txid,
      vout: u.vout,
      value: u.value,
      valueBtc: u.value / 1e8,
      address: clean,
      confirmations: u.status?.confirmed ? (u.status.block_height ? 1 : 0) : 0,
      isSpent: false,
      blockHeight: u.status?.block_height,
      timestamp: u.status?.block_time
    }));
  }

  public async getTransaction(txid: string): Promise<NormalizedTransaction> {
    const cleanTxid = txid.trim();
    const rawTx = await this.fetchJson<any>(`/tx/${cleanTxid}`);
    return this.normalizeEsploraTx(rawTx);
  }

  public async getBlock(hashOrHeight: string | number): Promise<NormalizedBlock> {
    let blockHash = String(hashOrHeight).trim();
    // If numeric height, resolve hash first
    if (/^\d+$/.test(blockHash)) {
      const res = await fetch(`${this.baseUrl}/block-height/${blockHash}`);
      if (!res.ok) throw { type: 'NOT_FOUND', message: `Block height ${blockHash} not found` } as ProviderError;
      blockHash = await res.text();
    }

    const rawBlock = await this.fetchJson<any>(`/block/${blockHash}`);
    const rawTxs = await this.fetchJson<any[]>(`/block/${blockHash}/txs/0`).catch(() => []);

    const transactions = rawTxs.map(tx => this.normalizeEsploraTx(tx));
    const totalFeesSats = transactions.reduce((acc, t) => acc + t.feeSats, 0);
    const totalBtcTransferred = transactions.reduce((acc, t) => acc + t.totalOutputValueBtc, 0);

    // Miner pool detection heuristic from coinbase script
    let miningPool = 'Unknown Miner';
    if (transactions[0]?.inputs[0]?.scriptsig) {
      const sigHex = transactions[0].inputs[0].scriptsig;
      const sigAscii = hexToAscii(sigHex);
      if (sigAscii.includes('Foundry')) miningPool = 'Foundry USA';
      else if (sigAscii.includes('AntPool')) miningPool = 'AntPool';
      else if (sigAscii.includes('F2Pool')) miningPool = 'F2Pool';
      else if (sigAscii.includes('Binance')) miningPool = 'Binance Pool';
      else if (sigAscii.includes('ViaBTC')) miningPool = 'ViaBTC';
      else if (sigAscii.includes('MaraPool')) miningPool = 'MARA Pool';
    }

    return {
      height: rawBlock.height,
      hash: rawBlock.id,
      previousBlockHash: rawBlock.previousblockhash,
      timestamp: rawBlock.timestamp,
      age: formatAge(rawBlock.timestamp),
      miner: miningPool,
      miningPool,
      difficulty: rawBlock.difficulty,
      nonce: rawBlock.nonce,
      version: rawBlock.version,
      merkleRoot: rawBlock.merkle_root,
      txCount: rawBlock.tx_count,
      sizeBytes: rawBlock.size,
      weight: rawBlock.weight,
      totalBtcTransferred,
      totalFeesBtc: totalFeesSats / 1e8,
      averageTxValueBtc: rawBlock.tx_count > 0 ? (totalBtcTransferred / rawBlock.tx_count) : 0,
      transactions
    };
  }

  public async getLatestBlocks(limit = 6): Promise<NormalizedBlock[]> {
    const rawBlocks = await this.fetchJson<any[]>('/v1/blocks');
    return (rawBlocks || []).slice(0, limit).map(b => ({
      height: b.height,
      hash: b.id,
      previousBlockHash: b.previousblockhash,
      timestamp: b.timestamp,
      age: formatAge(b.timestamp),
      difficulty: b.difficulty || 0,
      nonce: b.nonce || 0,
      version: b.version || 0,
      merkleRoot: b.merkle_root || '',
      txCount: b.tx_count,
      sizeBytes: b.size,
      weight: b.weight,
      totalBtcTransferred: 0,
      totalFeesBtc: 0,
      averageTxValueBtc: 0,
      transactions: []
    }));
  }

  private normalizeEsploraTx(tx: any): NormalizedTransaction {
    const inputs: TxInput[] = (tx.vin || []).map((vin: any) => ({
      txid: vin.txid || '',
      vout: vin.vout || 0,
      prevout: vin.prevout ? {
        value: vin.prevout.value,
        scriptpubkey_address: vin.prevout.scriptpubkey_address,
        scriptpubkey_type: vin.prevout.scriptpubkey_type,
        scriptpubkey: vin.prevout.scriptpubkey
      } : undefined,
      scriptsig: vin.scriptsig,
      witness: vin.witness,
      isCoinbase: vin.is_coinbase || false,
      sequence: vin.sequence
    }));

    const scriptTypes = new Set<string>();
    const opReturnPayloads: string[] = [];

    const outputs: TxOutput[] = (tx.vout || []).map((vout: any) => {
      const isOpRet = vout.scriptpubkey_type === 'op_return' || (vout.scriptpubkey && vout.scriptpubkey.startsWith('6a'));
      if (vout.scriptpubkey_type) scriptTypes.add(vout.scriptpubkey_type);
      if (isOpRet) {
        opReturnPayloads.push(vout.scriptpubkey_asm || vout.scriptpubkey);
      }
      return {
        value: vout.value,
        scriptpubkey: vout.scriptpubkey,
        scriptpubkey_address: vout.scriptpubkey_address,
        scriptpubkey_type: vout.scriptpubkey_type || 'unknown',
        isOpReturn: isOpRet,
        opReturnData: isOpRet ? (vout.scriptpubkey_asm || vout.scriptpubkey) : undefined
      };
    });

    const totalInputSats = inputs.reduce((acc, i) => acc + (i.prevout?.value || 0), 0);
    const totalOutputSats = outputs.reduce((acc, o) => acc + o.value, 0);
    const feeSats = tx.fee !== undefined ? tx.fee : Math.max(0, totalInputSats - totalOutputSats);
    const vsize = tx.vsize || (tx.weight ? Math.ceil(tx.weight / 4) : tx.size);

    return {
      txid: tx.txid,
      network: 'bitcoin',
      status: tx.status?.confirmed ? 'confirmed' : 'mempool',
      confirmations: tx.status?.confirmed ? (tx.status.block_height ? 1 : 0) : 0,
      blockHeight: tx.status?.block_height,
      blockHash: tx.status?.block_hash,
      timestamp: tx.status?.block_time || Math.floor(Date.now() / 1000),
      age: formatAge(tx.status?.block_time || Math.floor(Date.now() / 1000)),
      size: tx.size,
      vsize,
      weight: tx.weight || (tx.size * 4),
      version: tx.version || 2,
      locktime: tx.locktime || 0,
      rbf: inputs.some(i => i.sequence !== undefined && i.sequence < 0xfffffffe),
      feeSats,
      feeBtc: feeSats / 1e8,
      feeRateSatVb: vsize > 0 ? +(feeSats / vsize).toFixed(1) : 0,
      inputCount: inputs.length,
      outputCount: outputs.length,
      totalInputValueBtc: totalInputSats / 1e8,
      totalOutputValueBtc: totalOutputSats / 1e8,
      inputs,
      outputs,
      scriptTypes: Array.from(scriptTypes),
      hasOpReturn: opReturnPayloads.length > 0,
      opReturnPayloads,
      changeCandidates: [],
      valueTransferredBtc: totalOutputSats / 1e8
    };
  }
}

function hexToAscii(hex: string): string {
  if (!hex) return '';
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substr(i, 2), 16);
    if (code >= 32 && code <= 126) {
      str += String.fromCharCode(code);
    }
  }
  return str;
}

export function formatAge(timestamp: number): string {
  if (!timestamp) return 'Unknown';
  const now = Math.floor(Date.now() / 1000);
  const diffSec = Math.max(0, now - timestamp);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
