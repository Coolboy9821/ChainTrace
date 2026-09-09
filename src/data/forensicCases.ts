import { ForensicCaseFixture, NormalizedTransaction, NormalizedAddress } from '../types/forensics';
import { KNOWN_VASPS } from '../services/vasp/vaspRegistry';

export const FORENSIC_CASES: ForensicCaseFixture[] = [
  {
    id: 'anv-case-btc-001',
    caseCode: 'ANV-CASE-BTC-001',
    title: 'Ransomware Peel Chain Attribution',
    description: 'Deterministic 3-hop peel chain originating from ransomware extortion wallet, concluding at Binance deposit cluster.',
    network: 'bitcoin',
    suspectAddress: 'bc1q_case_ransom_extortion_889x',
    initialAmountBtc: 1.00000000,
    targetVaspName: 'Binance (VERIFIED ENTITY)',
    confidence: 94,
    intelligence: {
      investigationId: 'ANV-CASE-BTC-001',
      status: 'ATTRIBUTED',
      targetVasp: {
        ...KNOWN_VASPS[0],
        name: 'Binance (VERIFIED ENTITY)',
        source: 'SIMULATED ARCHIVE FIXTURE - For Training & SIH Forensic Evaluation Only'
      },
      attributionConfidence: 94,
      evidenceCount: 4,
      evidenceList: [
        'Direct cryptographic match with known Binance omnibus deposit address cluster',
        'Characteristic peel chain transaction topology with change address recycling',
        'Consolidation transaction swept directly into verified hot-wallet pool',
        'Timing interval between hops <14 minutes (automated sweep algorithm)'
      ],
      initialTracedAmountBtc: 1.00000000,
      currentTracedAmountBtc: 0.78985000,
      totalForwardedAmountBtc: 0.78985000,
      currentHop: 3,
      totalHops: 3,
      firstMovementTimestamp: 1752750000, // 17 Jul 2025
      lastMovementTimestamp: 1752836400, // 18 Jul 2025
      transactionsAnalyzedCount: 5,
      walletsAnalyzedCount: 4,
      riskScore: 92,
      durationMs: 86400000,
      network: 'bitcoin',
      suspectAddress: 'bc1q_case_ransom_extortion_889x',
      mode: 'ARCHIVE',
      auditTrail: [
        { step: 'Ingestion', detail: 'Loaded deterministic fixture ANV-CASE-BTC-001 (Simulated Data)', timestamp: 1752750000 },
        { step: 'Hop 1 Evaluation', detail: 'Evaluated tx 4a9f... 1.0000 BTC spent into 0.8000 BTC forward + 0.19985 BTC change', timestamp: 1752751200 },
        { step: 'Hop 2 Evaluation', detail: 'Evaluated tx 7c1e... 0.8000 BTC spent into 0.7900 BTC forward + 0.00985 BTC change', timestamp: 1752794400 },
        { step: 'Terminus Attribution', detail: 'Target address matched verified Binance deposit omnibus (attribution confidence 94%)', timestamp: 1752836400 }
      ]
    },
    nodes: [
      {
        id: 'bc1q_case_ransom_extortion_889x',
        label: 'Suspect Extortion Wallet',
        address: 'bc1q_case_ransom_extortion_889x',
        type: 'suspect',
        isSuspect: true,
        hop: 0,
        riskScore: 95,
        balanceBtc: 0.00000000,
        tracedAmountBtc: 1.00000000,
        x: 80,
        y: 220
      },
      {
        id: 'bc1q_case_peel_hop1_771y',
        label: 'Intermediate Hop 1',
        address: 'bc1q_case_peel_hop1_771y',
        type: 'intermediate',
        hop: 1,
        riskScore: 78,
        balanceBtc: 0.00000000,
        tracedAmountBtc: 0.80000000,
        x: 280,
        y: 160
      },
      {
        id: 'bc1q_case_change_hop1_992c',
        label: 'Suspect Change (Hop 1)',
        address: 'bc1q_case_change_hop1_992c',
        type: 'change',
        hop: 1,
        riskScore: 65,
        balanceBtc: 0.19985000,
        tracedAmountBtc: 0.19985000,
        x: 280,
        y: 300
      },
      {
        id: 'bc1q_case_peel_hop2_443z',
        label: 'Intermediate Hop 2',
        address: 'bc1q_case_peel_hop2_443z',
        type: 'intermediate',
        hop: 2,
        riskScore: 68,
        balanceBtc: 0.00000000,
        tracedAmountBtc: 0.79000000,
        x: 480,
        y: 160
      },
      {
        id: 'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97',
        label: 'Binance (VERIFIED ENTITY)',
        address: 'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97',
        type: 'vasp',
        isTargetVasp: true,
        entityName: 'Binance (VERIFIED ENTITY)',
        entityCategory: 'CEX',
        hop: 3,
        riskScore: 24,
        balanceBtc: 42.85000000,
        tracedAmountBtc: 0.78985000,
        x: 680,
        y: 160
      }
    ],
    edges: [
      {
        id: 'edge_0_1',
        source: 'bc1q_case_ransom_extortion_889x',
        target: 'bc1q_case_peel_hop1_771y',
        txid: '4a9f82d1c01e92384a8bc93410fe912a7810ec5a1098bca4109876543210abcd',
        vout: 0,
        amountBtc: 0.80000000,
        asset: 'BTC',
        timestamp: 1752751200,
        hop: 1
      },
      {
        id: 'edge_0_change',
        source: 'bc1q_case_ransom_extortion_889x',
        target: 'bc1q_case_change_hop1_992c',
        txid: '4a9f82d1c01e92384a8bc93410fe912a7810ec5a1098bca4109876543210abcd',
        vout: 1,
        amountBtc: 0.19985000,
        asset: 'BTC',
        timestamp: 1752751200,
        hop: 1,
        isChange: true
      },
      {
        id: 'edge_1_2',
        source: 'bc1q_case_peel_hop1_771y',
        target: 'bc1q_case_peel_hop2_443z',
        txid: '7c1e991204fab33910cd049108ec73901a9f029148bc0192837465019283abcd',
        vout: 0,
        amountBtc: 0.79000000,
        asset: 'BTC',
        timestamp: 1752794400,
        hop: 2
      },
      {
        id: 'edge_2_3',
        source: 'bc1q_case_peel_hop2_443z',
        target: 'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97',
        txid: '9902ba71092837465019283abcd4a9f82d1c01e92384a8bc93410fe912a7810e',
        vout: 0,
        amountBtc: 0.78985000,
        asset: 'BTC',
        timestamp: 1752836400,
        hop: 3
      }
    ],
    hops: [
      {
        hopNumber: 1,
        txid: '4a9f82d1c01e92384a8bc93410fe912a7810ec5a1098bca4109876543210abcd',
        vout: 0,
        sourceAddress: 'bc1q_case_ransom_extortion_889x',
        destinationAddress: 'bc1q_case_peel_hop1_771y',
        amountBtc: 0.80000000,
        feeBtc: 0.00015000,
        timestamp: 1752751200,
        blockHeight: 890120,
        parentUtxo: '9f0182...:0',
        newUtxo: '4a9f82...:0',
        classification: 'intermediate',
        reasonSelected: 'Primary peel transfer output (0.8000 BTC forwarded, 0.19985 BTC retained as change)',
        isChangeOutput: false,
        provenanceBreak: false
      },
      {
        hopNumber: 2,
        txid: '7c1e991204fab33910cd049108ec73901a9f029148bc0192837465019283abcd',
        vout: 0,
        sourceAddress: 'bc1q_case_peel_hop1_771y',
        destinationAddress: 'bc1q_case_peel_hop2_443z',
        amountBtc: 0.79000000,
        feeBtc: 0.00015000,
        timestamp: 1752794400,
        blockHeight: 890145,
        parentUtxo: '4a9f82...:0',
        newUtxo: '7c1e99...:0',
        classification: 'intermediate',
        reasonSelected: 'Secondary peel output (0.7900 BTC forwarded to relay wallet)',
        isChangeOutput: false,
        provenanceBreak: false
      },
      {
        hopNumber: 3,
        txid: '9902ba71092837465019283abcd4a9f82d1c01e92384a8bc93410fe912a7810e',
        vout: 0,
        sourceAddress: 'bc1q_case_peel_hop2_443z',
        destinationAddress: 'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97',
        amountBtc: 0.78985000,
        feeBtc: 0.00015000,
        timestamp: 1752836400,
        blockHeight: 890180,
        parentUtxo: '7c1e99...:0',
        newUtxo: '9902ba...:0',
        classification: 'vasp',
        entityName: 'Binance (VERIFIED ENTITY)',
        reasonSelected: 'Attributed to verified Binance omnibus deposit address with 94% forensic confidence',
        isChangeOutput: false,
        provenanceBreak: false
      }
    ],
    transactions: [
      {
        txid: '4a9f82d1c01e92384a8bc93410fe912a7810ec5a1098bca4109876543210abcd',
        network: 'bitcoin',
        status: 'confirmed',
        confirmations: 1420,
        blockHeight: 890120,
        blockHash: '000000000000000000021abf8374928172648291039847192837465910293847',
        timestamp: 1752751200,
        age: '142d ago',
        size: 224,
        vsize: 142,
        weight: 568,
        version: 2,
        locktime: 0,
        rbf: true,
        feeSats: 15000,
        feeBtc: 0.00015000,
        feeRateSatVb: 105.6,
        inputCount: 1,
        outputCount: 2,
        totalInputValueBtc: 1.00000000,
        totalOutputValueBtc: 0.99985000,
        inputs: [
          {
            txid: '9f01827465019283abcd4a9f82d1c01e92384a8bc93410fe912a7810ec5a1098',
            vout: 0,
            prevout: {
              value: 100000000,
              scriptpubkey_address: 'bc1q_case_ransom_extortion_889x',
              scriptpubkey_type: 'v0_p2wpkh',
              scriptpubkey: '0014892748192847192847192847192847192847'
            }
          }
        ],
        outputs: [
          {
            value: 80000000,
            scriptpubkey: '0014771928471928471928471928471928471928',
            scriptpubkey_address: 'bc1q_case_peel_hop1_771y',
            scriptpubkey_type: 'v0_p2wpkh',
            isChangeCandidate: false
          },
          {
            value: 19985000,
            scriptpubkey: '0014992928471928471928471928471928471928',
            scriptpubkey_address: 'bc1q_case_change_hop1_992c',
            scriptpubkey_type: 'v0_p2wpkh',
            isChangeCandidate: true
          }
        ],
        scriptTypes: ['v0_p2wpkh'],
        hasOpReturn: false,
        opReturnPayloads: [],
        changeCandidates: [1],
        valueTransferredBtc: 0.80000000
      },
      {
        txid: '7c1e991204fab33910cd049108ec73901a9f029148bc0192837465019283abcd',
        network: 'bitcoin',
        status: 'confirmed',
        confirmations: 1395,
        blockHeight: 890145,
        blockHash: '000000000000000000018abf8374928172648291039847192837465910293848',
        timestamp: 1752794400,
        age: '141d ago',
        size: 224,
        vsize: 142,
        weight: 568,
        version: 2,
        locktime: 0,
        rbf: true,
        feeSats: 15000,
        feeBtc: 0.00015000,
        feeRateSatVb: 105.6,
        inputCount: 1,
        outputCount: 2,
        totalInputValueBtc: 0.80000000,
        totalOutputValueBtc: 0.79985000,
        inputs: [
          {
            txid: '4a9f82d1c01e92384a8bc93410fe912a7810ec5a1098bca4109876543210abcd',
            vout: 0,
            prevout: {
              value: 80000000,
              scriptpubkey_address: 'bc1q_case_peel_hop1_771y',
              scriptpubkey_type: 'v0_p2wpkh',
              scriptpubkey: '0014771928471928471928471928471928471928'
            }
          }
        ],
        outputs: [
          {
            value: 79000000,
            scriptpubkey: '0014443928471928471928471928471928471928',
            scriptpubkey_address: 'bc1q_case_peel_hop2_443z',
            scriptpubkey_type: 'v0_p2wpkh',
            isChangeCandidate: false
          },
          {
            value: 985000,
            scriptpubkey: '0014881928471928471928471928471928471928',
            scriptpubkey_address: 'bc1q_case_change_hop2_881x',
            scriptpubkey_type: 'v0_p2wpkh',
            isChangeCandidate: true
          }
        ],
        scriptTypes: ['v0_p2wpkh'],
        hasOpReturn: false,
        opReturnPayloads: [],
        changeCandidates: [1],
        valueTransferredBtc: 0.79000000
      },
      {
        txid: '9902ba71092837465019283abcd4a9f82d1c01e92384a8bc93410fe912a7810e',
        network: 'bitcoin',
        status: 'confirmed',
        confirmations: 1360,
        blockHeight: 890180,
        blockHash: '000000000000000000012abf8374928172648291039847192837465910293849',
        timestamp: 1752836400,
        age: '141d ago',
        size: 224,
        vsize: 142,
        weight: 568,
        version: 2,
        locktime: 0,
        rbf: false,
        feeSats: 15000,
        feeBtc: 0.00015000,
        feeRateSatVb: 105.6,
        inputCount: 1,
        outputCount: 1,
        totalInputValueBtc: 0.79000000,
        totalOutputValueBtc: 0.78985000,
        inputs: [
          {
            txid: '7c1e991204fab33910cd049108ec73901a9f029148bc0192837465019283abcd',
            vout: 0,
            prevout: {
              value: 79000000,
              scriptpubkey_address: 'bc1q_case_peel_hop2_443z',
              scriptpubkey_type: 'v0_p2wpkh',
              scriptpubkey: '0014443928471928471928471928471928471928'
            }
          }
        ],
        outputs: [
          {
            value: 78985000,
            scriptpubkey: '001469a482910394857291039485729103948572',
            scriptpubkey_address: 'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97',
            scriptpubkey_type: 'v0_p2wpkh',
            isChangeCandidate: false
          }
        ],
        scriptTypes: ['v0_p2wpkh'],
        hasOpReturn: false,
        opReturnPayloads: [],
        changeCandidates: [],
        valueTransferredBtc: 0.78985000
      }
    ],
    wallets: {
      'bc1q_case_ransom_extortion_889x': {
        address: 'bc1q_case_ransom_extortion_889x',
        network: 'bitcoin',
        addressType: 'Native SegWit (P2WPKH)',
        balanceSats: 0,
        balanceBtc: 0,
        totalReceivedBtc: 1.00000000,
        totalSentBtc: 1.00000000,
        txCount: 2,
        unspentOutputCount: 0,
        utxos: [],
        recentTransactions: [],
        counterparties: [
          { address: 'bc1q_case_peel_hop1_771y', count: 1, volumeBtc: 0.80000000 },
          { address: 'bc1q_case_change_hop1_992c', count: 1, volumeBtc: 0.19985000 }
        ],
        riskScore: 95,
        riskIndicators: [
          'SIMULATED ARCHIVE: Extortion/ransomware ransom delivery point',
          'Immediate forwarding via peel chain heuristic within single confirmation block'
        ],
        addressReuseCount: 1
      },
      'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97': {
        address: 'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97',
        network: 'bitcoin',
        addressType: 'Native SegWit (P2WPKH)',
        balanceSats: 4285000000,
        balanceBtc: 42.85000000,
        totalReceivedBtc: 14890.25000000,
        totalSentBtc: 14847.40000000,
        txCount: 48920,
        unspentOutputCount: 14,
        utxos: [],
        recentTransactions: [],
        counterparties: [],
        knownEntity: {
          ...KNOWN_VASPS[0],
          name: 'Binance (VERIFIED ENTITY)'
        },
        riskScore: 24,
        riskIndicators: [
          'SIMULATED ARCHIVE: Verified Exchange Hot Wallet Pool',
          'KYC & AML Compliant Jurisdiction'
        ],
        addressReuseCount: 48919
      }
    }
  },
  {
    id: 'anv-case-btc-002',
    caseCode: 'ANV-CASE-BTC-002',
    title: 'Strict UTXO Conservation (0.005 BTC Trace Through 2.8 BTC Wallet)',
    description: 'Exhibits Test G compliance: Tracing 0.005 BTC through an intermediate wallet holding 2.80000000 BTC without contaminating or ballooning the traced amount.',
    network: 'bitcoin',
    suspectAddress: 'bc1q_case_theft_source_005btc',
    initialAmountBtc: 0.00500000,
    targetVaspName: 'Coinbase (VERIFIED ENTITY)',
    confidence: 89,
    intelligence: {
      investigationId: 'ANV-CASE-BTC-002',
      status: 'ATTRIBUTED',
      targetVasp: {
        ...KNOWN_VASPS[1],
        name: 'Coinbase (VERIFIED ENTITY)',
        source: 'SIMULATED ARCHIVE FIXTURE - Provenance Test Case'
      },
      attributionConfidence: 89,
      evidenceCount: 3,
      evidenceList: [
        'UTXO amount conserved precisely across 2.8000 BTC co-mingling wallet (~0.00485 BTC)',
        'Change-output isolation verified; non-investigation UTXOs excluded',
        'Direct deposit to Coinbase Prime institutional deposit route'
      ],
      initialTracedAmountBtc: 0.00500000,
      currentTracedAmountBtc: 0.00485000,
      totalForwardedAmountBtc: 0.00485000,
      currentHop: 2,
      totalHops: 2,
      firstMovementTimestamp: 1752900000,
      lastMovementTimestamp: 1752950000,
      transactionsAnalyzedCount: 3,
      walletsAnalyzedCount: 3,
      riskScore: 74,
      durationMs: 50000000,
      network: 'bitcoin',
      suspectAddress: 'bc1q_case_theft_source_005btc',
      mode: 'ARCHIVE',
      auditTrail: [
        { step: 'UTXO Provenance Check', detail: 'Traced input: 0.005000 BTC. Intermediate wallet balance is 2.800000 BTC. Traced branch strictly kept to 0.00485 BTC (fee 0.00015 BTC)', timestamp: 1752900000 },
        { step: 'Attribution', detail: 'Arrived at Coinbase Prime Deposit Address without value inflation', timestamp: 1752950000 }
      ]
    },
    nodes: [
      {
        id: 'bc1q_case_theft_source_005btc',
        label: 'Suspect Wallet (0.005 BTC)',
        address: 'bc1q_case_theft_source_005btc',
        type: 'suspect',
        isSuspect: true,
        hop: 0,
        riskScore: 85,
        balanceBtc: 0.00000000,
        tracedAmountBtc: 0.00500000,
        x: 100,
        y: 200
      },
      {
        id: 'bc1q_case_whale_relay_28btc',
        label: 'Relay Wallet (Holding 2.8 BTC)',
        address: 'bc1q_case_whale_relay_28btc',
        type: 'intermediate',
        hop: 1,
        riskScore: 40,
        balanceBtc: 2.80000000,
        tracedAmountBtc: 0.00485000,
        x: 380,
        y: 200
      },
      {
        id: '3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS',
        label: 'Coinbase (VERIFIED ENTITY)',
        address: '3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS',
        type: 'vasp',
        isTargetVasp: true,
        entityName: 'Coinbase (VERIFIED ENTITY)',
        hop: 2,
        riskScore: 12,
        balanceBtc: 88.40000000,
        tracedAmountBtc: 0.00470000,
        x: 660,
        y: 200
      }
    ],
    edges: [
      {
        id: 'e_002_1',
        source: 'bc1q_case_theft_source_005btc',
        target: 'bc1q_case_whale_relay_28btc',
        txid: '11223344556677889900aabbccddeeff00112233445566778899aabbccddeeff',
        amountBtc: 0.00485000,
        asset: 'BTC',
        timestamp: 1752900000,
        hop: 1
      },
      {
        id: 'e_002_2',
        source: 'bc1q_case_whale_relay_28btc',
        target: '3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS',
        txid: 'aabbccddeeff001122334455667788990011223344556677889900aabbccddeeff',
        amountBtc: 0.00470000,
        asset: 'BTC',
        timestamp: 1752950000,
        hop: 2
      }
    ],
    hops: [
      {
        hopNumber: 1,
        txid: '11223344556677889900aabbccddeeff00112233445566778899aabbccddeeff',
        vout: 0,
        sourceAddress: 'bc1q_case_theft_source_005btc',
        destinationAddress: 'bc1q_case_whale_relay_28btc',
        amountBtc: 0.00485000,
        feeBtc: 0.00015000,
        timestamp: 1752900000,
        blockHeight: 890200,
        parentUtxo: 'init_tx:0',
        newUtxo: '1122...:0',
        classification: 'intermediate',
        reasonSelected: 'Exact UTXO provenance isolated; destination owns unrelated 2.8 BTC which was correctly ignored',
        isChangeOutput: false,
        provenanceBreak: false
      },
      {
        hopNumber: 2,
        txid: 'aabbccddeeff001122334455667788990011223344556677889900aabbccddeeff',
        vout: 0,
        sourceAddress: 'bc1q_case_whale_relay_28btc',
        destinationAddress: '3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS',
        amountBtc: 0.00470000,
        feeBtc: 0.00015000,
        timestamp: 1752950000,
        blockHeight: 890240,
        parentUtxo: '1122...:0',
        newUtxo: 'aabb...:0',
        classification: 'vasp',
        entityName: 'Coinbase (VERIFIED ENTITY)',
        reasonSelected: 'Forwarded 0.00470 BTC to verified Coinbase institutional deposit cluster',
        isChangeOutput: false,
        provenanceBreak: false
      }
    ],
    transactions: [],
    wallets: {}
  },
  {
    id: 'anv-case-btc-003',
    caseCode: 'ANV-CASE-BTC-003',
    title: 'Fund Provenance Break Detection (Inflation Halted)',
    description: 'Exhibits Test G/H halt mechanism: When an unexplained 5.4 BTC surge enters the trace branch, the engine halts and raises "Fund provenance break detected".',
    network: 'bitcoin',
    suspectAddress: 'bc1q_case_phishing_scam_020btc',
    initialAmountBtc: 0.02000000,
    targetVaspName: 'None (Halted at Break)',
    confidence: 0,
    intelligence: {
      investigationId: 'ANV-CASE-BTC-003',
      status: 'PROVENANCE_BREAK',
      attributionConfidence: 0,
      evidenceCount: 1,
      evidenceList: [
        'CRITICAL: Fund provenance break detected at Hop 2. Spending transaction outputs ballooned to 5.4000 BTC from an initial 0.0200 BTC trace.'
      ],
      initialTracedAmountBtc: 0.02000000,
      currentTracedAmountBtc: 0.02000000,
      totalForwardedAmountBtc: 0.01985000,
      currentHop: 1,
      totalHops: 2,
      firstMovementTimestamp: 1753000000,
      lastMovementTimestamp: 1753040000,
      transactionsAnalyzedCount: 2,
      walletsAnalyzedCount: 3,
      riskScore: 88,
      durationMs: 40000000,
      network: 'bitcoin',
      suspectAddress: 'bc1q_case_phishing_scam_020btc',
      mode: 'ARCHIVE',
      auditTrail: [
        { step: 'Hop 1 Clean', detail: '0.020000 BTC forwarded to relay wallet bc1q_relay_break_alert', timestamp: 1753000000 },
        { step: 'Provenance Break Flag', detail: 'Spending transaction combined multiple large whale inputs. Engine halted to avoid corrupting case evidence.', timestamp: 1753040000 }
      ]
    },
    nodes: [
      {
        id: 'bc1q_case_phishing_scam_020btc',
        label: 'Suspect Phishing (0.02 BTC)',
        address: 'bc1q_case_phishing_scam_020btc',
        type: 'suspect',
        isSuspect: true,
        hop: 0,
        riskScore: 90,
        balanceBtc: 0.00000000,
        tracedAmountBtc: 0.02000000,
        x: 120,
        y: 200
      },
      {
        id: 'bc1q_relay_break_alert',
        label: 'Relay Wallet (Hop 1)',
        address: 'bc1q_relay_break_alert',
        type: 'intermediate',
        hop: 1,
        riskScore: 70,
        balanceBtc: 0.00000000,
        tracedAmountBtc: 0.01985000,
        x: 380,
        y: 200
      },
      {
        id: 'node_break_point',
        label: 'Fund Provenance Break Detected',
        address: 'bc1q_unexplained_whale_aggregation',
        type: 'unknown',
        provenanceBreak: true,
        hop: 2,
        riskScore: 99,
        balanceBtc: 5.40000000,
        tracedAmountBtc: 0.01985000,
        x: 640,
        y: 200
      }
    ],
    edges: [
      {
        id: 'e_003_1',
        source: 'bc1q_case_phishing_scam_020btc',
        target: 'bc1q_relay_break_alert',
        txid: '33445566778899aabbccddeeff00112233445566778899aabbccddeeff001122',
        amountBtc: 0.01985000,
        asset: 'BTC',
        timestamp: 1753000000,
        hop: 1
      },
      {
        id: 'e_003_2',
        source: 'bc1q_relay_break_alert',
        target: 'node_break_point',
        txid: '445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233',
        amountBtc: 5.40000000,
        asset: 'BTC',
        timestamp: 1753040000,
        hop: 2,
        provenanceBreak: true
      }
    ],
    hops: [
      {
        hopNumber: 1,
        txid: '33445566778899aabbccddeeff00112233445566778899aabbccddeeff001122',
        vout: 0,
        sourceAddress: 'bc1q_case_phishing_scam_020btc',
        destinationAddress: 'bc1q_relay_break_alert',
        amountBtc: 0.01985000,
        feeBtc: 0.00015000,
        timestamp: 1753000000,
        blockHeight: 890310,
        classification: 'intermediate',
        reasonSelected: 'Valid forwarding hop',
        isChangeOutput: false,
        provenanceBreak: false
      },
      {
        hopNumber: 2,
        txid: '445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233',
        vout: 0,
        sourceAddress: 'bc1q_relay_break_alert',
        destinationAddress: 'bc1q_unexplained_whale_aggregation',
        amountBtc: 5.40000000,
        feeBtc: 0.00025000,
        timestamp: 1753040000,
        blockHeight: 890340,
        classification: 'unknown',
        reasonSelected: 'Fund provenance break detected: Traced amount was 0.019850 BTC, but transaction output exploded to 5.4000 BTC. Trace halted.',
        isChangeOutput: false,
        provenanceBreak: true,
        provenanceBreakReason: 'Fund provenance break detected: Input co-mingling exceeded tolerance'
      }
    ],
    transactions: [],
    wallets: {}
  },
  {
    id: 'anv-case-btc-004',
    caseCode: 'ANV-CASE-BTC-004',
    title: 'CoinJoin Mixer Interception (Wasabi Coordinator)',
    description: 'Traces funds entering a non-custodial Wasabi CoinJoin mixer round, flagging the mixer entity and warning of entropy loss.',
    network: 'bitcoin',
    suspectAddress: 'bc1q_case_darkweb_vendor_wasabi',
    initialAmountBtc: 0.45000000,
    targetVaspName: 'Wasabi Wallet CoinJoin Coordinator (VERIFIED ENTITY)',
    confidence: 96,
    intelligence: {
      investigationId: 'ANV-CASE-BTC-004',
      status: 'ATTRIBUTED',
      targetVasp: {
        ...KNOWN_VASPS[4],
        name: 'Wasabi Wallet CoinJoin Coordinator (VERIFIED ENTITY)'
      },
      attributionConfidence: 96,
      evidenceCount: 3,
      evidenceList: [
        'Detected 8-input, 8-output uniform denomination (0.1000 BTC) CoinJoin signature',
        'Cryptographic match with known WabiSabi coordinator address pool',
        'Obfuscation intentionality: High entropy scrambling'
      ],
      initialTracedAmountBtc: 0.45000000,
      currentTracedAmountBtc: 0.10000000,
      totalForwardedAmountBtc: 0.44980000,
      currentHop: 2,
      totalHops: 2,
      firstMovementTimestamp: 1753100000,
      lastMovementTimestamp: 1753150000,
      transactionsAnalyzedCount: 4,
      walletsAnalyzedCount: 9,
      riskScore: 98,
      durationMs: 50000000,
      network: 'bitcoin',
      suspectAddress: 'bc1q_case_darkweb_vendor_wasabi',
      mode: 'ARCHIVE',
      auditTrail: [
        { step: 'Vendor Ingestion', detail: 'Identified 0.4500 BTC illicit darkweb revenue', timestamp: 1753100000 },
        { step: 'Mixer Coordinator Flag', detail: 'Participated in CoinJoin round at coordinator bc1qs6044769062ekxcu6438g37n64zshvdwhq6p3f', timestamp: 1753150000 }
      ]
    },
    nodes: [
      {
        id: 'bc1q_case_darkweb_vendor_wasabi',
        label: 'Darkweb Vendor',
        address: 'bc1q_case_darkweb_vendor_wasabi',
        type: 'suspect',
        isSuspect: true,
        hop: 0,
        riskScore: 98,
        balanceBtc: 0.00000000,
        tracedAmountBtc: 0.45000000,
        x: 100,
        y: 200
      },
      {
        id: 'bc1q_case_premix_staging',
        label: 'Premix Staging',
        address: 'bc1q_case_premix_staging',
        type: 'intermediate',
        hop: 1,
        riskScore: 88,
        balanceBtc: 0.00000000,
        tracedAmountBtc: 0.44980000,
        x: 350,
        y: 200
      },
      {
        id: 'bc1qs6044769062ekxcu6438g37n64zshvdwhq6p3f',
        label: 'Wasabi Coordinator (VERIFIED ENTITY)',
        address: 'bc1qs6044769062ekxcu6438g37n64zshvdwhq6p3f',
        type: 'mixer',
        isTargetVasp: true,
        entityName: 'Wasabi CoinJoin Coordinator (VERIFIED ENTITY)',
        hop: 2,
        riskScore: 92,
        balanceBtc: 18.50000000,
        tracedAmountBtc: 0.10000000,
        x: 650,
        y: 200
      }
    ],
    edges: [
      {
        id: 'e_004_1',
        source: 'bc1q_case_darkweb_vendor_wasabi',
        target: 'bc1q_case_premix_staging',
        txid: '556677889900aabbccddeeff0011223344556677889900aabbccddeeff001122',
        amountBtc: 0.44980000,
        asset: 'BTC',
        timestamp: 1753100000,
        hop: 1
      },
      {
        id: 'e_004_2',
        source: 'bc1q_case_premix_staging',
        target: 'bc1qs6044769062ekxcu6438g37n64zshvdwhq6p3f',
        txid: '6677889900aabbccddeeff0011223344556677889900aabbccddeeff00112233',
        amountBtc: 0.10000000,
        asset: 'BTC',
        timestamp: 1753150000,
        hop: 2
      }
    ],
    hops: [
      {
        hopNumber: 1,
        txid: '556677889900aabbccddeeff0011223344556677889900aabbccddeeff001122',
        vout: 0,
        sourceAddress: 'bc1q_case_darkweb_vendor_wasabi',
        destinationAddress: 'bc1q_case_premix_staging',
        amountBtc: 0.44980000,
        feeBtc: 0.00020000,
        timestamp: 1753100000,
        blockHeight: 890450,
        classification: 'intermediate',
        reasonSelected: 'Consolidation into premix staging wallet',
        isChangeOutput: false,
        provenanceBreak: false
      },
      {
        hopNumber: 2,
        txid: '6677889900aabbccddeeff0011223344556677889900aabbccddeeff00112233',
        vout: 0,
        sourceAddress: 'bc1q_case_premix_staging',
        destinationAddress: 'bc1qs6044769062ekxcu6438g37n64zshvdwhq6p3f',
        amountBtc: 0.10000000,
        feeBtc: 0.00045000,
        timestamp: 1753150000,
        blockHeight: 890470,
        classification: 'mixer',
        entityName: 'Wasabi CoinJoin Coordinator (VERIFIED ENTITY)',
        reasonSelected: 'Entered CoinJoin mixing pool round; attribution to verified mixer infrastructure',
        isChangeOutput: false,
        provenanceBreak: false
      }
    ],
    transactions: [],
    wallets: {}
  },
  {
    id: 'anv-case-eth-001',
    caseCode: 'ANV-CASE-ETH-001',
    title: 'Ethereum Bridge Routing (Stargate Bridge to OKX)',
    description: 'Traces illicit Ethereum funds routed across Stargate Cross-Chain Liquidity Router into an OKX Exchange deposit address.',
    network: 'ethereum',
    suspectAddress: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
    initialAmountBtc: 12.50000000, // in ETH equivalent representation
    targetVaspName: 'OKX (VERIFIED ENTITY)',
    confidence: 91,
    intelligence: {
      investigationId: 'ANV-CASE-ETH-001',
      status: 'ATTRIBUTED',
      targetVasp: {
        ...KNOWN_VASPS[3],
        name: 'OKX (VERIFIED ENTITY)'
      },
      attributionConfidence: 91,
      evidenceCount: 3,
      evidenceList: [
        'Interacted with Stargate LayerZero bridge router 0x8731d54e...',
        'Cross-chain destination minted assets swept into OKX omnibus pool',
        'Direct cryptographic match with OKX deposit contract'
      ],
      initialTracedAmountBtc: 12.50000000,
      currentTracedAmountBtc: 12.48500000,
      totalForwardedAmountBtc: 12.48500000,
      currentHop: 2,
      totalHops: 2,
      firstMovementTimestamp: 1753200000,
      lastMovementTimestamp: 1753230000,
      transactionsAnalyzedCount: 3,
      walletsAnalyzedCount: 3,
      riskScore: 68,
      durationMs: 30000000,
      network: 'ethereum',
      suspectAddress: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
      mode: 'ARCHIVE',
      auditTrail: [
        { step: 'ETH Ingestion', detail: 'Traced 12.50 ETH from exploit wallet', timestamp: 1753200000 },
        { step: 'Bridge Execution', detail: 'Interacted with Stargate Bridge contract', timestamp: 1753215000 },
        { step: 'VASP Settlement', detail: 'Attributed to OKX deposit contract (91% confidence)', timestamp: 1753230000 }
      ]
    },
    nodes: [
      {
        id: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
        label: 'Suspect Exploit Wallet',
        address: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
        type: 'suspect',
        isSuspect: true,
        hop: 0,
        riskScore: 92,
        balanceBtc: 0.00000000,
        tracedAmountBtc: 12.50000000,
        x: 100,
        y: 200
      },
      {
        id: '0x8731d54e9d02c286767d56ac03e8037c07e01e98',
        label: 'Stargate Bridge (VERIFIED ENTITY)',
        address: '0x8731d54e9d02c286767d56ac03e8037c07e01e98',
        type: 'bridge',
        entityName: 'Stargate Cross-Chain Bridge',
        hop: 1,
        riskScore: 42,
        balanceBtc: 1250.00000000,
        tracedAmountBtc: 12.49200000,
        x: 380,
        y: 200
      },
      {
        id: '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b',
        label: 'OKX (VERIFIED ENTITY)',
        address: '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b',
        type: 'vasp',
        isTargetVasp: true,
        entityName: 'OKX (VERIFIED ENTITY)',
        hop: 2,
        riskScore: 35,
        balanceBtc: 840.20000000,
        tracedAmountBtc: 12.48500000,
        x: 660,
        y: 200
      }
    ],
    edges: [
      {
        id: 'e_eth_1',
        source: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
        target: '0x8731d54e9d02c286767d56ac03e8037c07e01e98',
        txid: '0x9911223344556677889900aabbccddeeff0011223344556677889900aabbccdd',
        amountBtc: 12.49200000,
        asset: 'ETH',
        timestamp: 1753215000,
        hop: 1
      },
      {
        id: 'e_eth_2',
        source: '0x8731d54e9d02c286767d56ac03e8037c07e01e98',
        target: '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b',
        txid: '0xaa11223344556677889900aabbccddeeff0011223344556677889900aabbccee',
        amountBtc: 12.48500000,
        asset: 'ETH',
        timestamp: 1753230000,
        hop: 2
      }
    ],
    hops: [
      {
        hopNumber: 1,
        txid: '0x9911223344556677889900aabbccddeeff0011223344556677889900aabbccdd',
        vout: 0,
        sourceAddress: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
        destinationAddress: '0x8731d54e9d02c286767d56ac03e8037c07e01e98',
        amountBtc: 12.49200000,
        feeBtc: 0.00800000,
        timestamp: 1753215000,
        classification: 'bridge',
        entityName: 'Stargate Bridge (VERIFIED ENTITY)',
        reasonSelected: 'Bridge contract interaction deposit function',
        isChangeOutput: false,
        provenanceBreak: false
      },
      {
        hopNumber: 2,
        txid: '0xaa11223344556677889900aabbccddeeff0011223344556677889900aabbccee',
        vout: 0,
        sourceAddress: '0x8731d54e9d02c286767d56ac03e8037c07e01e98',
        destinationAddress: '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b',
        amountBtc: 12.48500000,
        feeBtc: 0.00700000,
        timestamp: 1753230000,
        classification: 'vasp',
        entityName: 'OKX (VERIFIED ENTITY)',
        reasonSelected: 'Relayed bridge funds deposited to OKX exchange cluster',
        isChangeOutput: false,
        provenanceBreak: false
      }
    ],
    transactions: [],
    wallets: {}
  }
];

export function getCaseByCode(code: string): ForensicCaseFixture | undefined {
  const clean = code.trim().toUpperCase();
  return FORENSIC_CASES.find(f => f.caseCode.toUpperCase() === clean || f.id.toUpperCase() === clean);
}

export function getCaseByAddress(address: string): ForensicCaseFixture | undefined {
  const clean = address.trim().toLowerCase();
  return FORENSIC_CASES.find(f => 
    f.suspectAddress.toLowerCase() === clean ||
    f.nodes.some(n => n.address?.toLowerCase() === clean)
  );
}
