const SERVICE_WECHAT = 'kjgbsh123321';
const ADMIN_ACCOUNT = 'a983553321';
const ADMIN_PASSWORD = 'a5213258';
const defaultCategories = [
  { name: '全部', subs: ['全部'] },
  { name: '情趣玩具', subs: ['热门精选', '震动玩具', '入门探索', '双人互动'] },
  { name: '私密护理', subs: ['润滑护理', '清洁护理', '身体香氛'] },
  { name: '内衣睡衣', subs: ['蕾丝内衣', '居家睡衣', '丝袜袜品'] },
  { name: '情侣礼盒', subs: ['纪念日礼盒', '新婚礼盒', '周末礼盒'] },
  { name: '男士专区', subs: ['飞机杯', '自慰器', '男士护理'] }
];
const sampleProducts = [
  { id: 'toy', name: '夜色静音玩具', price: 299, category: '情趣玩具', subcategory: '热门精选', description: '低调、安静，留给你自己的探索时间。', specs: '材质：亲肤硅胶\n模式：多档调节\n颜色：酒红', media: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=85', type: 'image', badge: '私密精选' },
  { id: 'care', name: '丝绒感私密护理油', price: 169, category: '私密护理', subcategory: '润滑护理', description: '轻盈触感，适合独处时的放松仪式。', specs: '容量：50ml\n质地：水性\n香调：无香', media: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=85', type: 'image', badge: 'NEW' },
  { id: 'lingerie', name: '月光蕾丝睡衣', price: 429, category: '内衣睡衣', subcategory: '蕾丝内衣', description: '柔软蕾丝与轻盈剪裁，让身体自在呼吸。', specs: '面料：蕾丝混纺\n尺码：S-XL\n颜色：黑色', media: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=900&q=85', type: 'image', badge: '编辑推荐' },
  { id: 'gift', name: '两个人的夜晚礼盒', price: 599, category: '情侣礼盒', subcategory: '纪念日礼盒', description: '为纪念日、周末和想靠近的时刻准备。', specs: '内容：精选好物 3 件\n包装：隐私礼盒\n适合：情侣', media: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=85', type: 'image', badge: '礼盒' }
];
const state = { products: load('nocturne-products', sampleProducts), categories: load('nocturne-categories', defaultCategories), cart: load('nocturne-cart', []), category: '全部', subcategory: '全部', sort: 'featured' };
const heroSlides = [
  { image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1100&q=85', label: 'AFTER<br>DARK', note: '静谧的夜晚，也可以有一点期待。' },
  { image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1100&q=85', label: 'PRIVATE<br>RITUAL', note: '给自己留一段不被打扰的时间。' },
  { image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1100&q=85', label: 'TWO<br>OF US', note: '让靠近这件事，自然发生。' }
];
let heroIndex = 0;
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const money = value => `¥${Number(value || 0).toLocaleString('zh-CN')}`;
function load(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function escapeHtml(value = '') { return String(value).replace(/[&<>'"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[ch])); }
function renderCategories() {
  $('[data-category-tabs]').innerHTML = state.categories.map(c => `<button class="category-chip ${state.category === c.name ? 'active' : ''}" data-category="${escapeHtml(c.name)}">${escapeHtml(c.name)}</button>`).join('');
  const current = state.categories.find(c => c.name === state.category) || state.categories[0];
  if (!current.subs.includes(state.subcategory)) state.subcategory = '全部';
  $('[data-subcategory-tabs]').innerHTML = current.subs.map(s => `<button class="sub-chip ${state.subcategory === s ? 'active' : ''}" data-subcategory="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('');
  $$('[data-category]').forEach(btn => btn.addEventListener('click', () => { state.category = btn.dataset.category; state.subcategory = '全部'; renderCategories(); renderProducts(); }));
  $$('[data-subcategory]').forEach(btn => btn.addEventListener('click', () => { state.subcategory = btn.dataset.subcategory; renderCategories(); renderProducts(); }));
}
function renderHero() {
  $('[data-hero-slides]').innerHTML = heroSlides.map((slide, i) => `<div class="hero-slide ${i === heroIndex ? 'active' : ''}" style="background-image:linear-gradient(130deg,rgba(65,29,43,.1),rgba(65,29,43,.3)),url('${slide.image}')"><span>${slide.label}</span><small>${slide.note}</small><b>18+</b></div>`).join('');
  $('[data-hero-dots]').innerHTML = heroSlides.map((_, i) => `<button class="${i === heroIndex ? 'active' : ''}" data-hero-dot="${i}" aria-label="第 ${i + 1} 张"></button>`).join('');
  $$('[data-hero-dot]').forEach(dot => dot.addEventListener('click', () => { heroIndex = Number(dot.dataset.heroDot); renderHero(); }));
}
function nextHero(step = 1) { heroIndex = (heroIndex + step + heroSlides.length) % heroSlides.length; renderHero(); }
function renderProducts() {
  let products = state.products.filter(p => (state.category === '全部' || p.category === state.category) && (state.subcategory === '全部' || p.subcategory === state.subcategory));
  if (state.sort === 'price-low') products.sort((a,b) => a.price - b.price);
  if (state.sort === 'price-high') products.sort((a,b) => b.price - a.price);
  $('[data-product-count]').textContent = `${products.length} 件好物`;
  $('[data-product-grid]').innerHTML = products.map(p => `<article class="product-card" data-detail="${p.id}"><div class="product-media">${p.type === 'video' ? `<video src="${p.media}" muted loop autoplay playsinline></video>` : `<img src="${p.media}" alt="${escapeHtml(p.name)}" loading="lazy">`}${p.badge ? `<span class="product-badge">${escapeHtml(p.badge)}</span>` : ''}</div><div class="product-info"><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.subcategory || p.category)}</p><strong>${money(p.price)}</strong><button class="add-button" data-add="${p.id}" aria-label="加入购物袋">＋</button></div></article>`).join('') || '<p class="empty-state">这个分类还没有商品，换个小分类看看。</p>';
  $$('[data-detail]').forEach(card => card.addEventListener('click', e => { if (!e.target.closest('[data-add]')) openProduct(card.dataset.detail); }));
  $$('[data-add]').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); addToCart(btn.dataset.add); }));
}
function addToCart(id) { const product = state.products.find(p => p.id === id); if (!product) return; state.cart.push(product); save('nocturne-cart', state.cart); renderCart(); showToast('已加入购物袋，可联系客服购买'); }
function renderCart() { const count = state.cart.length; $$('[data-cart-count]').forEach(el => el.textContent = count); $('[data-cart-total]').textContent = money(state.cart.reduce((sum, p) => sum + Number(p.price), 0)); const wrap = $('[data-cart-items]'); wrap.innerHTML = state.cart.length ? state.cart.map((p, i) => `<div class="cart-row"><img src="${p.media}" alt=""><div><p>${escapeHtml(p.name)}</p><small>${money(p.price)}</small></div><button class="remove-item" data-remove="${i}">移除</button></div>`).join('') : '<p class="sheet-muted">购物袋还是空的，去挑一些喜欢的东西吧。</p>'; $$('[data-remove]').forEach(btn => btn.addEventListener('click', () => { state.cart.splice(Number(btn.dataset.remove), 1); save('nocturne-cart', state.cart); renderCart(); })); }
function renderAdmin() { $('[data-product-category]').innerHTML = state.categories.filter(c => c.name !== '全部').map(c => `<option>${escapeHtml(c.name)}</option>`).join(''); updateSubcategoryOptions(); $('[data-admin-list]').innerHTML = state.products.map(p => `<div class="admin-product"><img src="${p.media}" alt=""><div><p>${escapeHtml(p.name)}</p><small>${escapeHtml(p.category)} / ${escapeHtml(p.subcategory || '')} · ${money(p.price)}</small></div><button class="admin-delete" data-delete="${p.id}">删除</button></div>`).join(''); $('[data-category-list]').innerHTML = state.categories.filter(c => c.name !== '全部').map(c => `<div class="admin-category"><strong>${escapeHtml(c.name)}</strong><span>${c.subs.map(escapeHtml).join(' · ')}</span><button class="admin-delete" data-category-delete="${escapeHtml(c.name)}">删除</button></div>`).join(''); $$('[data-delete]').forEach(btn => btn.addEventListener('click', () => { state.products = state.products.filter(p => p.id !== btn.dataset.delete); save('nocturne-products', state.products); renderProducts(); renderAdmin(); })); $$('[data-category-delete]').forEach(btn => btn.addEventListener('click', () => { if (state.categories.length <= 2) return showToast('至少保留一个分类'); state.categories = state.categories.filter(c => c.name !== btn.dataset.categoryDelete); save('nocturne-categories', state.categories); if (state.category === btn.dataset.categoryDelete) state.category = '全部'; renderCategories(); renderProducts(); renderAdmin(); })); }
function updateSubcategoryOptions() { const cat = $('[data-product-category]').value || state.categories.find(c => c.name !== '全部')?.name; const item = state.categories.find(c => c.name === cat); $('[data-product-subcategory]').innerHTML = (item?.subs || ['全部']).filter(s => s !== '全部').map(s => `<option>${escapeHtml(s)}</option>`).join(''); }
function openModal(kind) { $('[data-modal-backdrop]').hidden = false; $$('[data-modal-backdrop] > section').forEach(el => el.hidden = true); $(`[data-${kind}-sheet]`)?.removeAttribute('hidden'); $(`[data-${kind}-sheet]`)?.scrollTo(0,0); }
function closeModal() { $('[data-modal-backdrop]').hidden = true; }
function openProduct(id) { const p = state.products.find(x => x.id === id); if (!p) return; $('[data-detail-name]').textContent = p.name; $('[data-detail-price]').textContent = money(p.price); $('[data-detail-description]').textContent = p.description || ''; $('[data-detail-specs]').innerHTML = (p.specs || '').split(/\n/).filter(Boolean).map(row => `<span>${escapeHtml(row)}</span>`).join(''); $('[data-detail-media]').innerHTML = p.type === 'video' ? `<video src="${p.media}" controls playsinline></video>` : `<img src="${p.media}" alt="${escapeHtml(p.name)}">`; $('[data-detail-contact]').onclick = () => openService(); openModal('product'); }
function openService() { openModal('service'); }
function showToast(message) { const toast = $('[data-toast]'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }
$$('[data-sort]').forEach(el => el.addEventListener('change', e => { state.sort = e.target.value; renderProducts(); }));
$$('[data-open-cart]').forEach(b => b.addEventListener('click', () => openModal('cart')));
$$('[data-open-service]').forEach(b => b.addEventListener('click', openService));
$$('[data-open-admin]').forEach(b => b.addEventListener('click', () => openModal('admin')));
$$('[data-close-modal]').forEach(b => b.addEventListener('click', closeModal));
$('[data-modal-backdrop]').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
$('[data-checkout]').addEventListener('click', openService);
$('[data-copy-wechat]').addEventListener('click', async () => { try { await navigator.clipboard.writeText(SERVICE_WECHAT); showToast('客服微信已复制'); } catch { showToast(`客服微信：${SERVICE_WECHAT}`); } });
$('[data-admin-login]').addEventListener('submit', e => { e.preventDefault(); const form = e.currentTarget; if (form.account.value === ADMIN_ACCOUNT && form.password.value === ADMIN_PASSWORD) { sessionStorage.setItem('nocturne-admin', '1'); $('[data-admin-login-panel]').hidden = true; $('[data-admin-panel]').hidden = false; renderAdmin(); } else $('[data-login-error]').textContent = '账号或密码不正确'; });
$('[data-admin-logout]').addEventListener('click', () => { sessionStorage.removeItem('nocturne-admin'); $('[data-admin-login-panel]').hidden = false; $('[data-admin-panel]').hidden = true; });
$$('[data-admin-tab]').forEach(btn => btn.addEventListener('click', () => { $$('[data-admin-tab]').forEach(b => b.classList.remove('active')); btn.classList.add('active'); $('[data-admin-products-panel]').hidden = btn.dataset.adminTab !== 'products'; $('[data-admin-categories-panel]').hidden = btn.dataset.adminTab !== 'categories'; }));
$('[data-product-category]').addEventListener('change', updateSubcategoryOptions);
$('[data-reset-products]').addEventListener('click', () => { state.products = sampleProducts; save('nocturne-products', state.products); renderCategories(); renderProducts(); renderAdmin(); showToast('示例商品已恢复'); });
$('[data-product-form]').addEventListener('submit', e => { e.preventDefault(); const form = e.currentTarget; const file = form.media.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { const product = { id: `custom-${Date.now()}`, name: form.name.value.trim(), price: Number(form.price.value), category: form.category.value, subcategory: form.subcategory.value, specs: form.specs.value.trim(), description: form.description.value.trim(), media: reader.result, type: file.type.startsWith('video') ? 'video' : 'image', badge: 'NEW' }; state.products.unshift(product); save('nocturne-products', state.products); form.reset(); updateSubcategoryOptions(); renderProducts(); renderAdmin(); showToast('商品已发布'); }; reader.readAsDataURL(file); });
$('[data-category-form]').addEventListener('submit', e => { e.preventDefault(); const form = e.currentTarget; const name = form.name.value.trim(); if (!name || state.categories.some(c => c.name === name)) return showToast('分类名称不能为空或已存在'); const subs = form.subcategories.value.split(/[、,，]/).map(s => s.trim()).filter(Boolean); state.categories.push({ name, subs: ['全部', ...subs] }); save('nocturne-categories', state.categories); form.reset(); renderCategories(); renderAdmin(); showToast('分类已添加'); });
$$('[data-hero-prev]').forEach(button => button.addEventListener('click', () => nextHero(-1)));
$$('[data-hero-next]').forEach(button => button.addEventListener('click', () => nextHero(1)));
renderHero(); renderCategories(); renderProducts(); renderCart();
setInterval(() => nextHero(1), 5000);
if (sessionStorage.getItem('nocturne-admin') === '1') { $('[data-admin-login-panel]').hidden = true; $('[data-admin-panel]').hidden = false; }
