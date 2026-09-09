import React, { useState, useEffect } from 'react';
import { 
  X, 
  FolderOpen, 
  FileText, 
  RefreshCw, 
  LogIn, 
  ExternalLink, 
  AlertCircle, 
  FolderPlus 
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleDriveService, DriveFileItem } from '../services/googleDriveService';
import { googleSignIn } from '../services/firebaseAuth';

interface DriveWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLoadCaseFile?: (fileContent: string, fileName: string) => void;
}

export const DriveWorkspaceModal: React.FC<DriveWorkspaceModalProps> = ({
  isOpen,
  onClose,
  user,
  onLoadCaseFile
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folder, setFolder] = useState<DriveFileItem | null>(null);
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [readingFileId, setReadingFileId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadDriveFiles();
    }
  }, [isOpen, user]);

  const loadDriveFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await GoogleDriveService.listFiles();
      setFolder(res.folder);
      setFiles(res.files);
    } catch (err: any) {
      console.error('Error reading Drive:', err);
      setError(err.message || 'Failed to connect to Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await googleSignIn();
      await loadDriveFiles();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleReadFile = async (file: DriveFileItem) => {
    setReadingFileId(file.id);
    try {
      const content = await GoogleDriveService.readFileContent(file.id);
      setSelectedFileContent(content);
      if (onLoadCaseFile) {
        onLoadCaseFile(content, file.name);
      }
    } catch (err: any) {
      alert(`Could not load file content: ${err.message}`);
    } finally {
      setReadingFileId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-black border border-neutral-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col font-mono text-neutral-100 text-xs overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-bold text-sm text-white">GOOGLE DRIVE WORKSPACE</span>
            <span className="px-2 py-0.5 rounded bg-neutral-900 border border-[#D4AF37]/50 text-[#F5D77F] text-[10px]">
              FOLDER: HACKATHON
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-neutral-900 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User / Authentication Status */}
        {!user ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-[#D4AF37] flex items-center justify-center mx-auto text-[#F5D77F]">
              <LogIn className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Sign in to Access Google Drive</h4>
              <p className="text-neutral-400 text-xs mt-1 max-w-md mx-auto">
                Connect your Google Account to access the <strong>HACKATHON</strong> folder, load existing forensic case files, and save statutory seizure notices.
              </p>
            </div>
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#F5D77F] to-[#B38F4D] text-black font-bold rounded-lg transition-all flex items-center space-x-2 mx-auto hover:brightness-110 shadow-md"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>Authorize Google Drive Access</span>
            </button>
          </div>
        ) : (
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {/* Status bar */}
            <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-lg border border-neutral-800">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                <span className="text-neutral-300">
                  Target: <strong>{folder ? folder.name : 'HACKATHON (or Root Drive)'}</strong>
                </span>
              </div>
              <button
                onClick={loadDriveFiles}
                disabled={loading}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded text-neutral-300 flex items-center space-x-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-[#F5D77F] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Files List */}
            <div className="space-y-2">
              <h5 className="font-bold text-neutral-400 text-[11px]">CASE FILES IN HACKATHON FOLDER:</h5>

              {files.length > 0 ? (
                <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-lg bg-black overflow-hidden">
                  {files.map((file) => (
                    <div key={file.id} className="p-3 flex items-center justify-between hover:bg-neutral-900/60 transition-colors">
                      <div className="flex items-center space-x-2.5 truncate max-w-sm">
                        <FileText className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <div>
                          <span className="text-white font-bold block truncate">{file.name}</span>
                          <span className="text-[10px] text-neutral-500">
                            Modified: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleReadFile(file)}
                          disabled={readingFileId === file.id}
                          className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-[#F5D77F] border border-[#D4AF37]/50 rounded font-bold"
                        >
                          {readingFileId === file.id ? 'Loading...' : 'Load Case'}
                        </button>
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded text-neutral-400 hover:text-white"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-neutral-800 rounded-lg text-neutral-500">
                  <FolderPlus className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                  <p>No files found in the HACKATHON folder yet.</p>
                  <p className="text-[10px] mt-1">Use "Save to Drive" from any active trace to export forensic reports here.</p>
                </div>
              )}
            </div>

            {/* Preview of loaded content */}
            {selectedFileContent && (
              <div className="space-y-1 pt-2">
                <span className="text-neutral-400 font-bold">LOADED FILE PREVIEW:</span>
                <pre className="bg-neutral-950 p-3 rounded border border-neutral-800 text-[10px] text-neutral-300 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selectedFileContent.slice(0, 1500)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 rounded font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
