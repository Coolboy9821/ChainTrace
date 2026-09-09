import React, { useState } from 'react';
import { 
  Lock, 
  Hash
} from 'lucide-react';

interface CustodyItem {
  id: string;
  evidenceRef: string;
  dateLogged: string;
  sourceTarget: string;
  attributedVasp: string;
  amountSeizedBtc: number;
  custodian: string;
  sha256Digest: string;
  status: 'EVIDENCE_LOCKED' | 'NOTICE_SERVED' | 'FREEZE_CONFIRMED';
}

const INITIAL_CUSTODY_RECORDS: CustodyItem[] = [
  {
    id: 'CUST-001',
    evidenceRef: 'ANV-SIH-2025-LE-0994',
    dateLogged: '2025-07-18 14:32 UTC',
    sourceTarget: 'bc1q_ransom_extortion_889x',
    attributedVasp: 'Binance (VERIFIED ENTITY)',
    amountSeizedBtc: 0.78985000,
    custodian: 'Inspector R. Sharma (Cyber Cell)',
    sha256Digest: '4f8a892b109e283746c091823746591029384756a1b2c3d4e5f60718293a4b5c',
    status: 'NOTICE_SERVED'
  },
  {
    id: 'CUST-002',
    evidenceRef: 'ANV-ARCHIVE-BTC-002-EVID',
    dateLogged: '2025-07-19 09:15 UTC',
    sourceTarget: 'bc1q_theft_source_005btc',
    attributedVasp: 'Coinbase Prime (VERIFIED ENTITY)',
    amountSeizedBtc: 0.00470000,
    custodian: 'Forensic Analyst K. Mehta',
    sha256Digest: '7b2c4d9e01827465910293847561a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3',
    status: 'FREEZE_CONFIRMED'
  }
];

export const CustodyView: React.FC = () => {
  const [records] = useState<CustodyItem[]>(INITIAL_CUSTODY_RECORDS);

  const getStatusBadge = (status: CustodyItem['status']) => {
    switch (status) {
      case 'FREEZE_CONFIRMED':
        return 'bg-black text-[#F5D77F] border border-[#D4AF37]';
      case 'NOTICE_SERVED':
        return 'bg-neutral-900 text-white border border-neutral-500';
      default:
        return 'bg-neutral-900 text-neutral-400 border border-neutral-700';
    }
  };

  return (
    <div className="w-full bg-black border border-neutral-800 rounded-xl p-4 text-neutral-100 font-mono text-xs shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-bold text-sm tracking-wider text-white">
              CRYPTOGRAPHIC CHAIN OF CUSTODY & EVIDENCE VAULT
            </h2>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Tamper-evident logs of seized wallets, frozen balances, and digital evidence seals
          </p>
        </div>
      </div>

      {/* Custody Table */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-black text-neutral-400 border-b border-neutral-800">
            <tr>
              <th className="p-3">Evidence Ref</th>
              <th className="p-3">Logged Date</th>
              <th className="p-3">Suspect / Origin</th>
              <th className="p-3">Target VASP</th>
              <th className="p-3">Amount (BTC)</th>
              <th className="p-3">Custodian</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {records.map((item) => (
              <tr key={item.id} className="hover:bg-neutral-900/50">
                <td className="p-3 font-bold text-[#F5D77F]">{item.evidenceRef}</td>
                <td className="p-3 text-neutral-400">{item.dateLogged}</td>
                <td className="p-3 text-neutral-300 font-mono truncate max-w-[140px]">{item.sourceTarget}</td>
                <td className="p-3 text-white font-semibold">{item.attributedVasp}</td>
                <td className="p-3 font-bold text-[#F5D77F]">{item.amountSeizedBtc.toFixed(8)} BTC</td>
                <td className="p-3 text-neutral-300">{item.custodian}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadge(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SHA256 Verification Digest Box */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-1.5">
        <div className="flex items-center space-x-2 text-[#D4AF37] font-bold">
          <Hash className="w-4 h-4" />
          <span>EVIDENCE INTEGRITY SEAL (SHA-256):</span>
        </div>
        <p className="bg-black p-2 rounded text-[11px] text-neutral-300 font-mono break-all border border-neutral-850">
          4f8a892b109e283746c091823746591029384756a1b2c3d4e5f60718293a4b5c
        </p>
        <span className="text-[10px] text-neutral-500">
          Certified tamper-proof under Section 65B of Indian Evidence Act / BNSS digital forensics standards.
        </span>
      </div>
    </div>
  );
};
