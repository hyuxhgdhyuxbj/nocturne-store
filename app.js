const sampleProducts = [
  { id: 'cup', name: '云朵白瓷杯', price: 129, category: '家居', description: '手感温润的日常杯，适合晨间咖啡。', media: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85', type: 'image', badge: '日常精选' },
  { id: 'shirt', name: '亚麻宽松衬衫', price: 389, category: '服饰', description: '轻薄亚麻，留一点松弛给身体。', media: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85', type: 'image', badge: 'NEW' },
  { id: 'candle', name: '雨后松木香氛', price: 199, category: '香氛', description: '松针、湿土与一点点木质烟熏。', media: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85', type: 'image', badge: '编辑推荐' },
  { id: 'bag', name: '帆布生活袋', price: 159, category: '服饰', description: '装下日常，也装下临时起意。', media: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85', type: 'image', badge: '' }
];
const state = { products: load('songfeng-products', sampleProducts), cart: load('songfeng-cart', []), category: '全部', sort: 'featured' };
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const money = value => `¥${Number(value).toLocaleString('zh-CN')}`;
function load(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function renderProducts() {
  let products = state.products.filter(p => state.category === '全部' || p.category === state.category);
  if (state.sort === 'price-low') products.sort((a,b) => a.price - b.price);
  if (state.sort === 'price-high') products.sort((a,b) => b.price - a.price);
  const grid = $('[data-product-grid]');
  grid.innerHTML = products.map(p => `<article class="product-card"><div class="product-media">${p.type === 'video' ? `<video src="${p.media}" muted loop autoplay playsinline></video>` : `<img src="${p.media}" alt="${p.name}" loading="lazy">`}${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}</div><div class="product-info"><h3 class="product-name">${p.name}</h3><div class="product-meta"><span>${p.category}</span><strong>${money(p.price)}</strong></div><button class="add-button" data-add="${p.id}" aria-label="加入购物袋">＋</button></div></article>`).join('') || '<p class="empty-state">这个分类还没有商品。</p>';
  $$('[data-add]').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.add)));
}
function addToCart(id) { const product = state.products.find(p => p.id === id); if (!product) return; state.cart.push(product); save('songfeng-cart', state.cart); renderCart(); showToast(`${product.name} 已加入购物袋`); }
function renderCart() { const count = state.cart.length; $$('[data-cart-count]').forEach(el => el.textContent = count); $('[data-cart-total]').textContent = money(state.cart.reduce((sum, p) => sum + Number(p.price), 0)); const wrap = $('[data-cart-items]'); wrap.innerHTML = state.cart.length ? state.cart.map((p, i) => `<div class="cart-row"><img src="${p.media}" alt="${p.name}"><div><p>${p.name}</p><small>${money(p.price)}</small></div><button class="remove-item" data-remove="${i}">移除</button></div>`).join('') : '<p class="admin-intro">购物袋还是空的，去挑一些喜欢的东西吧。</p>'; $$('[data-remove]').forEach(btn => btn.addEventListener('click', () => { state.cart.splice(Number(btn.dataset.remove), 1); save('songfeng-cart', state.cart); renderCart(); })); }
function renderAdminList() { $('[data-admin-list]').innerHTML = state.products.map(p => `<div class="admin-product"><img src="${p.media}" alt=""><div><p>${p.name}</p><small>${p.category} · ${money(p.price)}</small></div><button class="admin-delete" data-delete="${p.id}">删除</button></div>`).join(''); $$('[data-delete]').forEach(btn => btn.addEventListener('click', () => { state.products = state.products.filter(p => p.id !== btn.dataset.delete); save('songfeng-products', state.products); renderProducts(); renderAdminList(); showToast('商品已删除'); })); }
function openDrawer(kind) { $('[data-modal-backdrop]').hidden = false; $('[data-cart-drawer]').hidden = kind !== 'cart'; $('[data-admin-drawer]').hidden = kind !== 'admin'; }
function closeDrawer() { $('[data-modal-backdrop]').hidden = true; }
function showToast(message) { const toast = $('[data-toast]'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }
$$('[data-category]').forEach(btn => btn.addEventListener('click', () => { $$('[data-category]').forEach(b => b.classList.remove('active')); btn.classList.add('active'); state.category = btn.dataset.category; renderProducts(); }));
$('[data-sort]').addEventListener('change', e => { state.sort = e.target.value; renderProducts(); });
$$('[data-open-cart]').forEach(b => b.addEventListener('click', () => openDrawer('cart')));
$$('[data-open-admin]').forEach(b => b.addEventListener('click', () => { openDrawer('admin'); renderAdminList(); }));
$$('[data-close-drawer]').forEach(b => b.addEventListener('click', closeDrawer));
$('[data-modal-backdrop]').addEventListener('click', e => { if (e.target === e.currentTarget) closeDrawer(); });
$('[data-checkout]').addEventListener('click', () => showToast('演示模式：接入支付后即可完成结算'));
$('[data-reset-products]').addEventListener('click', () => { state.products = sampleProducts; save('songfeng-products', state.products); renderProducts(); renderAdminList(); showToast('示例商品已恢复'); });
$('[data-product-form]').addEventListener('submit', e => { e.preventDefault(); const form = e.currentTarget; const file = form.media.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { const product = { id: `custom-${Date.now()}`, name: form.name.value.trim(), price: Number(form.price.value), category: form.category.value, description: form.description.value.trim(), media: reader.result, type: file.type.startsWith('video') ? 'video' : 'image', badge: 'NEW' }; state.products.unshift(product); save('songfeng-products', state.products); form.reset(); renderProducts(); renderAdminList(); showToast('商品已发布到首页'); }; reader.readAsDataURL(file); });
$('[data-newsletter-form]').addEventListener('submit', e => { e.preventDefault(); e.currentTarget.reset(); showToast('订阅成功，欢迎加入松风。'); });
renderProducts(); renderCart();
