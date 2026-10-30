const sampleProducts = [
  { id: 'toy', name: '夜色静音玩具', price: 299, category: '情趣玩具', description: '低调、安静，留给你自己的探索时间。', media: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=85', type: 'image', badge: '私密精选' },
  { id: 'care', name: '丝绒感私密护理油', price: 169, category: '私密护理', description: '轻盈触感，适合独处时的放松仪式。', media: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=85', type: 'image', badge: 'NEW' },
  { id: 'lingerie', name: '月光蕾丝睡衣', price: 429, category: '内衣', description: '柔软蕾丝与轻盈剪裁，让身体自在呼吸。', media: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=85', type: 'image', badge: '编辑推荐' },
  { id: 'gift', name: '两个人的夜晚礼盒', price: 599, category: '情侣礼盒', description: '为纪念日、周末和想靠近的时刻准备。', media: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85', type: 'image', badge: '礼盒' }
];
const state = { products: load('nocturne-products', sampleProducts), cart: load('nocturne-cart', []), category: '全部', sort: 'featured' };
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
function addToCart(id) { const product = state.products.find(p => p.id === id); if (!product) return; state.cart.push(product); save('nocturne-cart', state.cart); renderCart(); showToast(`${product.name} 已加入购物袋`); }
function renderCart() { const count = state.cart.length; $$('[data-cart-count]').forEach(el => el.textContent = count); $('[data-cart-total]').textContent = money(state.cart.reduce((sum, p) => sum + Number(p.price), 0)); const wrap = $('[data-cart-items]'); wrap.innerHTML = state.cart.length ? state.cart.map((p, i) => `<div class="cart-row"><img src="${p.media}" alt="${p.name}"><div><p>${p.name}</p><small>${money(p.price)}</small></div><button class="remove-item" data-remove="${i}">移除</button></div>`).join('') : '<p class="admin-intro">购物袋还是空的，去挑一些喜欢的东西吧。</p>'; $$('[data-remove]').forEach(btn => btn.addEventListener('click', () => { state.cart.splice(Number(btn.dataset.remove), 1); save('nocturne-cart', state.cart); renderCart(); })); }
function renderAdminList() { $('[data-admin-list]').innerHTML = state.products.map(p => `<div class="admin-product"><img src="${p.media}" alt=""><div><p>${p.name}</p><small>${p.category} · ${money(p.price)}</small></div><button class="admin-delete" data-delete="${p.id}">删除</button></div>`).join(''); $$('[data-delete]').forEach(btn => btn.addEventListener('click', () => { state.products = state.products.filter(p => p.id !== btn.dataset.delete); save('nocturne-products', state.products); renderProducts(); renderAdminList(); showToast('商品已删除'); })); }
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
$('[data-reset-products]').addEventListener('click', () => { state.products = sampleProducts; save('nocturne-products', state.products); renderProducts(); renderAdminList(); showToast('示例商品已恢复'); });
$('[data-product-form]').addEventListener('submit', e => { e.preventDefault(); const form = e.currentTarget; const file = form.media.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { const product = { id: `custom-${Date.now()}`, name: form.name.value.trim(), price: Number(form.price.value), category: form.category.value, description: form.description.value.trim(), media: reader.result, type: file.type.startsWith('video') ? 'video' : 'image', badge: 'NEW' }; state.products.unshift(product); save('nocturne-products', state.products); form.reset(); renderProducts(); renderAdminList(); showToast('商品已发布到首页'); }; reader.readAsDataURL(file); });
$('[data-newsletter-form]').addEventListener('submit', e => { e.preventDefault(); e.currentTarget.reset(); showToast('订阅成功，欢迎加入松风。'); });
renderProducts(); renderCart();
