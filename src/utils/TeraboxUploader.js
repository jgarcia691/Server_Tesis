import axios from 'axios';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import FormData from 'form-data';
import { getDownloadLink } from './teraboxDownload.js';

// --- Helper Functions ---

function buildPrecreateUrl(appId, jsToken, dpLogId) {
    return `https://www.1024terabox.com/api/precreate?app_id=${appId}&web=1&channel=dubox&clienttype=0&jsToken=${jsToken}&dp-logid=${dpLogId}`;
}

function buildUploadUrl(fileName, uploadId, appId) {
    return `https://c-jp.1024terabox.com/rest/2.0/pcs/superfile2?method=upload&app_id=${appId}&channel=dubox&clienttype=0&web=1&path=%2F${encodeURIComponent(fileName)}&uploadid=${uploadId}&uploadsign=0&partseq=0`;
}

function buildCreateUrl(appId, jsToken, dpLogId) {
    return `https://www.1024terabox.com/api/create?app_id=${appId}&web=1&channel=dubox&clienttype=0&jsToken=${jsToken}&dp-logid=${dpLogId}`;
}

function buildListUrl(appId, directory, jsToken, dpLogId) {
    return `https://www.1024terabox.com/api/list?app_id=${appId}&web=1&channel=dubox&clienttype=0&jsToken=${jsToken}&dp-logid=${dpLogId}&order=time&desc=1&dir=${encodeURIComponent(directory)}&num=100&page=1&showempty=0`;
}

// --- Main Class ---

class TeraboxUploader {
    constructor(credentials) {
        if (!credentials || !credentials.ndus || !credentials.appId || !credentials.jsToken) {
            throw new Error('Credentials are required (ndus, appId, jsToken).');
        }

        this.credentials = {
            ndus: credentials.ndus,
            appId: credentials.appId,
            jsToken: credentials.jsToken,
            bdstoken: credentials.bdstoken || '',
            browserId: credentials.browserId || '',
            dpLogId: credentials.dpLogId || this._generateDpLogId(),
        };

        // FIX: Include browserid in the cookie if it exists
        let cookies = `lang=en; ndus=${credentials.ndus};`;
        if (this.credentials.browserId) {
            cookies += ` browserid=${this.credentials.browserId.trim()};`;
        }
        this.credentials.cookies = cookies;
    }

    _generateDpLogId() {
        return crypto.randomBytes(10).toString('hex').toUpperCase();
    }

    async uploadFile(filePath, progressCallback, directory = '/') {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: this.credentials.cookies,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };

        try {
            const fileName = path.basename(filePath);
            const stats = fs.statSync(filePath);
            const fileSize = stats.size;
            const fileMd5 = crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');

            const precreateUrl = buildPrecreateUrl(this.credentials.appId, this.credentials.jsToken, this.credentials.dpLogId);

            console.log('[TeraboxUploader] Precreating file...', { fileName, directory });

            const precreateResponse = await axios.post(
                precreateUrl,
                new URLSearchParams({
                    path: `${directory}/${fileName}`,
                    autoinit: '1',
                    target_path: directory,
                    block_list: JSON.stringify([fileMd5]),
                    size: fileSize,
                    local_mtime: Math.floor(stats.mtimeMs / 1000),
                }).toString(),
                { headers }
            );

            if (precreateResponse.data.errno !== 0) {
                console.error('[TeraboxUploader] Precreate failed response:', precreateResponse.data);
                throw new Error(`Precreate failed: ${precreateResponse.data.errmsg || 'Unknown error'} (errno: ${precreateResponse.data.errno})`);
            }

            const uploadId = precreateResponse.data.uploadid;
            const uploadUrl = buildUploadUrl(fileName, uploadId, this.credentials.appId);
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            console.log('[TeraboxUploader] Uploading file data...');

            // FormData headers + Custom headers
            const uploadHeaders = {
                ...formData.getHeaders(),
                Cookie: this.credentials.cookies,
                'User-Agent': headers['User-Agent']
            };

            await axios.post(uploadUrl, formData, {
                headers: uploadHeaders,
                onUploadProgress: (e) => progressCallback && progressCallback(e.loaded, e.total),
            });

            const createUrl = buildCreateUrl(this.credentials.appId, this.credentials.jsToken, this.credentials.dpLogId);
            const createParams = new URLSearchParams({
                path: `${directory}/${fileName}`,
                size: fileSize,
                uploadid: uploadId,
                target_path: directory,
                block_list: JSON.stringify([fileMd5]),
                local_mtime: Math.floor(stats.mtimeMs / 1000),
                isdir: '0',
                rtype: '1',
            });
            if (this.credentials.bdstoken) createParams.append('bdstoken', this.credentials.bdstoken);

            console.log('[TeraboxUploader] Finalizing creation...');

            const createResponse = await axios.post(createUrl, createParams.toString(), {
                headers // reuse headers
            });

            if (createResponse.data.errno !== 0) {
                console.error('[TeraboxUploader] Create failed response:', createResponse.data);
                throw new Error(`Create failed: ${createResponse.data.errmsg || 'Unknown error'}`);
            }

            return { success: true, message: 'File uploaded successfully.', fileDetails: createResponse.data };
        } catch (error) {
            console.error('[TeraboxUploader] Upload error:', error.message);
            return { success: false, message: error.response?.data || error.message };
        }
    }

    async createDirectory(directoryPath) {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: this.credentials.cookies,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };

        try {
            const createUrl = buildCreateUrl(this.credentials.appId, this.credentials.jsToken, this.credentials.dpLogId);
            const createParams = new URLSearchParams({
                path: directoryPath,
                isdir: '1',
                size: '0',
                block_list: '[]',
                local_mtime: Math.floor(Date.now() / 1000),
            });
            if (this.credentials.bdstoken) createParams.append('bdstoken', this.credentials.bdstoken);

            const response = await axios.post(createUrl, createParams.toString(), {
                headers
            });
            return { success: true, message: 'Directory created successfully.', data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data || error.message };
        }
    }

    async fetchFileList(directory = '/') {
        const headers = {
            Cookie: this.credentials.cookies,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };
        try {
            const listUrl = buildListUrl(this.credentials.appId, directory, this.credentials.jsToken, this.credentials.dpLogId);
            const response = await axios.get(listUrl, { headers });
            return { success: true, message: 'File list retrieved successfully.', data: response.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.error || error.message };
        }
    }

    async downloadFile(fileId) {
        try {
            const { ndus, appId, jsToken, dpLogId, browserId } = this.credentials;
            return await getDownloadLink(ndus, fileId, appId, jsToken, dpLogId, browserId);
        } catch (error) {
            return { success: false, message: error.response?.data?.error || error.message };
        }
    }
}

export default TeraboxUploader;
