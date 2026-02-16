import fs from "fs";
import path from "path";
import os from "os";
import TeraboxUploader from "terabox-upload-tool";
import axios from "axios";
import FormData from "form-data";
import https from "https";

const credentials = {
  ndus: process.env.TERABOX_NDUS,
  appId: process.env.TERABOX_APP_ID,
  uploadId: process.env.TERABOX_UPLOAD_ID,
  jsToken: process.env.TERABOX_JS_TOKEN,
  browserId: process.env.TERABOX_BROWSER_ID,
};

const uploader = new TeraboxUploader(credentials);

// Cookie string compartido: REUTILIZAR las cookies generadas por la librería (que tienen el browserid hardcodeado que funciona)
const cookieString = uploader.credentials.cookies;

export async function uploadBufferToTerabox(
  buffer,
  filename,
  folder = "/tesis"
) {
  const tmpDir = os.tmpdir();
  const tmpPath = path.join(tmpDir, `${Date.now()}-${filename}`);
  fs.writeFileSync(tmpPath, buffer);
  try {
    const result = await uploader.uploadFile(tmpPath, undefined, folder);
    if (!result || !result.success) {
      throw new Error(result?.message || "Upload failed");
    }
    return result.fileDetails;
  } finally {
    try {
      fs.unlinkSync(tmpPath);
    } catch { }
  }
}

export async function getDownloadLinkFromFsId(fs_id) {
  const response = await uploader.downloadFile(fs_id);
  return response;
}

export async function getListOfFiles(folder = "/") {
  const response = await uploader.fetchFileList(folder);
  return response;
}

/**
 * Precreate a file on TeraBox to get a session-specific uploadid.
 * This MUST be called before uploading chunks for multi-part uploads.
 * @param {string} fileName - The name of the file.
 * @param {number} totalSize - Total file size in bytes.
 * @param {number} numChunks - Number of chunks the file will be split into.
 * @param {string} folder - TeraBox folder path.
 * @returns {Promise<{uploadid: string, return_type: number}>}
 */
export async function precreateOnTerabox(fileName, totalSize, numChunks, folder = "/tesis") {
  console.log("DEPURACIÓN: Bypassing precreate API, returning static uploadId");
  return {
    uploadid: uploader.credentials.uploadId,
    return_type: 1,
  };

}

/**
 * Uploads a single chunk of a file to TeraBox.
 * @param {Buffer} buffer - The file chunk content.
 * @param {string} fileName - The name of the file.
 * @param {number} partSeq - The sequence number of the chunk (0-based).
 * @returns {Promise<string>} The MD5 checksum of the uploaded chunk.
 */
export async function uploadChunkToTerabox(buffer, fileName, partSeq, uploadid) {
  const appId = credentials.appId;

  const uploadUrl = `https://c-jp.1024terabox.com/rest/2.0/pcs/superfile2?method=upload&app_id=${appId}&channel=dubox&clienttype=0&web=1&path=%2F${encodeURIComponent(fileName)}&uploadid=${uploadid}&uploadsign=0&partseq=${partSeq}`;

  const formData = new FormData();
  formData.append("file", buffer, { filename: fileName });

  const headers = {
    ...formData.getHeaders(),
    Origin: "https://www.1024terabox.com",
    Referer: "https://www.terabox.com/main",
    Cookie: cookieString,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  };

  try {
    // FIX: Library sends OPTIONS request first (index.js line 55)
    await axios.options(uploadUrl, { headers: { Origin: 'https://www.1024terabox.com' } });

    const response = await axios.post(uploadUrl, formData, { headers });
    const md5 = response.headers["content-md5"] || response.data.md5;
    if (!md5) {
      throw new Error("No MD5 returned from TeraBox chunk upload");
    }
    return md5;
  } catch (error) {
    console.error("TeraBox Chunk Upload Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.errmsg || error.message || "Chunk upload failed");
  }
}

export async function commitFileToTerabox(fileName, blockList, folder = "/tesis", size = 0, uploadid) {
  const createUrl = 'https://www.1024terabox.com/api/create';

  const targetPath = `${folder}/${fileName}`;
  const localMtime = Math.floor(Date.now() / 1000);

  const bodyParams = new URLSearchParams({
    path: targetPath,
    size: size,
    isdir: 0,
    rtype: 1,
    uploadid: uploadid,
    target_path: folder,
    block_list: JSON.stringify(blockList),
    local_mtime: localMtime,
  }).toString();

  console.log("DEPURACIÓN: commit body:", bodyParams);

  const queryParams = {
    app_id: credentials.appId,
    jsToken: credentials.jsToken,
    channel: 'dubox',
    clienttype: 0,
    web: 1,
  };

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Cookie: cookieString,
    Origin: "https://www.1024terabox.com",
    Referer: "https://www.terabox.com/main",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  };

  try {
    const response = await axios.post(createUrl, bodyParams, { headers, params: queryParams });
    console.log("DEPURACIÓN: Terabox create response:", JSON.stringify(response.data));
    if (response.data.errno && response.data.errno !== 0) {
      throw new Error(`TeraBox Create Error ${response.data.errno}: ${response.data.errmsg}`);
    }
    return response.data;
  } catch (error) {
    console.error("TeraBox Commit Error:", error.response?.data || error.message);
    console.error("TeraBox Commit Error (full response):", JSON.stringify(error.response?.data));
    throw new Error(error.response?.data?.errmsg || error.message || "Commit failed");
  }
}
