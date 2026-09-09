export type NetworkType = 'bitcoin' | 'ethereum';

export type DetectedInputType = 
  | 'BITCOIN_ADDRESS'
  | 'BITCOIN_TRANSACTION'
  | 'BITCOIN_BLOCK_HASH'
  | 'BITCOIN_BLOCK_HEIGHT'
  | 'ETHEREUM_ADDRESS'
  | 'ETHEREUM_TRANSACTION'
  | 'UNKNOWN';

export type NodeClassification = 
  | 'suspect'
  | 'intermediate'
  | 'vasp'
  | 'mixer'
  | 'bridge'
  | 'contract'
  | 'mining_pool'
  | 'change'
  | 'unknown';

export type VaspVerificationStatus = 'VERIFIED VASP' | 'PROBABLE VASP' | 'POSSIBLE VASP' | 'UNKNOWN';

export interface VaspRecord {
  id: string;
  name: string;
  legalEntityName?: string;
  category: 'CEX' | 'DEX' | 'MIXER' | 'BRIDGE' | 'PAYMENT_PROCESSOR' | 'MINING_POOL';
  country: string;
  jurisdictionRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'NON_COOPERATIVE';
  supportedNetworks: NetworkType[];
  knownAddresses: string[];
  knownClusters: string[];
  complianceEmail?: string;
  complianceContact?: string;
  leContact?: string;
  source: string;
  verificationStatus: VaspVerificationStatus;
  lastVerified: string;
  riskScore: number; // 0 to 100
  confidenceScore?: number;
}

export type VaspEntity = VaspRecord;

export interface UTXO {
  txid: string;
  vout: number;
  value: number; // satoshis
  valueBtc: number;
  address: string;
  scriptType?: string;
  scriptPubKey?: string;
  confirmations?: number;
  isSpent?: boolean;
  spendingTxid?: string;
  spendingVin?: number;
  blockHeight?: number;
  timestamp?: number;
}

export interface TxInput {
  txid: string;
  vout: number;
  prevout?: {
    value: number; // satoshis
    scriptpubkey_address?: string;
    scriptpubkey_type?: string;
    scriptpubkey?: string;
  };
  scriptsig?: string;
  witness?: string[];
  isCoinbase?: boolean;
  sequence?: number;
}

export interface TxOutput {
  value: number; // satoshis
  scriptpubkey: string;
  scriptpubkey_address?: string;
  scriptpubkey_type: string;
  isOpReturn?: boolean;
  opReturnData?: string;
  isChangeCandidate?: boolean;
  spent?: boolean;
}

export interface NormalizedTransaction {
  txid: string;
  network: NetworkType;
  status: 'confirmed' | 'unconfirmed' | 'mempool';
  confirmations: number;
  blockHeight?: number;
  blockHash?: string;
  timestamp: number;
  age: string;
  size: number;
  vsize: number;
  weight: number;
  version: number;
  locktime: number;
  rbf: boolean;
  feeSats: number;
  feeBtc: number;
  feeRateSatVb: number;
  inputCount: number;
  outputCount: number;
  totalInputValueBtc: number;
  totalOutputValueBtc: number;
  inputs: TxInput[];
  outputs: TxOutput[];
  scriptTypes: string[];
  hasOpReturn: boolean;
  opReturnPayloads: string[];
  changeCandidates: number[]; // indices in outputs
  valueTransferredBtc: number;
  usdEquivalent?: number;
  rawHex?: string;
}

export interface NormalizedAddress {
  address: string;
  network: NetworkType;
  addressType: 'Legacy (P2PKH)' | 'Nested SegWit (P2SH)' | 'Native SegWit (P2WPKH)' | 'Taproot (P2TR)' | 'Ethereum EOA' | 'Smart Contract' | 'Unknown';
  balanceSats: number;
  balanceBtc: number;
  balanceUsd?: number;
  totalReceivedBtc: number;
  totalSentBtc: number;
  txCount: number;
  unspentOutputCount: number;
  firstSeenTimestamp?: number;
  lastSeenTimestamp?: number;
  utxos: UTXO[];
  recentTransactions: NormalizedTransaction[];
  counterparties: { address: string; count: number; volumeBtc: number; entity?: string }[];
  knownEntity?: VaspRecord;
  riskScore: number;
  riskIndicators: string[];
  addressReuseCount: number;
  clusterId?: string;
}

export interface NormalizedBlock {
  height: number;
  hash: string;
  previousBlockHash: string;
  nextBlockHash?: string;
  timestamp: number;
  age: string;
  miner?: string;
  miningPool?: string;
  difficulty: number;
  nonce: number;
  version: number;
  merkleRoot: string;
  txCount: number;
  inputCount?: number;
  outputCount?: number;
  sizeBytes: number;
  weight: number;
  totalBtcTransferred: number;
  totalFeesBtc: number;
  averageTxValueBtc: number;
  transactions: NormalizedTransaction[];
}

export interface ProvenanceHop {
  hopNumber: number;
  txid: string;
  vin?: number;
  vout: number;
  sourceAddress: string;
  destinationAddress: string;
  amountBtc: number;
  feeBtc: number;
  timestamp: number;
  blockHeight?: number;
  parentUtxo?: string; // TXID:vout
  newUtxo?: string; // TXID:vout
  classification: NodeClassification;
  entityName?: string;
  reasonSelected: string;
  isChangeOutput: boolean;
  provenanceBreak: boolean;
  provenanceBreakReason?: string;
}

export interface ForensicGraphNode {
  id: string; // address or txid
  label: string;
  address?: string;
  type: NodeClassification;
  entityName?: string;
  entityCategory?: string;
  balanceBtc?: number;
  tracedAmountBtc?: number;
  hop: number;
  riskScore: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  isSuspect?: boolean;
  isTargetVasp?: boolean;
  clusterId?: string;
  provenanceBreak?: boolean;
}

export interface ForensicGraphEdge {
  id: string;
  source: string;
  target: string;
  txid: string;
  vout?: number;
  amountBtc: number;
  asset: string;
  timestamp: number;
  hop: number;
  isChange?: boolean;
  provenanceBreak?: boolean;
}

export interface ForensicIntelligence {
  investigationId: string;
  status: 'ANALYZING' | 'ATTRIBUTED' | 'PROVENANCE_BREAK' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_OUTBOUND';
  targetVasp?: VaspRecord;
  attributionConfidence: number; // 0 to 100
  evidenceCount: number;
  evidenceList: string[];
  initialTracedAmountBtc: number;
  currentTracedAmountBtc: number;
  totalForwardedAmountBtc: number;
  currentHop: number;
  totalHops: number;
  firstMovementTimestamp: number;
  lastMovementTimestamp: number;
  transactionsAnalyzedCount: number;
  walletsAnalyzedCount: number;
  riskScore: number;
  durationMs: number;
  network: NetworkType;
  suspectAddress: string;
  mode: 'LIVE' | 'ARCHIVE';
  auditTrail: {
    step: string;
    detail: string;
    timestamp: number;
  }[];
}

export interface ForensicCaseFixture {
  id: string;
  title: string;
  caseCode: string;
  description: string;
  suspectAddress: string;
  network: NetworkType;
  initialAmountBtc: number;
  targetVaspName: string;
  confidence: number;
  nodes: ForensicGraphNode[];
  edges: ForensicGraphEdge[];
  hops: ProvenanceHop[];
  intelligence: ForensicIntelligence;
  transactions: NormalizedTransaction[];
  wallets: Record<string, NormalizedAddress>;
}
