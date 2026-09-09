import { getAccessToken } from './firebaseAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

export class GoogleDriveService {
  /**
   * Search for the user's HACKATHON folder in Google Drive
   */
  public static async findHackathonFolder(): Promise<DriveFileItem | null> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive. Please sign in first.');

    const q = encodeURIComponent("name = 'HACKATHON' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,webViewLink)`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Google Drive API error (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  }

  /**
   * List files in the HACKATHON folder, or root files if folder not found
   */
  public static async listFiles(folderId?: string): Promise<{ folder: DriveFileItem | null; files: DriveFileItem[] }> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive.');

    let targetFolder: DriveFileItem | null = null;
    let parentQuery = "'root' in parents";

    if (folderId) {
      parentQuery = `'${folderId}' in parents`;
    } else {
      const hackathon = await this.findHackathonFolder().catch(() => null);
      if (hackathon) {
        targetFolder = hackathon;
        parentQuery = `'${hackathon.id}' in parents`;
      }
    }

    const q = encodeURIComponent(`${parentQuery} and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime desc&pageSize=20&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to list files from Google Drive: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      folder: targetFolder,
      files: data.files || []
    };
  }

  /**
   * Read file content from Google Drive
   */
  public static async readFileContent(fileId: string): Promise<string> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive.');

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Failed to read file from Google Drive: ${res.statusText}`);
    }

    return await res.text();
  }

  /**
   * Upload or save forensic report / seizure notice to Google Drive
   */
  public static async saveInvestigationReport(params: {
    fileName: string;
    content: string;
    mimeType?: string;
    parentFolderId?: string;
  }): Promise<DriveFileItem> {
    const token = await getAccessToken();
    if (!token) throw new Error('Not authenticated with Google Drive.');

    const metadata: any = {
      name: params.fileName,
      mimeType: params.mimeType || 'text/plain'
    };

    if (params.parentFolderId) {
      metadata.parents = [params.parentFolderId];
    } else {
      const hackathon = await this.findHackathonFolder().catch(() => null);
      if (hackathon) {
        metadata.parents = [hackathon.id];
      }
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${metadata.mimeType}\r\n\r\n` +
      params.content +
      closeDelimiter;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartRequestBody
    });

    if (!res.ok) {
      throw new Error(`Failed to upload report to Google Drive: ${res.statusText}`);
    }

    return await res.json();
  }
}
