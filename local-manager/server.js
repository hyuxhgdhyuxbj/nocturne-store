const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

const ROOT = __dirname;
const DATA_DIR = path.resolve(process.env.NOCTURNE_DATA_DIR || path.join(ROOT, 'manager-data'));
const MEDIA_DIR = path.join(DATA_DIR, 'media');
const PUBLISH_DIR = path.join(DATA_DIR, 'publish');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const DESKTOP_PUBLISH_DIR = path.join(process.env.USERPROFILE || require('os').homedir(), 'Desktop', 'NOCTURNE-publish');
const PORT = Number(process.env.NOCTURNE_PORT || 4310);
const SERVICE_WECHAT = 'kjgbsh123321';

const defaults = {
  version: 1,
  settings: { storeName: 'NOCTURNE', serviceWechat: SERVICE_WECHAT },
  categories: [
    { id: 'cat-toys', name: '情趣玩具', subs: [{ id: 'sub-hot', name: '热门精选' }, { id: 'sub-vibe', name: '震动玩具' }, { id: 'sub-couple', name: '双人互动' }] },
    { id: 'cat-care', name: '私密护理', subs: [{ id: 'sub-lube', name: '润滑护理' }, { id: 'sub-clean', name: '清洁护理' }] },
    { id: 'cat-lingerie', name: '内衣睡衣', subs: [{ id: 'sub-lace', name: '蕾丝内衣' }, { id: 'sub-home', name: '居家睡衣' }] }
  ],
  products: [],
  covers: []
};

function ensureDirs() {
  for (const dir of [DATA_DIR, MEDIA_DIR, PUBLISH_DIR, BACKUP_DIR]) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(path.join(DATA_DIR, 'catalog.json'))) writeJson(path.join(DATA_DIR, 'catalog.json'), defaults);
}
function writeJson(file, value) { const temp = `${file}.tmp-${process.pid}-${Date.now()}`; fs.writeFileSync(temp, JSON.stringify(value, null, 2), 'utf8'); fs.renameSync(temp, file); }
function readCatalog() { ensureDirs(); return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'catalog.json'), 'utf8')); }
function saveCatalog(catalog) { ensureDirs(); writeJson(path.join(DATA_DIR, 'catalog.json'), catalog); }
function safePath(value) { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').split('/').filter(part => part && part !== '.' && part !== '..').join('/'); }
function send(res, status, body, type = 'application/json; charset=utf-8') { res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(type.startsWith('application/json') ? JSON.stringify(body) : body); }
function readBody(req) { return new Promise((resolve, reject) => { let text = ''; req.on('data', chunk => { text += chunk; if (text.length > 80 * 1024 * 1024) req.destroy(new Error('文件太大')); }); req.on('end', () => { try { resolve(text ? JSON.parse(text) : {}); } catch (error) { reject(error); } }); req.on('error', reject); }); }
function copyTree(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name); const to = path.join(target, entry.name);
    if (entry.isDirectory()) copyTree(from, to); else fs.copyFileSync(from, to);
  }
}
function cleanDir(dir) { if (!fs.existsSync(dir)) return; for (const entry of fs.readdirSync(dir)) { const file = path.join(dir, entry); fs.rmSync(file, { recursive: true, force: true }); } }
function listFiles(dir, prefix = '') { if (!fs.existsSync(dir)) return []; return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => { const relative = prefix ? `${prefix}/${entry.name}` : entry.name; return entry.isDirectory() ? listFiles(path.join(dir, entry.name), relative) : [relative.replace(/\\/g, '/')]; }); }
function mediaReference(value) { const clean = safePath(value); const marker = clean.indexOf('media/'); return marker >= 0 ? clean.slice(marker + 'media/'.length) : ''; }
function referencedMedia(catalog) { const references = new Set(); for (const product of catalog.products || []) for (const media of product.media || []) { const ref = mediaReference(media.path); if (ref) references.add(ref); } for (const cover of catalog.covers || []) { const ref = mediaReference(cover.path); if (ref) references.add(ref); } return references; }
function cleanUnusedMedia(catalog) { const used = referencedMedia(catalog); for (const relative of listFiles(MEDIA_DIR)) if (!used.has(relative)) fs.rmSync(path.join(MEDIA_DIR, relative), { force: true }); return used.size; }
function backupCurrentPublish(catalog) { if (!fs.existsSync(PUBLISH_DIR) || !listFiles(PUBLISH_DIR).length) return null; const stamp = `${new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)}-${Date.now().toString().slice(-4)}`; const target = path.join(BACKUP_DIR, stamp); copyTree(PUBLISH_DIR, target); writeJson(path.join(target, 'backup-info.json'), { createdAt: new Date().toISOString(), products: catalog.products?.length || 0 }); const backups = fs.readdirSync(BACKUP_DIR, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name).sort().reverse(); for (const old of backups.slice(5)) fs.rmSync(path.join(BACKUP_DIR, old), { recursive: true, force: true }); return target; }
function exportStatic() {
  const catalog = readCatalog();
  const backup = backupCurrentPublish(catalog);
  const usedMedia = cleanUnusedMedia(catalog);
  cleanDir(PUBLISH_DIR);
  fs.mkdirSync(PUBLISH_DIR, { recursive: true });
  const source = path.join(ROOT, 'static-template');
  copyTree(source, PUBLISH_DIR);
  copyTree(MEDIA_DIR, path.join(PUBLISH_DIR, 'media'));
  writeJson(path.join(PUBLISH_DIR, 'catalog.json'), catalog);
  const exportInfo = { generatedAt: new Date().toISOString(), products: catalog.products.length, media: usedMedia, backupCreated: Boolean(backup) };
  writeJson(path.join(PUBLISH_DIR, 'export-info.json'), exportInfo);
  cleanDir(DESKTOP_PUBLISH_DIR);
  copyTree(PUBLISH_DIR, DESKTOP_PUBLISH_DIR);
  return { path: PUBLISH_DIR, desktopPath: DESKTOP_PUBLISH_DIR, ...exportInfo };
}
function countFiles(dir) { if (!fs.existsSync(dir)) return 0; return fs.readdirSync(dir, { withFileTypes: true }).reduce((sum, entry) => sum + (entry.isDirectory() ? countFiles(path.join(dir, entry.name)) : 1), 0); }
function serveFile(res, file) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, { error: '文件不存在' });
  const ext = path.extname(file).toLowerCase(); const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(file).pipe(res);
}
function open(url) { exec(`start "" "${url}"`); }
async function handle(req, res) {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`); let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/`' || pathname === '/%60') pathname = '/';
  try {
    if (req.method === 'GET' && pathname === '/api/health') return send(res, 200, { ok: true, service: 'NOCTURNE 本地店铺管理器', port: PORT });
    if (req.method === 'GET' && pathname === '/api/catalog') return send(res, 200, readCatalog());
    if (req.method === 'POST' && pathname === '/api/catalog') { const body = await readBody(req); saveCatalog(body); return send(res, 200, { ok: true }); }
    if (req.method === 'POST' && pathname === '/api/upload') {
      const body = await readBody(req); const folder = safePath(body.folder || 'products'); const filename = safePath(body.filename || `${Date.now()}.bin`); const relative = `${folder}/${Date.now()}-${crypto.randomUUID()}-${filename}`; const target = path.join(MEDIA_DIR, relative); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, Buffer.from(String(body.data || '').replace(/^data:[^;]+;base64,/, ''), 'base64')); return send(res, 200, { ok: true, path: `media/${relative}`, type: body.type || 'application/octet-stream', name: body.filename || filename });
    }
    if (req.method === 'POST' && pathname === '/api/export') return send(res, 200, { ok: true, ...exportStatic() });
    if (req.method === 'POST' && pathname === '/api/open-publish') { exportStatic(); open(`http://127.0.0.1:${PORT}/publish/`); return send(res, 200, { ok: true }); }
    if (req.method === 'GET' && pathname.startsWith('/media/')) return serveFile(res, path.join(MEDIA_DIR, safePath(pathname.slice('/media/'.length))));
    if (req.method === 'GET' && pathname.startsWith('/publish/')) return serveFile(res, path.join(PUBLISH_DIR, safePath(pathname.slice('/publish/'.length) || 'index.html')));
    if (req.method === 'GET') return serveFile(res, path.join(ROOT, pathname === '/' ? 'manager.html' : safePath(pathname)));
    return send(res, 404, { error: '未找到请求' });
  } catch (error) { send(res, 500, { error: error.message || '本地程序发生错误' }); }
}
ensureDirs();
http.createServer(handle).listen(PORT, '127.0.0.1', () => { console.log(`NOCTURNE 本地店铺管理器：http://127.0.0.1:${PORT}`); });
