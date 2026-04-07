// ─── SUPABASE INIT ────────────────────────────────────────────
const SUPABASE_URL = 'https://xvnxobqgnhaupjjrstef.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bnhvYnFnbmhhdXBqanJzdGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Mzc5NzYsImV4cCI6MjA5MDMxMzk3Nn0.PHeqAao7jzjrQCcL1bP7Jt0Ku6Eqh7YngyzVqnjw6pI';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// ─── COFFEE SHOPS DATA ─────────────────────────────────────────
const SHOPS = [
  { id:1,  name:"Velo Coffee Roasting Co.",   neighborhood:"Southside",       address:"1 W 21st St, Chattanooga, TN 37408",          mx:58,  my:190, desc:"Exceptional craft roasting and bicycle-delivered beans." },
  { id:2,  name:"Niedlov's Bakery & Café",     neighborhood:"Main St.",        address:"215 E Main St, Chattanooga, TN 37408",        mx:140, my:172, desc:"Famous sourdough and excellent espresso drinks." },
  { id:3,  name:"Mad Priest Coffee Roasters",  neighborhood:"Broad St.",       address:"1400 Broad St, Chattanooga, TN 37402",        mx:118, my:155, desc:"Great coffee with a social justice mission." },
  { id:4,  name:"Remondi's",                   neighborhood:"North Shore",     address:"201 Manufacturers Rd, Chattanooga, TN 37405", mx:148, my:210, desc:"Classic, cozy spot perfect for meeting friends." },
  { id:5,  name:"Stone Cup Café",              neighborhood:"North Shore",     address:"2315 Wayside Dr, Chattanooga, TN 37404",      mx:175, my:218, desc:"Overlooking Coolidge Park, a long-standing community staple." },
  { id:6,  name:"Mean Mug Coffeehouse",        neighborhood:"Southside",       address:"26 E Main St, Chattanooga, TN 37408",         mx:130, my:178, desc:"Excellent workspace, great food menu, superb espresso." },
  { id:7,  name:"Together Café",               neighborhood:"East Orchard Knob", address:"1015 E 11th St, Chattanooga, TN 37403",    mx:245, my:165, desc:"Beautiful, spacious non-profit coffee shop." },
  { id:8,  name:"Sleepyhead Coffee",           neighborhood:"Downtown",        address:"100 W MLK Blvd, Chattanooga, TN 37402",       mx:115, my:142, desc:"Aesthetic, plant-filled shop with amazing vegan pastries." },
  { id:9,  name:"Beasle's Coffee",             neighborhood:"MLK Blvd",        address:"600 MLK Blvd, Chattanooga, TN 37403",         mx:160, my:148, desc:"Quiet, modern spot perfect for focused reading." },
  { id:10, name:"Camp House",                  neighborhood:"MLK Blvd",        address:"149 E MLK Blvd, Chattanooga, TN 37403",       mx:138, my:143, desc:"Massive church-affiliated space that feels like a giant living room." },
  { id:11, name:"Frothy Monkey",               neighborhood:"Southside / Choo Choo", address:"1400 Market St, Chattanooga, TN 37402", mx:105, my:168, desc:"Housed in the historic terminal station with full breakfast." },
  { id:12, name:"Milk & Honey",                neighborhood:"North Shore",     address:"401 Manufacturers Rd, Chattanooga, TN 37405", mx:165, my:215, desc:"Specialty coffee, homemade gelato, and a massive brunch menu." },
  { id:13, name:"Goodman Coffee Roasters",     neighborhood:"St. Elmo",        address:"2 W 58th St, Chattanooga, TN 37409",          mx:72,  my:220, desc:"Focused on the art of roasting with a laid-back atmosphere." },
  { id:14, name:"Cadence Coffee Co.",          neighborhood:"Downtown",        address:"201 Broad St, Chattanooga, TN 37402",         mx:122, my:135, desc:"Warm, community-driven shop with great daily brews." },
  { id:15, name:"Screamin' Charlie's",         neighborhood:"Brainerd",        address:"6021 Brainerd Rd, Chattanooga, TN 37421",     mx:298, my:182, desc:"Fun, slightly edgy vibe and excellent rotating roasts." },
  { id:16, name:"Plus Coffee",                 neighborhood:"St. Elmo",        address:"3904 St Elmo Ave, Chattanooga, TN 37409",     mx:62,  my:228, desc:"Minimalist modern shop near the Incline Railway." },
  { id:17, name:"Sunnyside Cup",               neighborhood:"Glendale",        address:"4005 Hixson Pike, Chattanooga, TN 37415",     mx:178, my:52,  desc:"Drive-thru favorite for a quick, high-quality morning pick-me-up." },
  { id:18, name:"The Daily Ration",            neighborhood:"North Shore",     address:"1220 Dartmouth St, Chattanooga, TN 37405",    mx:192, my:208, desc:"Coffee by day, full restaurant by night, massive outdoor patio." },
  { id:19, name:"Wildflower Tea Shop & Bakery",neighborhood:"Downtown",        address:"1225 Market St, Chattanooga, TN 37402",       mx:108, my:158, desc:"Top-tier coffee and matcha programs." },
  { id:20, name:"Burlaep Print & Press",       neighborhood:"Riverside",       address:"3 W Aquarium Way, Chattanooga, TN 37402",     mx:200, my:135, desc:"Part screen-printing shop, part coffee bar. Industrial vibe." },
];

const RATING_CATS = ['Drink','Price','Indoor Seating','Outdoor Seating','Parking','Service','Bathroom'];
const BEAN = '☕';

// ─── STATE ─────────────────────────────────────────────────────
let currentUser = null;
let currentProfile = null;
let pageStack = ['feed'];
let reviewDraft = { shopId: null, ratings: {}, notes: '', drink: '', price: '', photoFile: null, photoUrl: null };
let allPosts = [];

// ─── BOOT ──────────────────────────────────────────────────────
window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
  setTimeout(async () => {
    document.getElementById('splash').style.opacity = '0';
    setTimeout(async () => {
      document.getElementById('splash').style.display = 'none';
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        await bootUser(session.user);
      } else {
        showAuth();
      }
    }, 800);
  }, 2000);
});

async function bootUser(user) {
  currentUser = user;
  // Try to get profile, create it if it doesn't exist yet
  let { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (!profile) {
    const meta = user.user_metadata || {};
    const { data: newProfile } = await sb.from('profiles').upsert({
      id: user.id,
      username: meta.username || user.email.split('@')[0],
      full_name: meta.full_name || meta.username || user.email.split('@')[0],
      avatar_url: null
    }, { onConflict: 'id' }).select().single();
    profile = newProfile;
  }
  currentProfile = profile;
  updateNavAvatar();
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  renderFeed();
  showPage('feed');
}

function showAuth() {
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

// ─── AUTH ──────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t,i) => t.classList.toggle('active', (i===0&&tab==='login')||(i===1&&tab==='signup')));
  document.getElementById('login-form').style.display = tab === 'login' ? 'flex' : 'none';
  document.getElementById('signup-form').style.display = tab === 'signup' ? 'flex' : 'none';
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass  = document.getElementById('login-password').value;
  const err   = document.getElementById('login-error');
  err.textContent = 'Signing in…';
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  if (error) { err.textContent = error.message; return; }
  err.textContent = '';
  await bootUser(data.user);
}

async function handleSignup(e) {
  e.preventDefault();
  const name     = document.getElementById('signup-name').value.trim();
  const username = document.getElementById('signup-username').value.trim().toLowerCase().replace(/\s+/g,'_');
  const email    = document.getElementById('signup-email').value;
  const pass     = document.getElementById('signup-password').value;
  const err      = document.getElementById('signup-error');
  err.textContent = 'Creating account…';
  const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { full_name: name, username } } });
  if (error) { err.textContent = error.message; return; }
  if (!data.user) { err.textContent = 'Check your email to confirm your account, then sign in.'; return; }
  // Always insert profile row directly
  await sb.from('profiles').upsert({ id: data.user.id, full_name: name, username, avatar_url: null }, { onConflict: 'id' });
  err.textContent = '';
  await bootUser(data.user);
}

function updateNavAvatar() {
  const el = document.getElementById('nav-avatar');
  if (!el) return;
  if (currentProfile?.avatar_url) {
    el.innerHTML = `<img src="${currentProfile.avatar_url}" style="width:100%;height:100%;object-fit:cover;" />`;
  } else {
    el.textContent = (currentProfile?.username || currentProfile?.full_name || 'U')[0].toUpperCase();
  }
}

// ─── NAVIGATION ────────────────────────────────────────────────
function showPage(name, pushStack = true) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + name);
  if (navBtn) navBtn.classList.add('active');
  const backBtn = document.getElementById('back-btn');
  const titles = { feed:'ROAST', map:'Map', add:'Review', profile:'Profile', post:'Post', user:'Profile', shop:'Coffee Shop' };
  document.getElementById('topbar-title').textContent = titles[name] || 'ROAST';
  const mainPages = ['feed','map','add','profile'];
  backBtn.style.display = mainPages.includes(name) ? 'none' : 'block';
  if (pushStack) { if (pageStack[pageStack.length-1] !== name) pageStack.push(name); }
  // Render on navigate
  if (name === 'feed') renderFeed();
  if (name === 'map')  renderMap();
  if (name === 'add')  renderAddPage();
  if (name === 'profile') renderProfile(currentUser.id);
}

function goBack() {
  if (pageStack.length > 1) { pageStack.pop(); showPage(pageStack[pageStack.length-1], false); }
}

// ─── FEED ──────────────────────────────────────────────────────
async function renderFeed() {
  const el = document.getElementById('page-feed');
  el.innerHTML = '<p class="section-title">what\'s being sipped in chattanooga</p><div class="circles-grid" id="feed-grid"><div class="empty-state"><div class="empty-icon">☕</div><p>Loading circles…</p></div></div>';
  const { data: posts, error } = await sb.from('posts')
    .select('*, profiles(username, full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(30);
  if (error || !posts) return;
  allPosts = posts;
  const grid = document.getElementById('feed-grid');
  if (!posts.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">☕</div><p>No reviews yet.<br/>Be the first to roast!</p></div>';
    return;
  }
  grid.innerHTML = posts.map(p => circleHTML(p)).join('');
}

function circleHTML(post) {
  const shop = SHOPS.find(s => s.id === post.shop_id) || { name: 'Unknown' };
  const user = post.profiles || {};
  const initial = (user.username || user.full_name || 'U')[0].toUpperCase();
  const inner = post.photo_url
    ? `<img src="${post.photo_url}" alt="${post.drink}" />`
    : `<div class="circle-no-img"><span>${post.drink || shop.name}</span></div>`;
  return `<div class="circle-post" onclick="openPost('${post.id}')">
    ${inner}
    <div class="circle-overlay">
      <div class="circle-user">${user.username || 'unknown'}</div>
      <div class="circle-shop">${shop.name}</div>
    </div>
  </div>`;
}

// ─── POST DETAIL ────────────────────────────────────────────────
async function openPost(postId) {
  const post = allPosts.find(p => p.id == postId) || (await sb.from('posts').select('*, profiles(username,full_name,avatar_url)').eq('id', postId).single()).data;
  if (!post) return;
  const shop = SHOPS.find(s => s.id === post.shop_id) || { name: 'Unknown Shop' };
  const user = post.profiles || {};
  const initial = (user.username || 'U')[0].toUpperCase();
  const avgRating = calcAvg(post.ratings);
  const beans = beansHTML(avgRating);

  // Check like
  const { data: likeData } = await sb.from('likes').select('id').eq('post_id', post.id).eq('user_id', currentUser.id).maybeSingle();
  const liked = !!likeData;
  const { count: likeCount } = await sb.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id);

  // Comments
  const { data: comments } = await sb.from('comments').select('*, profiles(username,avatar_url)').eq('post_id', post.id).order('created_at');

  const avatarEl = user.avatar_url
    ? `<div class="post-detail-avatar" onclick="openUserProfile('${post.user_id}')"><img src="${user.avatar_url}" /></div>`
    : `<div class="post-detail-avatar" onclick="openUserProfile('${post.user_id}')">${initial}</div>`;

  const imgEl = post.photo_url
    ? `<img class="post-detail-img" src="${post.photo_url}" alt="${post.drink}" />`
    : `<div class="post-detail-img-placeholder"><span>${post.drink}</span></div>`;

  const commentsHTML = (comments || []).map(c => {
    const ci = (c.profiles?.username || 'U')[0].toUpperCase();
    const cavatar = c.profiles?.avatar_url
      ? `<div class="comment-avatar"><img src="${c.profiles.avatar_url}" /></div>`
      : `<div class="comment-avatar">${ci}</div>`;
    return `<div class="comment-item">${cavatar}<div class="comment-body"><div class="comment-user">${c.profiles?.username || 'user'}</div><div class="comment-text">${escHtml(c.text)}</div></div></div>`;
  }).join('');

  document.getElementById('page-post').innerHTML = `
    <div class="post-detail">
      <div class="post-detail-header">
        ${avatarEl}
        <div class="post-detail-meta">
          <div class="username">${user.username || user.full_name || 'user'}</div>
          <div class="shop-name">${shop.name}</div>
        </div>
      </div>
      ${imgEl}
      <div class="post-detail-body">
        <div class="post-detail-drink">${escHtml(post.drink)}</div>
        <div class="post-detail-price">${post.price ? '$' + post.price : ''}</div>
        <div class="bean-row" onclick="openRatingModal(${JSON.stringify(post.ratings).replace(/"/g,'&quot;')})" title="Tap to see breakdown">${beans} <span style="font-size:12px;color:var(--tan);margin-left:6px;">${avgRating.toFixed(1)} · tap for breakdown</span></div>
        ${post.notes ? `<div class="post-detail-notes">${escHtml(post.notes)}</div>` : ''}
      </div>
      <div class="post-actions">
        <button class="like-btn ${liked ? 'liked' : ''}" id="like-btn-${post.id}" onclick="toggleLike('${post.id}', ${liked})">
          ${heartSVG(liked)} <span id="like-count-${post.id}">${likeCount || 0}</span>
        </button>
      </div>
      <div class="comments-section">
        <h4>Comments</h4>
        <div id="comments-list-${post.id}">${commentsHTML || '<p style="font-size:13px;color:var(--tan);">No comments yet.</p>'}</div>
        <div class="add-comment">
          <input type="text" id="comment-input-${post.id}" placeholder="Add a comment…" onkeydown="if(event.key==='Enter')submitComment('${post.id}')" />
          <button onclick="submitComment('${post.id}')">→</button>
        </div>
      </div>
    </div>`;
  showPage('post');
}

function heartSVG(filled) {
  return filled
    ? `<svg viewBox="0 0 24 24" fill="var(--burgundy)" stroke="var(--burgundy)" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
}

async function toggleLike(postId, currentlyLiked) {
  const btn = document.getElementById('like-btn-' + postId);
  const countEl = document.getElementById('like-count-' + postId);
  if (currentlyLiked) {
    await sb.from('likes').delete().eq('post_id', postId).eq('user_id', currentUser.id);
    btn.className = 'like-btn';
    btn.innerHTML = heartSVG(false) + ` <span id="like-count-${postId}">${Math.max(0,(parseInt(countEl.textContent)||1)-1)}</span>`;
    btn.setAttribute('onclick', `toggleLike('${postId}', false)`);
  } else {
    await sb.from('likes').insert({ post_id: postId, user_id: currentUser.id });
    btn.className = 'like-btn liked';
    btn.innerHTML = heartSVG(true) + ` <span id="like-count-${postId}">${(parseInt(countEl.textContent)||0)+1}</span>`;
    btn.setAttribute('onclick', `toggleLike('${postId}', true)`);
  }
}

async function submitComment(postId) {
  const input = document.getElementById('comment-input-' + postId);
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  await sb.from('comments').insert({ post_id: postId, user_id: currentUser.id, text });
  const { data: comments } = await sb.from('comments').select('*, profiles(username,avatar_url)').eq('post_id', postId).order('created_at');
  const list = document.getElementById('comments-list-' + postId);
  list.innerHTML = (comments || []).map(c => {
    const ci = (c.profiles?.username || 'U')[0].toUpperCase();
    const cavatar = c.profiles?.avatar_url ? `<div class="comment-avatar"><img src="${c.profiles.avatar_url}" /></div>` : `<div class="comment-avatar">${ci}</div>`;
    return `<div class="comment-item">${cavatar}<div class="comment-body"><div class="comment-user">${c.profiles?.username || 'user'}</div><div class="comment-text">${escHtml(c.text)}</div></div></div>`;
  }).join('');
}

// ─── RATING MODAL ──────────────────────────────────────────────
function openRatingModal(ratingsStr) {
  let ratings = ratingsStr;
  if (typeof ratings === 'string') { try { ratings = JSON.parse(ratingsStr); } catch(e) { return; } }
  if (!ratings) return;
  const bd = document.getElementById('rating-breakdown');
  bd.innerHTML = RATING_CATS.map(cat => {
    const val = ratings[cat] || 0;
    return `<div class="rating-row"><span>${cat}</span><span>${beansHTML(val)} ${val}/5</span></div>`;
  }).join('');
  document.getElementById('rating-modal').style.display = 'flex';
}

function closeRatingModal(e) {
  if (e.target === document.getElementById('rating-modal')) document.getElementById('rating-modal').style.display = 'none';
}

// ─── MAP ───────────────────────────────────────────────────────
async function renderMap() {
  const el = document.getElementById('page-map');
  // Fetch avg ratings per shop
  const { data: posts } = await sb.from('posts').select('shop_id, ratings');
  const shopAvgs = {};
  SHOPS.forEach(s => shopAvgs[s.id] = []);
  (posts || []).forEach(p => { if (shopAvgs[p.shop_id] !== undefined) shopAvgs[p.shop_id].push(calcAvg(p.ratings)); });

  const pins = SHOPS.map(s => {
    const avgs = shopAvgs[s.id];
    const avg = avgs.length ? (avgs.reduce((a,b)=>a+b,0)/avgs.length).toFixed(1) : null;
    return `<g onclick="openShop(${s.id})" style="cursor:pointer">
      <circle cx="${s.mx}" cy="${s.my}" r="7" fill="var(--brown)" stroke="var(--gold)" stroke-width="1.5" opacity="0.92"/>
      <circle cx="${s.mx}" cy="${s.my - 1}" r="2.5" fill="var(--gold)" opacity="0.85"/>
      <line x1="${s.mx}" y1="${s.my + 6}" x2="${s.mx}" y2="${s.my + 11}" stroke="var(--brown)" stroke-width="1.5"/>
    </g>`;
  }).join('');

  el.innerHTML = `
    <div class="map-container">
      <svg class="map-svg" viewBox="0 0 360 260">
        <rect width="360" height="260" fill="#d4c4a8"/>
        <path d="M0,138 Q60,118 120,132 Q180,148 240,128 Q300,108 360,122" stroke="#a8c4d4" stroke-width="20" fill="none" opacity="0.55"/>
        <path d="M0,138 Q60,118 120,132 Q180,148 240,128 Q300,108 360,122" stroke="#b8d4e4" stroke-width="13" fill="none" opacity="0.45"/>
        <line x1="0" y1="80" x2="360" y2="80" stroke="#c4b090" stroke-width="2.5"/>
        <line x1="0" y1="165" x2="360" y2="165" stroke="#c4b090" stroke-width="2.5"/>
        <line x1="0" y1="40" x2="360" y2="55" stroke="#c4b090" stroke-width="1.5" opacity="0.6"/>
        <line x1="0" y1="200" x2="360" y2="210" stroke="#c4b090" stroke-width="1.5" opacity="0.6"/>
        <line x1="80"  y1="0" x2="80"  y2="260" stroke="#c4b090" stroke-width="1.8"/>
        <line x1="160" y1="0" x2="160" y2="260" stroke="#c4b090" stroke-width="1.8"/>
        <line x1="240" y1="0" x2="240" y2="260" stroke="#c4b090" stroke-width="1.8"/>
        <line x1="320" y1="0" x2="320" y2="260" stroke="#c4b090" stroke-width="1.5" opacity="0.7"/>
        <text x="10"  y="230" font-size="7" fill="#a09070" font-family="DM Sans,sans-serif">St. Elmo</text>
        <text x="130" y="73"  font-size="7" fill="#a09070" font-family="DM Sans,sans-serif">Downtown</text>
        <text x="148" y="248" font-size="7" fill="#a09070" font-family="DM Sans,sans-serif">North Shore</text>
        <text x="260" y="175" font-size="7" fill="#a09070" font-family="DM Sans,sans-serif">Brainerd</text>
        <text x="165" y="44"  font-size="7" fill="#a09070" font-family="DM Sans,sans-serif">Hixson</text>
        <text x="60"  y="100" font-size="7" fill="#a09070" font-family="DM Sans,sans-serif">Southside</text>
        <text x="148" y="108" font-size="6" fill="#8ab4c4" font-family="DM Sans,sans-serif">Tennessee River</text>
        ${pins}
      </svg>
    </div>
    <p class="section-title" style="margin-bottom:12px;">tap a pin or shop below</p>
    <div class="shop-list">
      ${SHOPS.map(s => {
        const avgs = shopAvgs[s.id];
        const avg = avgs.length ? (avgs.reduce((a,b)=>a+b,0)/avgs.length).toFixed(1) : '—';
        return `<div class="shop-card" onclick="openShop(${s.id})">
          <div class="shop-card-top">
            <div class="shop-card-name">${s.name}</div>
            <div class="shop-card-stars">${avg !== '—' ? beansHTML(parseFloat(avg)) + ' ' + avg : '☕ no reviews yet'}</div>
          </div>
          <div class="shop-card-addr">${s.neighborhood} · ${s.address.split(',')[0]}</div>
        </div>`;
      }).join('')}
    </div>`;
}

// ─── SHOP DETAIL ────────────────────────────────────────────────
async function openShop(shopId) {
  const shop = SHOPS.find(s => s.id === shopId);
  if (!shop) return;

  const { data: posts } = await sb.from('posts').select('*, profiles(username, full_name, avatar_url)').eq('shop_id', shopId).order('created_at', { ascending: false });
  const allAvgs = (posts || []).map(p => calcAvg(p.ratings));
  const globalAvg = allAvgs.length ? (allAvgs.reduce((a,b)=>a+b,0)/allAvgs.length).toFixed(1) : null;
  const myPosts = (posts || []).filter(p => p.user_id === currentUser.id);
  const myAvgs = myPosts.map(p => calcAvg(p.ratings));
  const myAvg = myAvgs.length ? (myAvgs.reduce((a,b)=>a+b,0)/myAvgs.length).toFixed(1) : null;
  const uname = currentProfile?.full_name?.split(' ')[0] || currentProfile?.username || 'Your';

  const reviewsHTML = (posts || []).slice(0,10).map(p => {
    const u = p.profiles || {};
    const avg = calcAvg(p.ratings);
    return `<div class="shop-card" style="cursor:pointer;" onclick="openPost('${p.id}')">
      <div class="shop-card-top">
        <div style="font-size:13px;font-weight:600;color:var(--text);">${escHtml(p.drink)}</div>
        <div style="font-size:12px;color:var(--tan);">${beansHTML(avg)} ${avg.toFixed(1)}</div>
      </div>
      <div class="shop-card-addr">by ${u.username || 'user'} ${p.price ? '· $'+p.price : ''}</div>
    </div>`;
  }).join('') || '<p style="font-size:13px;color:var(--tan);padding:12px 0;">No reviews yet. Be the first!</p>';

  document.getElementById('page-shop').innerHTML = `
    <div class="shop-detail-header">
      <h2>${shop.name}</h2>
      <p>${shop.neighborhood} · ${shop.address}</p>
      <div class="avg-global">${globalAvg ? beansHTML(parseFloat(globalAvg)) + ' ' + globalAvg : '☕ No ratings yet'}</div>
      ${myAvg ? `<div class="avg-user">${uname}'s average: ${beansHTML(parseFloat(myAvg))} ${myAvg}</div>` : `<div class="avg-user">${uname} hasn't reviewed here yet</div>`}
    </div>
    <div class="shop-actions">
      <button class="btn-secondary" onclick="openAddReviewForShop(${shopId})">☕ Add Review</button>
      <button class="btn-secondary" onclick="window.open('https://www.google.com/search?q=${encodeURIComponent(shop.name + ' Chattanooga TN')}','_blank')">🔍 Google</button>
    </div>
    <p class="shop-reviews-title">Recent Reviews</p>
    ${reviewsHTML}`;
  showPage('shop');
}

function openAddReviewForShop(shopId) {
  reviewDraft.shopId = shopId;
  showPage('add');
  renderReviewForm(shopId);
}

// ─── ADD REVIEW ─────────────────────────────────────────────────
function renderAddPage() {
  reviewDraft = { shopId: null, ratings: {}, notes: '', drink: '', price: '', photoFile: null, photoUrl: null };
  const el = document.getElementById('page-add');
  el.innerHTML = `
    <div id="add-search-view">
      <div class="search-bar-wrap">
        <span class="search-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></span>
        <input type="text" id="review-search" placeholder="Search coffee shops…" oninput="filterShops(this.value)" />
      </div>
      <p class="search-label">Popular in Chattanooga</p>
      <div class="search-results" id="search-results">
        ${SHOPS.slice(0,8).map(s => shopResultItem(s)).join('')}
      </div>
    </div>
    <div id="review-form-view" style="display:none;"></div>
    <div id="roast-result-view" style="display:none;"></div>`;
}

function filterShops(q) {
  const results = document.getElementById('search-results');
  const label = document.querySelector('.search-label');
  const filtered = q.trim() === '' ? SHOPS.slice(0,8) : SHOPS.filter(s => s.name.toLowerCase().includes(q.toLowerCase()) || s.neighborhood.toLowerCase().includes(q.toLowerCase()));
  label.textContent = q.trim() === '' ? 'Popular in Chattanooga' : `Results for "${q}"`;
  results.innerHTML = filtered.length ? filtered.map(s => shopResultItem(s)).join('') : '<p style="font-size:13px;color:var(--tan);padding:12px 0;">No shops found.</p>';
}

function shopResultItem(s) {
  return `<div class="search-result-item" onclick="selectShopForReview(${s.id})">
    <div class="sname">${s.name}</div>
    <div class="saddr">${s.neighborhood} · ${s.address.split(',')[0]}</div>
  </div>`;
}

function selectShopForReview(shopId) {
  reviewDraft.shopId = shopId;
  renderReviewForm(shopId);
}

function renderReviewForm(shopId) {
  const shop = SHOPS.find(s => s.id === shopId);
  const formView = document.getElementById('review-form-view');
  const searchView = document.getElementById('add-search-view');
  searchView.style.display = 'none';
  formView.style.display = 'block';
  formView.innerHTML = `
    <div class="review-form">
      <div>
        <div class="review-shop-name">${shop.name}</div>
        <p style="font-size:12px;color:var(--tan);">${shop.neighborhood}</p>
      </div>
      <div>
        <label style="font-size:13px;font-weight:600;color:var(--text);display:block;margin-bottom:6px;">What did you order? <span style="color:var(--burgundy);">*</span></label>
        <input type="text" id="r-drink" placeholder="e.g. Oat Milk Latte" required oninput="reviewDraft.drink=this.value" />
      </div>
      <div>
        <label style="font-size:13px;font-weight:600;color:var(--text);display:block;margin-bottom:6px;">Price <span style="color:var(--burgundy);">*</span></label>
        <input type="number" id="r-price" placeholder="e.g. 5.50" step="0.01" min="0" oninput="reviewDraft.price=this.value" />
      </div>
      ${RATING_CATS.map(cat => `
      <div class="rating-item">
        <label>${cat}</label>
        <div class="bean-picker" id="beans-${cat.replace(/\s/g,'-')}">
          ${[1,2,3,4,5].map(n => `<button type="button" class="bean-pick" data-cat="${cat}" data-val="${n}" onclick="setBean('${cat}',${n})">${BEAN}</button>`).join('')}
        </div>
      </div>`).join('')}
      <div>
        <label style="font-size:13px;font-weight:600;color:var(--text);display:block;margin-bottom:6px;">Notes (optional)</label>
        <textarea id="r-notes" placeholder="What did you think?" oninput="reviewDraft.notes=this.value"></textarea>
      </div>
      <div class="photo-upload" onclick="document.getElementById('photo-file').click()">
        <input type="file" id="photo-file" accept="image/*" onchange="handlePhotoSelect(event)" />
        <div id="photo-placeholder">📷 Add a photo of your order (optional)</div>
        <div class="photo-preview" id="photo-preview"></div>
      </div>
      <button class="btn-primary" onclick="submitReview()">ROAST IT</button>
    </div>`;
}

function setBean(cat, val) {
  reviewDraft.ratings[cat] = val;
  const containerId = 'beans-' + cat.replace(/\s/g,'-');
  const container = document.getElementById(containerId);
  container.querySelectorAll('.bean-pick').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.val) <= val);
  });
}

function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  reviewDraft.photoFile = file;
  const reader = new FileReader();
  reader.onload = ev => {
    reviewDraft.photoUrl = ev.target.result;
    document.getElementById('photo-preview').innerHTML = `<img src="${ev.target.result}" style="width:100%;border-radius:12px;" />`;
    document.getElementById('photo-placeholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

async function submitReview() {
  if (!reviewDraft.drink.trim()) { alert('Please enter what you ordered.'); return; }
  if (!reviewDraft.price) { alert('Please enter the price.'); return; }
  if (Object.keys(reviewDraft.ratings).length === 0) { alert('Please rate at least one category.'); return; }

  const btn = document.querySelector('.btn-primary');
  btn.textContent = 'Roasting…'; btn.disabled = true;

  let photoUrl = null;
  if (reviewDraft.photoFile) {
    const ext = reviewDraft.photoFile.name.split('.').pop();
    const path = `${currentUser.id}/${Date.now()}.${ext}`;
    const { data: upData, error: upErr } = await sb.storage.from('post-photos').upload(path, reviewDraft.photoFile);
    if (!upErr) {
      const { data: urlData } = sb.storage.from('post-photos').getPublicUrl(path);
      photoUrl = urlData.publicUrl;
    }
  }

  const avg = calcAvg(reviewDraft.ratings);
  const { data: post, error } = await sb.from('posts').insert({
    user_id: currentUser.id,
    shop_id: reviewDraft.shopId,
    drink: reviewDraft.drink,
    price: parseFloat(reviewDraft.price),
    ratings: reviewDraft.ratings,
    avg_rating: avg,
    notes: reviewDraft.notes,
    photo_url: photoUrl,
  }).select().single();

  if (error) { alert('Error posting: ' + error.message); btn.textContent = 'ROAST IT'; btn.disabled = false; return; }

  showRoastResult(post, avg);
}

function showRoastResult(post, avg) {
  const shop = SHOPS.find(s => s.id === post.shop_id);
  document.getElementById('review-form-view').style.display = 'none';
  const rv = document.getElementById('roast-result-view');
  rv.style.display = 'block';
  rv.innerHTML = `
    <div class="roast-result">
      <h2>Roasted! ☕</h2>
      ${post.photo_url ? `<img class="roast-img" src="${post.photo_url}" />` : ''}
      <div class="roast-drink">${escHtml(post.drink)}</div>
      <div style="font-size:13px;color:var(--tan);">@ ${shop?.name}</div>
      <div class="roast-score">${beansHTML(avg)}</div>
      <div class="roast-score-label" onclick="openRatingModal(${JSON.stringify(post.ratings).replace(/"/g,'&quot;')})">${avg.toFixed(1)} / 5 · tap to see breakdown</div>
      <button class="btn-primary" style="margin-top:12px;" onclick="shareToFeed('${post.id}')">SHARE TO FEED</button>
      <button class="btn-secondary" style="margin-top:8px;" onclick="showPage('feed')">Back to Circles</button>
    </div>`;
}

async function shareToFeed(postId) {
  await sb.from('posts').update({ shared: true }).eq('id', postId);
  showPage('feed');
}

// ─── PROFILE ───────────────────────────────────────────────────
async function renderProfile(userId) {
  const el = document.getElementById('page-profile');
  el.innerHTML = '<div class="empty-state"><div class="empty-icon">☕</div><p>Loading profile…</p></div>';

  const { data: profile } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (!profile) return;

  const { data: posts } = await sb.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  const { count: followersCount } = await sb.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId);
  const { count: followingCount } = await sb.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId);

  const shopCount = new Set((posts || []).map(p => p.shop_id)).size;
  const allDrinks = (posts || []).filter(p => p.drink && p.avg_rating);
  const favDrink = allDrinks.sort((a,b) => b.avg_rating - a.avg_rating)[0];

  const initial = (profile.username || profile.full_name || 'U')[0].toUpperCase();
  const avatarEl = profile.avatar_url
    ? `<div class="profile-avatar"><img src="${profile.avatar_url}" /></div>`
    : `<div class="profile-avatar">${initial}</div>`;

  const postsGrid = (posts || []).map(p => {
    const inner = p.photo_url
      ? `<img src="${p.photo_url}" style="width:100%;height:100%;object-fit:cover;" />`
      : `<div class="profile-post-no-img"><span>${escHtml(p.drink || '')}</span></div>`;
    return `<div class="profile-post-circle" onclick="openPost('${p.id}')">${inner}</div>`;
  }).join('');

  el.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar-wrap">${avatarEl}</div>
      <div class="profile-info">
        <div class="profile-name">${profile.full_name || profile.username}</div>
        <div class="profile-username">@${profile.username}</div>
        <div class="profile-stats">
          <div class="profile-stat"><div class="num">${shopCount}</div><div class="lbl">Shops</div></div>
          <div class="profile-stat" onclick="openFollowModal('followers','${userId}')"><div class="num">${followersCount || 0}</div><div class="lbl">Followers</div></div>
          <div class="profile-stat" onclick="openFollowModal('following','${userId}')"><div class="num">${followingCount || 0}</div><div class="lbl">Following</div></div>
        </div>
      </div>
    </div>
    ${favDrink ? `<div class="profile-fav"><div class="fav-label">Favorite Order</div><div class="fav-drink">${escHtml(favDrink.drink)}</div></div>` : ''}
    <button class="edit-profile-btn" onclick="openEditProfile()">Edit Profile</button>
    <p class="section-title">${(posts||[]).length} roasts</p>
    <div class="profile-posts-grid">${postsGrid || '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">☕</div><p>No reviews yet.</p></div>'}</div>`;
}

async function openUserProfile(userId) {
  if (userId === currentUser.id) { showPage('profile'); return; }
  const el = document.getElementById('page-user');
  el.innerHTML = '<div class="empty-state"><div class="empty-icon">☕</div><p>Loading…</p></div>';
  showPage('user');

  const { data: profile } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (!profile) return;
  const { data: posts } = await sb.from('posts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  const { count: followersCount } = await sb.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId);
  const { count: followingCount } = await sb.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
  const { data: existingFollow } = await sb.from('follows').select('id').eq('follower_id', currentUser.id).eq('following_id', userId).maybeSingle();
  const isFollowing = !!existingFollow;
  const shopCount = new Set((posts || []).map(p => p.shop_id)).size;
  const allDrinks = (posts || []).filter(p => p.drink && p.avg_rating);
  const favDrink = allDrinks.sort((a,b) => b.avg_rating - a.avg_rating)[0];
  const initial = (profile.username || 'U')[0].toUpperCase();
  const avatarEl = profile.avatar_url ? `<div class="profile-avatar"><img src="${profile.avatar_url}" /></div>` : `<div class="profile-avatar">${initial}</div>`;

  const postsGrid = (posts || []).map(p => {
    const inner = p.photo_url ? `<img src="${p.photo_url}" style="width:100%;height:100%;object-fit:cover;" />` : `<div class="profile-post-no-img"><span>${escHtml(p.drink || '')}</span></div>`;
    return `<div class="profile-post-circle" onclick="openPost('${p.id}')">${inner}</div>`;
  }).join('');

  el.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar-wrap">${avatarEl}</div>
      <div class="profile-info">
        <div class="profile-name">${profile.full_name || profile.username}</div>
        <div class="profile-username">@${profile.username}</div>
        <div class="profile-stats">
          <div class="profile-stat"><div class="num">${shopCount}</div><div class="lbl">Shops</div></div>
          <div class="profile-stat" onclick="openFollowModal('followers','${userId}')"><div class="num">${followersCount || 0}</div><div class="lbl">Followers</div></div>
          <div class="profile-stat" onclick="openFollowModal('following','${userId}')"><div class="num">${followingCount || 0}</div><div class="lbl">Following</div></div>
        </div>
      </div>
    </div>
    ${favDrink ? `<div class="profile-fav"><div class="fav-label">Favorite Order</div><div class="fav-drink">${escHtml(favDrink.drink)}</div></div>` : ''}
    <button class="follow-btn ${isFollowing ? 'following' : ''}" id="follow-btn-${userId}" onclick="toggleFollow('${userId}', ${isFollowing})">${isFollowing ? 'Following' : 'Follow'}</button>
    <p class="section-title">${(posts||[]).length} roasts</p>
    <div class="profile-posts-grid">${postsGrid || '<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">☕</div><p>No reviews yet.</p></div>'}</div>`;
}

async function toggleFollow(userId, currentlyFollowing) {
  const btn = document.getElementById('follow-btn-' + userId);
  if (currentlyFollowing) {
    await sb.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', userId);
    btn.textContent = 'Follow'; btn.classList.remove('following');
    btn.setAttribute('onclick', `toggleFollow('${userId}', false)`);
  } else {
    await sb.from('follows').insert({ follower_id: currentUser.id, following_id: userId });
    btn.textContent = 'Following'; btn.classList.add('following');
    btn.setAttribute('onclick', `toggleFollow('${userId}', true)`);
  }
}

async function openFollowModal(type, userId) {
  const modal = document.getElementById('follow-modal');
  const title = document.getElementById('follow-modal-title');
  const list  = document.getElementById('follow-modal-list');
  title.textContent = type === 'followers' ? 'Followers' : 'Following';
  list.innerHTML = '<p style="color:var(--tan);font-size:13px;padding:12px 0;">Loading…</p>';
  modal.style.display = 'flex';

  let query;
  if (type === 'followers') {
    query = sb.from('follows').select('follower_id, profiles!follows_follower_id_fkey(username, full_name, avatar_url)').eq('following_id', userId);
  } else {
    query = sb.from('follows').select('following_id, profiles!follows_following_id_fkey(username, full_name, avatar_url)').eq('follower_id', userId);
  }
  const { data } = await query;
  if (!data || !data.length) { list.innerHTML = '<p style="color:var(--tan);font-size:13px;padding:12px 0;">None yet.</p>'; return; }

  list.innerHTML = data.map(row => {
    const p = row.profiles;
    const uid = type === 'followers' ? row.follower_id : row.following_id;
    const initial = (p?.username || 'U')[0].toUpperCase();
    const av = p?.avatar_url ? `<img src="${p.avatar_url}" style="width:100%;height:100%;object-fit:cover;" />` : initial;
    return `<div class="comment-item" style="cursor:pointer;padding:8px 0;" onclick="document.getElementById('follow-modal').style.display='none';openUserProfile('${uid}')">
      <div class="comment-avatar">${av}</div>
      <div class="comment-body">
        <div class="comment-user">${p?.username || 'user'}</div>
        <div class="comment-text">${p?.full_name || ''}</div>
      </div>
    </div>`;
  }).join('');
}

function closeFollowModal(e) {
  if (e.target === document.getElementById('follow-modal')) document.getElementById('follow-modal').style.display = 'none';
}

function openEditProfile() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'edit-modal';
  modal.style.display = 'flex';
  modal.innerHTML = `<div class="modal-sheet">
    <h3>Edit Profile</h3>
    <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px;">
      <input type="text" id="edit-name" placeholder="Full Name" value="${escHtml(currentProfile?.full_name || '')}" style="padding:12px;border:1.5px solid rgba(92,46,0,0.2);border-radius:10px;font-family:DM Sans,sans-serif;font-size:14px;background:rgba(255,255,255,0.5);color:var(--text);outline:none;" />
      <input type="text" id="edit-username" placeholder="Username" value="${escHtml(currentProfile?.username || '')}" style="padding:12px;border:1.5px solid rgba(92,46,0,0.2);border-radius:10px;font-family:DM Sans,sans-serif;font-size:14px;background:rgba(255,255,255,0.5);color:var(--text);outline:none;" />
      <label style="font-size:13px;color:var(--tan);">Profile Picture</label>
      <input type="file" id="edit-avatar" accept="image/*" style="font-size:13px;" />
    </div>
    <button class="modal-close" onclick="saveProfile()" style="margin-top:16px;">Save Changes</button>
    <button class="btn-secondary" style="margin-top:8px;width:100%;padding:12px;border-radius:10px;" onclick="document.getElementById('edit-modal').remove()">Cancel</button>
  </div>`;
  document.body.appendChild(modal);
}

async function saveProfile() {
  const name = document.getElementById('edit-name').value.trim();
  const username = document.getElementById('edit-username').value.trim().toLowerCase().replace(/\s+/g,'_');
  const avatarFile = document.getElementById('edit-avatar').files[0];
  let avatarUrl = currentProfile?.avatar_url || null;

  if (avatarFile) {
    const ext = avatarFile.name.split('.').pop();
    const path = `avatars/${currentUser.id}.${ext}`;
    const { data, error } = await sb.storage.from('post-photos').upload(path, avatarFile, { upsert: true });
    if (!error) {
      const { data: urlData } = sb.storage.from('post-photos').getPublicUrl(path);
      avatarUrl = urlData.publicUrl;
    }
  }

  await sb.from('profiles').update({ full_name: name, username, avatar_url: avatarUrl }).eq('id', currentUser.id);
  currentProfile = { ...currentProfile, full_name: name, username, avatar_url: avatarUrl };
  updateNavAvatar();
  document.getElementById('edit-modal')?.remove();
  renderProfile(currentUser.id);
}

// ─── HELPERS ───────────────────────────────────────────────────
function calcAvg(ratings) {
  if (!ratings || typeof ratings !== 'object') return 0;
  const vals = Object.values(ratings).filter(v => v > 0);
  if (!vals.length) return 0;
  return vals.reduce((a,b) => a + b, 0) / vals.length;
}

function beansHTML(avg) {
  const full = Math.round(avg);
  return [1,2,3,4,5].map(i => `<span class="bean" style="opacity:${i<=full?'1':'0.2'}">${BEAN}</span>`).join('');
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
