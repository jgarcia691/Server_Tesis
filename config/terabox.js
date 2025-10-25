import fs from "fs";
import path from "path";
import os from "os";
import TeraboxUploader from "terabox-upload-tool";

const credentials = {
  ndus: process.env.TERABOX_NDUS,
  appId: process.env.TERABOX_APP_ID,
  uploadId: process.env.TERABOX_UPLOAD_ID,
  jsToken: process.env.TERABOX_JS_TOKEN,
  browserId: process.env.TERABOX_BROWSER_ID,
};

const uploader = new TeraboxUploader(credentials);

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
    // result.fileDetails should contain path or a way to build public URL
    // The library provides download link via downloadFile(fs_id), so we store returned details
    return result.fileDetails; // store object { fs_id, path, ... }
  } finally {
    try {
      fs.unlinkSync(tmpPath);
    } catch {}
  }
}

export async function getDownloadLinkFromFsId(fs_id) {
  const response = await uploader.downloadFile(fs_id);
  return response;
}
