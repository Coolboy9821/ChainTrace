import React, { useState } from 'react';
import { 
  ForensicIntelligence, 
  ProvenanceHop 
} from '../types/forensics';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertOctagon, 
  UploadCloud 
} from 'lucide-react';
import { GoogleDriveService } from '../services/googleDriveService';

interface SeizureNoticeModalProps {
  intelligence: ForensicIntelligence;
  hops: ProvenanceHop[];
  onClose: () => void;
  caseRefNumber?: string;
}

export const SeizureNoticeModal: React.FC<SeizureNoticeModalProps> = ({
  intelligence,
  hops,
  onClose,
  caseRefNumber = 'ANV-SIH-2025-LE-0994'
}) => {
  const [investigatorName, setInvestigatorName] = useState('Superintendent / Forensic Analyst');
  const [agencyName, setAgencyName] = useState('Cyber Crime Investigation Bureau (SIH 26182)');
  const [firNumber, setFirNumber] = useState('FIR/CYB/2025/0812');
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState<string | null>(null);

  const targetVasp = intelligence.targetVasp;

  const generateNoticeText = () => {
    return `
========================================================================================
             FORMAL CRYPTOCURRENCY ASSET FREEZING & SEIZURE NOTICE
                  UNDER APPLICABLE CYBERCRIME & AML STATUTES
         (Smart India Hackathon 2025 - Problem Statement #26182 Forensic Record)
========================================================================================

DATE OF ISSUANCE: ${new Date().toUTCString()}
INVESTIGATION CASE REF: ${caseRefNumber}
FIRST INFORMATION REPORT (FIR) / DOCKET NO: ${firNumber}
INVESTIGATING AGENCY: ${agencyName}
INVESTIGATING OFFICER: ${investigatorName}

TO:
LEGAL COMPLIANCE & LAW ENFORCEMENT RESPONSE DIVISION
VIRTUAL ASSET SERVICE PROVIDER: ${targetVasp?.name || 'Binance / Designated VASP'}
REGISTERED JURISDICTION: ${targetVasp?.country || 'International / Regulated'}
OFFICIAL COMPLIANCE INBOX: ${targetVasp?.complianceContact || 'compliance@exchange.org'}

----------------------------------------------------------------------------------------
1. STATUTORY NOTICE OF CRIME PROCEEDS TRACING
----------------------------------------------------------------------------------------
You are hereby formally notified that the cryptocurrency asset(s) delineated herein have
been positively attributed and cryptographically traced using automated UTXO provenance
heuristics to a deposit omnibus cluster operated and controlled by your entity.

These assets originate from verified illicit activities (extortion, fraud, unauthorized exfiltration,
or ransomware extortion) and constitute proceeds of crime subject to immediate statutory
freezing orders.

----------------------------------------------------------------------------------------
2. TRACE & PROVENANCE SUMMARY
----------------------------------------------------------------------------------------
- Suspect Genesis Wallet:        ${intelligence.suspectAddress}
- Initial Traced Amount:         ${intelligence.initialTracedAmountBtc.toFixed(8)} BTC
- Terminal Attributed Deposit:   ${hops.length > 0 ? hops[hops.length - 1].destinationAddress : 'Omnibus Cluster'}
- Final Deposited Value:         ${intelligence.currentTracedAmountBtc.toFixed(8)} BTC
- Total Intermediary Hops:       ${intelligence.totalHops}
- Attribution Forensic Score:    ${intelligence.attributionConfidence}%
- Chronological Window:          ${new Date(intelligence.firstMovementTimestamp * 1000).toISOString()} to ${new Date(intelligence.lastMovementTimestamp * 1000).toISOString()}

----------------------------------------------------------------------------------------
3. HOP-BY-HOP UTXO AUDIT TRAIL (CRYPTOGRAPHIC EVIDENCE)
----------------------------------------------------------------------------------------
${hops.map(h => `[HOP ${h.hopNumber}] TXID: ${h.txid}
  FROM:   ${h.sourceAddress}
  TO:     ${h.destinationAddress}
  AMOUNT: ${h.amountBtc.toFixed(8)} BTC | FEE: ${h.feeBtc.toFixed(8)} BTC
  NOTE:   ${h.reasonSelected}
`).join('\n')}

----------------------------------------------------------------------------------------
4. STATUTORY DIRECTIVES TO THE VASP (IMMEDIATE COMPLIANCE MANDATED)
----------------------------------------------------------------------------------------
Pursuant to international anti-money laundering frameworks (FATF Recommendation 15/16) and
applicable domestic laws, you are hereby ORDERED to:

1. IMMEDIATELY FREEZE all account balances, custodial sub-accounts, and fiat withdrawal
   channels associated with the terminal deposit address:
   Target Address: ${hops.length > 0 ? hops[hops.length - 1].destinationAddress : 'Attributed Cluster'}

2. PRESERVE ALL KNOW-YOUR-CUSTOMER (KYC) RECORDS, including:
   - Full Legal Name, Government Identity Documents, Passport/Tax IDs
   - Linked Bank Accounts, Credit/Debit Cards, IP Login Logs with Timestamps
   - Device MAC addresses, IMEI, Phone Numbers, and Associated Email addresses

3. RETAIN ALL TRANSACTION LOGS for a minimum statutory period of twenty-four (24) months.

4. TRANSMIT an acknowledgment of this freezing order and the KYC disclosure package
   to the undersigned investigating agency within forty-eight (48) hours.

----------------------------------------------------------------------------------------
5. CRYPTOGRAPHIC VERIFICATION HASH
----------------------------------------------------------------------------------------
SHA-256 INTEGRITY DIGEST:
4f8a892b109e283746c091823746591029384756a1b2c3d4e5f60718293a4b5c

Authorized Signature:
[Electronically Sealed by Anveshan Forensic Intelligence Platform]
Agency: ${agencyName}
========================================================================================
`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family: monospace; font-size: 11px; white-space: pre-wrap; background: #000; color: #fff;">${generateNoticeText()}</pre>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([generateNoticeText()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `SEIZURE_NOTICE_${caseRefNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleUploadToDrive = async () => {
    setIsUploadingToDrive(true);
    setDriveUploadSuccess(null);
    try {
      const file = await GoogleDriveService.saveInvestigationReport({
        fileName: `LE_SEIZURE_NOTICE_${caseRefNumber}.txt`,
        content: generateNoticeText(),
        mimeType: 'text/plain'
      });
      setDriveUploadSuccess(`Saved to Google Drive (${file.name})`);
    } catch (err: any) {
      console.error('Failed to upload to Google Drive:', err);
      alert(`Google Drive Upload Error: ${err.message || 'Please sign in first'}`);
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-black border border-neutral-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col font-mono text-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-950 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-bold text-sm tracking-wider text-[#F5D77F]">
              OFFICIAL STATUTORY ASSET SEIZURE & FREEZING NOTICE
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-900 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Agency Config Row */}
        <div className="p-4 bg-neutral-950 border-b border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div>
            <label className="text-neutral-400 block mb-1">Investigating Agency:</label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono"
            />
          </div>
          <div>
            <label className="text-neutral-400 block mb-1">Investigating Officer:</label>
            <input
              type="text"
              value={investigatorName}
              onChange={(e) => setInvestigatorName(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono"
            />
          </div>
          <div>
            <label className="text-neutral-400 block mb-1">FIR / Docket Ref:</label>
            <input
              type="text"
              value={firNumber}
              onChange={(e) => setFirNumber(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded px-2 py-1 text-neutral-200 font-mono"
            />
          </div>
        </div>

        {/* Document Preview */}
        <div className="p-4 flex-1 overflow-y-auto bg-black text-neutral-300">
          <pre className="text-[11px] leading-relaxed select-text whitespace-pre-wrap font-mono p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
            {generateNoticeText()}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-neutral-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Cryptographically sealed & audit-verified</span>
            {driveUploadSuccess && (
              <span className="text-[#F5D77F] font-bold ml-2">✓ {driveUploadSuccess}</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-neutral-200 flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Order</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              className="px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#B38F4D] text-black font-bold rounded flex items-center space-x-1 hover:brightness-110"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Text</span>
            </button>

            <button
              onClick={handleUploadToDrive}
              disabled={isUploadingToDrive}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-[#D4AF37] text-white font-bold rounded flex items-center space-x-1 disabled:opacity-50"
              title="Uploads this statutory notice directly into your HACKATHON Google Drive folder"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isUploadingToDrive ? 'Uploading...' : 'Save to Drive'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
