import 'dotenv/config';
import { uploadBufferToTerabox } from "../config/terabox.js";

function isPlaceholder(value) {
  return (
    !value ||
    value === 'tu_ndus' ||
    value === 'tu_appId' ||
    value === 'tu_uploadId' ||
    value === 'tu_jsToken' ||
    value === 'tu_browserId'
  );
}

function mask(value) {
  if (!value) return 'MISSING';
  if (isPlaceholder(value)) return 'PLACEHOLDER';
  return value.length > 6 ? `${value.slice(0, 3)}***${value.slice(-3)}` : 'SET';
}

async function main(){
  const required = [
    'TERABOX_NDUS',
    'TERABOX_APP_ID',
    'TERABOX_UPLOAD_ID',
    'TERABOX_JS_TOKEN',
    'TERABOX_BROWSER_ID',
  ];

  const envReport = Object.fromEntries(
    required.map((k) => [k, mask(process.env[k])])
  );
  console.log('TeraBox env check:', envReport);

  const missingOrPlaceholder = required.filter(
    (k) => isPlaceholder(process.env[k])
  );
  if (missingOrPlaceholder.length) {
    console.error(
      'Missing or placeholder environment variables:',
      missingOrPlaceholder.join(', ')
    );
    process.exit(1);
  }

  const content = `Prueba de conexión a TeraBox - ${new Date().toISOString()}\n`;
  const buffer = Buffer.from(content, 'utf8');
  const filename = `prueba_terabox_${Date.now()}.txt`;

  try{
    const details = await uploadBufferToTerabox(buffer, filename, "/tesis");
    console.log("Upload success:", details);
    process.exit(0);
  }catch(err){
    console.error("Upload failed:", err?.message || err);
    try { if (err?.response?.data) console.error('response.data:', err.response.data); } catch {}
    try { if (err?.data) console.error('data:', err.data); } catch {}
    try { if (err?.stack) console.error('stack:', err.stack); } catch {}
    try { console.error('raw error:', JSON.stringify(err, null, 2)); } catch {}
    process.exit(1);
  }
}

main(); 