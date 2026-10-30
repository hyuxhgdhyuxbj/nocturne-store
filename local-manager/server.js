const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'manager-data');
const MEDIA_DIR = path.join(DATA_DIR, 'media');
const PUBLISH_DIR = path.join(DATA_DIR, 'publish');
const PORT = 4310;
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
  for (const dir of [DATA_DIR, MEDIA_DIR, PUBLISH_DIR]) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(path.join(DATA_DIR, 'catalog.json'))) writeJson(path.join(DATA_DIR, 'catalog.json'), defaults);
}
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8'); }
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
function exportStatic() {
  const catalog = readCatalog();
  cleanDir(PUBLISH_DIR);
  fs.mkdirSync(PUBLISH_DIR, { recursive: true });
  const source = path.join(ROOT, 'static-template');
  copyTree(source, PUBLISH_DIR);
  copyTree(MEDIA_DIR, path.join(PUBLISH_DIR, 'media'));
  writeJson(path.join(PUBLISH_DIR, 'catalog.json'), catalog);
  return { path: PUBLISH_DIR, products: catalog.products.length, media: countFiles(MEDIA_DIR) };
}
function countFiles(dir) { if (!fs.existsSync(dir)) return 0; return fs.readdirSync(dir, { withFileTypes: true }).reduce((sum, entry) => sum + (entry.isDirectory() ? countFiles(path.join(dir, entry.name)) : 1), 0); }
function serveFile(res, file) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) return send(res, 404, { error: '文件不存在' });
  const ext = path.extname(file).toLowerCase(); const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(file).pipe(res);
}
function open(url) { exec(`start "" "${url}"`); }
async function handle(req, res) {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`); const pathname = decodeURIComponent(url.pathname);
  try {
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
