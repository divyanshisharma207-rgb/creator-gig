/* ============================================================
   CREATORLY — App.js
   SPA with hash router · localStorage persistence
   ============================================================ */

"use strict";

/* ── Constants ──────────────────────────────────────────────── */
const CATEGORIES = ["Design", "Music", "Video", "Writing", "Photography", "Code", "Other"];
const CAT_EMOJI  = { Design:"🎨", Music:"🎵", Video:"🎬", Writing:"✍️", Photography:"📸", Code:"💻", Other:"✨" };

const AVATAR_COLORS = [
  ["#7c3aed","#5b21b6"], ["#ec4899","#be185d"], ["#06b6d4","#0e7490"],
  ["#22c55e","#15803d"], ["#f59e0b","#b45309"], ["#ef4444","#b91c1c"],
  ["#6366f1","#4338ca"], ["#14b8a6","#0f766e"]
];

/* ── State ──────────────────────────────────────────────────── */
const State = {
  role: "client",          // "client" | "creator"
  clientEmail: "",         // used to group "my bookings"
  clientName:  "",
  creatorName: "",
  currentGigId: null,
  filterCategory: "All",
  searchQuery: "",
  sortOrder: "newest",
  dashTab: "all",
  bookingsTab: "all",
};

/* ── Storage helpers ────────────────────────────────────────── */
const Store = {
  get: (key, fallback = []) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  getGigs:     () => Store.get("cly_gigs", []),
  setGigs:     (v) => Store.set("cly_gigs", v),
  getBookings: () => Store.get("cly_bookings", []),
  setBookings: (v) => Store.set("cly_bookings", v),
  getMeta:     () => Store.get("cly_meta", {}),
  setMeta:     (v) => Store.set("cly_meta", v),
};

/* ── ID / util helpers ──────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const escHtml = (s = "") => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const fmt = (d) => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const avatarColor = (name = "") => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const avatarInitials = (name = "") => name.trim().split(" ").map(w=>w[0]||"").slice(0,2).join("").toUpperCase() || "?";
const avatarStyle = (name) => {
  const [a,b] = avatarColor(name);
  return `background:linear-gradient(135deg,${a},${b});`;
};
const catClass = (cat = "") => "cat-" + cat.toLowerCase();
const bannerClass = (cat = "") => "banner-" + cat.toLowerCase();

/* ── Seed Data ──────────────────────────────────────────────── */
function seedIfEmpty() {
  if (Store.getGigs().length > 0) return;
  const seeds = [
    {
      id: uid(), createdAt: Date.now() - 5 * 86400000,
      creatorName: "Aria Patel", creatorId: "aria@creatorly.io",
      title: "I'll design a stunning brand identity for your startup",
      category: "Design", rate: 120, rateType: "fixed",
      description: "Get a complete brand kit: logo, color palette, typography, and brand guidelines. I specialize in modern, minimalist aesthetics that help emerging startups stand out. Delivered as editable source files (Figma + SVG/PNG exports).",
      tags: ["Logo","Branding","Figma","Startups"],
    },
    {
      id: uid(), createdAt: Date.now() - 4 * 86400000,
      creatorName: "Marcus Webb", creatorId: "marcus@creatorly.io",
      title: "Custom music production & beats for your content",
      category: "Music", rate: 80, rateType: "fixed",
      description: "Original, royalty-free music tailored to your brand's vibe — lo-fi, cinematic, hip-hop, or electronic. Perfect for YouTube, podcasts, ads, and reels. Stems included. Turnaround in 3 days.",
      tags: ["Beats","Royalty-free","Electronic","Hip-hop"],
    },
    {
      id: uid(), createdAt: Date.now() - 3 * 86400000,
      creatorName: "Zoe Chen", creatorId: "zoe@creatorly.io",
      title: "Professional video editing for YouTube & social media",
      category: "Video", rate: 45, rateType: "hourly",
      description: "Cinematic edits with motion graphics, color grading, subtitles, and sound design. I've edited for channels with 500k+ subscribers. Tell me your style and I'll bring your vision to life. Premiere Pro & DaVinci Resolve.",
      tags: ["YouTube","Reels","Color grading","Motion graphics"],
    },
    {
      id: uid(), createdAt: Date.now() - 2 * 86400000,
      creatorName: "Dev Sharma", creatorId: "dev@creatorly.io",
      title: "Full-stack web app development with React & Node",
      category: "Code", rate: 65, rateType: "hourly",
      description: "Building fast, scalable web applications from scratch. REST APIs, databases, authentication, deployment. I'll architect your project right the first time. Free 30-min consultation included.",
      tags: ["React","Node.js","TypeScript","PostgreSQL"],
    },
    {
      id: uid(), createdAt: Date.now() - 1 * 86400000,
      creatorName: "Lena Moreau", creatorId: "lena@creatorly.io",
      title: "Lifestyle & product photography that converts",
      category: "Photography", rate: 200, rateType: "fixed",
      description: "High-end product and lifestyle photography for e-commerce, ads, and social. Studio or location shoots available. Edited gallery delivered within 48 hours. Proven to increase CTR and conversion rates.",
      tags: ["Product","E-commerce","Lifestyle","Studio"],
    },
    {
      id: uid(), createdAt: Date.now() - 3600000,
      creatorName: "James Okafor", creatorId: "james@creatorly.io",
      title: "SEO-optimized blog posts & long-form content writing",
      category: "Writing", rate: 35, rateType: "hourly",
      description: "Engaging, well-researched articles that rank. I write in your brand voice and back every claim with data. Niches: tech, finance, health, SaaS. Full keyword research included. Plagiarism report on delivery.",
      tags: ["SEO","Blog","Tech","Finance"],
    },
  ];
  Store.setGigs(seeds);
}

/* ── Router ─────────────────────────────────────────────────── */
const Router = {
  routes: {
    "marketplace": renderMarketplace,
    "post-gig":    renderPostGig,
    "gig":         renderGigDetail,
    "creator-dashboard": renderCreatorDashboard,
    "my-bookings": renderMyBookings,
  },
  init() {
    window.addEventListener("hashchange", () => this.resolve());
    this.resolve();
  },
  resolve() {
    const hash = location.hash.replace("#","") || "marketplace";
    const [page, ...params] = hash.split("/");
    const fn = this.routes[page];
    if (fn) fn(...params);
    else renderMarketplace();
    updateNav(page);
    updateDashboardBadge();
    window.scrollTo({top: 0, behavior: "smooth"});
  },
  go(path) { location.hash = path; },
};

/* ── Nav ────────────────────────────────────────────────────── */
function updateNav(activePage) {
  document.querySelectorAll(".nav-link").forEach(l => {
    l.classList.toggle("active", l.dataset.page === activePage || (activePage === "gig" && l.dataset.page === "marketplace"));
  });
}

function updateDashboardBadge() {
  const badge = document.getElementById("dashboard-badge");
  if (!badge) return;
  const name = getCreatorName();
  if (!name) { badge.style.display = "none"; return; }
  const count = Store.getBookings().filter(b => b.creatorId === name && b.status === "pending").length;
  if (count > 0) { badge.textContent = count; badge.style.display = "inline-flex"; }
  else badge.style.display = "none";
}

/* ── Role management ────────────────────────────────────────── */
const App = {
  setRole(role) {
    State.role = role;
    document.getElementById("role-client").classList.toggle("active", role === "client");
    document.getElementById("role-creator").classList.toggle("active", role === "creator");
    // Persist
    const meta = Store.getMeta();
    meta.role = role;
    Store.setMeta(meta);
    toast(role === "creator" ? "Switched to Creator mode 🎨" : "Switched to Client mode 👤", "info");
  },

  openModal(html) {
    document.getElementById("modal-content").innerHTML = html;
    document.getElementById("modal-overlay").style.display = "flex";
  },
  closeModal() {
    const overlay = document.getElementById("modal-overlay");
    overlay.style.display = "none";
  },
  init() {
    const meta = Store.getMeta();
    if (meta.role) State.role = meta.role;
    if (meta.clientEmail) State.clientEmail = meta.clientEmail;
    if (meta.clientName)  State.clientName  = meta.clientName;
    if (meta.creatorName) State.creatorName = meta.creatorName;
    document.getElementById("role-client").classList.toggle("active", State.role === "client");
    document.getElementById("role-creator").classList.toggle("active", State.role === "creator");
    seedIfEmpty();
    Router.init();
  }
};

function getCreatorName() {
  const meta = Store.getMeta();
  return meta.creatorName || "";
}
function getClientEmail() {
  const meta = Store.getMeta();
  return meta.clientEmail || "";
}

/* ── Toast ──────────────────────────────────────────────────── */
function toast(msg, type = "success") {
  const icons = { success:"✅", error:"❌", info:"💡" };
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]||"💡"}</span><span>${escHtml(msg)}</span>`;
  const container = document.getElementById("toast-container");
  container.appendChild(el);
  setTimeout(() => { el.classList.add("toast-out"); setTimeout(()=>el.remove(), 300); }, 3500);
}

/* ── Confetti ───────────────────────────────────────────────── */
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  canvas.style.display = "block";
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 6 + 3,
    d: Math.random() * 120 + 60,
    color: ["#7c3aed","#06b6d4","#ec4899","#f59e0b","#22c55e","#f1f0ff"][Math.floor(Math.random()*6)],
    tilt: Math.random() * 20 - 10,
    tiltSpeed: (Math.random() - 0.5) * 0.1,
    vy: Math.random() * 3 + 2,
    vx: (Math.random() - 0.5) * 2,
  }));
  let frame = 0;
  const maxFrames = 140;
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, p.tilt, 0, Math.PI*2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame/maxFrames * 1.5);
      ctx.fill();
      p.y += p.vy; p.x += p.vx; p.tilt += p.tiltSpeed;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random()*canvas.width; }
    });
    frame++;
    if (frame < maxFrames) requestAnimationFrame(draw);
    else { ctx.clearRect(0,0,canvas.width,canvas.height); canvas.style.display="none"; }
  }
  draw();
}

/* ── Page: MARKETPLACE ──────────────────────────────────────── */
function renderMarketplace() {
  State.filterCategory = "All";
  State.searchQuery = "";
  State.sortOrder = "newest";
  document.getElementById("app-root").innerHTML = `
    <div class="page">
      <div class="container">
        <section class="hero-section">
          <div class="hero-badge">⚡ 100+ Creators · Growing daily</div>
          <h1 class="hero-title">Find <span class="gradient-text">world-class</span><br>creative talent</h1>
          <p class="hero-sub">Book designers, musicians, videographers, writers & developers. Pay only for what you love.</p>
          <div class="hero-cta">
            <button class="btn btn-primary btn-lg" onclick="document.getElementById('mkt-search').focus()">
              🔍 Explore Gigs
            </button>
            <a href="#post-gig" class="btn btn-secondary btn-lg">Post Your Gig ↗</a>
          </div>
          <div class="hero-stats">
            <div class="hero-stat"><div class="hero-stat-num gradient-text" id="stat-gigs">0</div><div class="hero-stat-label">Active Gigs</div></div>
            <div class="hero-stat"><div class="hero-stat-num gradient-text" id="stat-bookings">0</div><div class="hero-stat-label">Bookings Made</div></div>
            <div class="hero-stat"><div class="hero-stat-num gradient-text">7</div><div class="hero-stat-label">Categories</div></div>
          </div>
        </section>

        <div class="marketplace-controls">
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input id="mkt-search" class="search-input" type="text" placeholder="Search gigs, creators, skills…"
              oninput="State.searchQuery=this.value; renderGigGrid()" autocomplete="off"/>
          </div>
          <select id="mkt-sort" class="sort-select" onchange="State.sortOrder=this.value; renderGigGrid()">
            <option value="newest">✨ Newest</option>
            <option value="price-asc">💸 Price: Low → High</option>
            <option value="price-desc">💎 Price: High → Low</option>
          </select>
        </div>

        <div class="chip-row" id="cat-chips" style="margin-bottom:24px">
          ${["All",...CATEGORIES].map(c=>`
            <button class="chip ${c==="All"?"active":""}" onclick="App.filterCat('${c}')" id="chip-${c}">${CAT_EMOJI[c]||"🌐"} ${c}</button>
          `).join("")}
        </div>

        <div id="gig-grid-wrap"></div>
      </div>

      <!-- ABOUT US SECTION -->
      <section class="about-section">
        <div class="container">

          <div class="about-eyebrow">
            <span class="about-eyebrow-pill">🌍 About Creatorly</span>
          </div>

          <div class="about-header">
            <div class="about-header-left">
              <h2>Built for the <span class="gradient-text">creator generation</span></h2>
              <p class="about-lead">Creatorly is the marketplace that closes the gap between raw creative talent and the clients who need it most — fast, fair, and friction-free.</p>
              <div class="about-cta-row">
                <a href="#post-gig" class="btn btn-primary">Start Earning ↗</a>
                <a href="#marketplace" class="btn btn-secondary">Browse Talent</a>
              </div>
            </div>
            <div class="about-header-right">
              <div class="about-pull-quote">
                <div class="about-quote-mark">"</div>
                <p>We believe every young creator deserves a platform that takes their work as seriously as they do.</p>
                <div class="about-quote-author">
                  <div class="about-quote-avatar" style="background:linear-gradient(135deg,#4f46e5,#f43f5e)">CR</div>
                  <div>
                    <div class="about-quote-name">The Creatorly Team</div>
                    <div class="about-quote-role">Founders &amp; Creators</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="about-values">
            <div class="about-value-card">
              <div class="about-value-icon" style="background:linear-gradient(135deg,rgba(79,70,229,0.12),rgba(79,70,229,0.04));color:#4f46e5">⚡</div>
              <h4>Creator-first</h4>
              <p>Every product decision starts with: does this help the creator? Zero hidden fees, zero fine print. You keep 90% of every booking.</p>
            </div>
            <div class="about-value-card">
              <div class="about-value-icon" style="background:linear-gradient(135deg,rgba(244,63,94,0.12),rgba(244,63,94,0.04));color:#f43f5e">🤝</div>
              <h4>Trust by design</h4>
              <p>Clients only pay after they're happy. Creators see booking intent upfront. Disputes are rare — and handled fast.</p>
            </div>
            <div class="about-value-card">
              <div class="about-value-icon" style="background:linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.04));color:#059669">🌱</div>
              <h4>Growing together</h4>
              <p>From your first gig to a full-time creative career, Creatorly scales with you. Reviews, portfolio, analytics — all coming soon.</p>
            </div>
            <div class="about-value-card">
              <div class="about-value-icon" style="background:linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.04));color:#d97706">🎯</div>
              <h4>Radical simplicity</h4>
              <p>Post a gig in 2 minutes. Book a creator in 3. No bloated dashboards, no CV uploads — just talent meeting opportunity.</p>
            </div>
          </div>

          <div class="about-timeline-wrap">
            <div class="about-timeline-label">Our story so far</div>
            <div class="about-timeline">
              <div class="about-tl-item">
                <div class="about-tl-dot" style="background:var(--indigo)"></div>
                <div class="about-tl-year">2023</div>
                <div class="about-tl-text">Creatorly founded by two freelancers tired of 30% platform cuts and slow payouts.</div>
              </div>
              <div class="about-tl-connector"></div>
              <div class="about-tl-item">
                <div class="about-tl-dot" style="background:#7c3aed"></div>
                <div class="about-tl-year">2024</div>
                <div class="about-tl-text">Public beta launched. 500 creators onboarded in the first week across 7 categories.</div>
              </div>
              <div class="about-tl-connector"></div>
              <div class="about-tl-item">
                <div class="about-tl-dot" style="background:var(--rose)"></div>
                <div class="about-tl-year">2025</div>
                <div class="about-tl-text">$2M in creator earnings paid out. Mobile app in development. Series A underway.</div>
              </div>
              <div class="about-tl-connector"></div>
              <div class="about-tl-item">
                <div class="about-tl-dot" style="background:linear-gradient(135deg,var(--indigo),var(--rose))"></div>
                <div class="about-tl-year">Today</div>
                <div class="about-tl-text">Building the most creator-friendly gig platform on the planet. You're early — and that's everything.</div>
              </div>
            </div>
          </div>

          <div class="about-bottom-cta">
            <div class="about-bottom-cta-text">
              <h2>Ready to turn your <span class="gradient-text">skill into income?</span></h2>
              <p>Join thousands of creators already earning on Creatorly.</p>
            </div>
            <div class="about-bottom-cta-actions">
              <a href="#post-gig" class="btn btn-primary btn-lg">Post Your First Gig ⚡</a>
              <a href="#marketplace" class="btn btn-ghost btn-lg">Browse Marketplace</a>
            </div>
          </div>

        </div>
      </section>
    </div>`;

  // Stats
  document.getElementById("stat-gigs").textContent     = Store.getGigs().length;
  document.getElementById("stat-bookings").textContent = Store.getBookings().length;

  App.filterCat = (cat) => {
    State.filterCategory = cat;
    document.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c.id === `chip-${cat}`));
    renderGigGrid();
  };
  renderGigGrid();
}

function renderGigGrid() {
  let gigs = Store.getGigs();

  // Filter by category
  if (State.filterCategory !== "All") {
    gigs = gigs.filter(g => g.category === State.filterCategory);
  }

  // Filter by search
  if (State.searchQuery.trim()) {
    const q = State.searchQuery.toLowerCase();
    gigs = gigs.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.creatorName.toLowerCase().includes(q) ||
      (g.tags||[]).some(t=>t.toLowerCase().includes(q))
    );
  }

  // Sort (DP3: newest default, user-switchable)
  if (State.sortOrder === "newest")    gigs.sort((a,b) => b.createdAt - a.createdAt);
  if (State.sortOrder === "price-asc") gigs.sort((a,b) => a.rate - b.rate);
  if (State.sortOrder === "price-desc")gigs.sort((a,b) => b.rate - a.rate);

  const wrap = document.getElementById("gig-grid-wrap");
  if (!wrap) return;

  if (gigs.length === 0) {
    wrap.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🔭</div>
      <h3>No gigs found</h3>
      <p>Try a different search or category</p>
      <button class="btn btn-primary" style="margin-top:8px" onclick="location.hash='post-gig'">Post the first one ⚡</button>
    </div>`;
    return;
  }

  wrap.innerHTML = `<div class="gig-grid">${gigs.map(gigCard).join("")}</div>`;
}

function gigCard(g) {
  const [c1,c2] = avatarColor(g.creatorName);
  return `
  <div class="gig-card" onclick="location.hash='gig/${g.id}'">
    <div class="gig-card-banner ${bannerClass(g.category)}">
      <div class="banner-emoji">${CAT_EMOJI[g.category]||"✨"}</div>
    </div>
    <div class="gig-card-body">
      <div class="gig-card-meta">
        <span class="cat-tag ${catClass(g.category)}">${CAT_EMOJI[g.category]} ${escHtml(g.category)}</span>
        <span style="font-size:0.75rem;color:var(--text-muted)">${fmt(g.createdAt)}</span>
      </div>
      <div class="gig-card-title">${escHtml(g.title)}</div>
      <div class="gig-card-desc">${escHtml(g.description)}</div>
      <div class="gig-card-footer">
        <div class="gig-rate">$${g.rate} <span>${g.rateType==="hourly"?"/hr":"fixed"}</span></div>
        <div class="creator-row">
          <div class="creator-avatar" style="background:linear-gradient(135deg,${c1},${c2})">${avatarInitials(g.creatorName)}</div>
          <span style="font-size:0.8rem;color:var(--text-secondary);font-weight:500">${escHtml(g.creatorName)}</span>
        </div>
      </div>
    </div>
  </div>`;
}

/* ── Page: POST GIG ─────────────────────────────────────────── */
function renderPostGig() {
  const meta = Store.getMeta();
  const savedCreator = meta.creatorName || "";

  document.getElementById("app-root").innerHTML = `
    <div class="page">
      <div class="container">
        <div class="post-gig-layout">
          <div class="post-gig-header">
            <div class="hero-badge" style="margin-bottom:16px">🚀 Share your talent with the world</div>
            <h1>Post a <span class="gradient-text">Gig</span></h1>
            <p style="margin-top:12px">List your service in under 2 minutes. Clients are waiting.</p>
          </div>

          <div class="form-card">
            <form id="post-gig-form" novalidate>
              <div class="form-group" id="fg-creatorName">
                <label class="form-label" for="pg-creator">Your Name <span class="required">*</span></label>
                <input id="pg-creator" class="form-input" type="text" placeholder="e.g. Alex Rivera"
                  value="${escHtml(savedCreator)}" maxlength="60" />
                <div class="form-error">Please enter your name.</div>
              </div>

              <div class="form-group" id="fg-title">
                <label class="form-label" for="pg-title">Gig Title <span class="required">*</span></label>
                <input id="pg-title" class="form-input" type="text"
                  placeholder="e.g. I'll design a stunning logo for your brand"
                  maxlength="100" oninput="updateTitleCounter(this)"/>
                <div class="form-hint"><span id="title-count">0</span>/100 characters</div>
                <div class="form-error">Please enter a gig title (min 10 characters).</div>
              </div>

              <div class="form-row">
                <div class="form-group" id="fg-category">
                  <label class="form-label" for="pg-cat">Category <span class="required">*</span></label>
                  <select id="pg-cat" class="form-select">
                    <option value="">— Select category —</option>
                    ${CATEGORIES.map(c=>`<option value="${c}">${CAT_EMOJI[c]} ${c}</option>`).join("")}
                  </select>
                  <div class="form-error">Please select a category.</div>
                </div>
                <div class="form-group" id="fg-rateType">
                  <label class="form-label" for="pg-rtype">Rate Type <span class="required">*</span></label>
                  <select id="pg-rtype" class="form-select">
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
              </div>

              <div class="form-group" id="fg-rate">
                <label class="form-label" for="pg-rate">Rate (USD) <span class="required">*</span></label>
                <input id="pg-rate" class="form-input" type="number" placeholder="e.g. 80" min="1" max="10000" />
                <div class="form-hint">Set a competitive rate. You can always adjust later.</div>
                <div class="form-error">Please enter a valid rate ($1–$10,000).</div>
              </div>

              <div class="form-group" id="fg-description">
                <label class="form-label" for="pg-desc">Description <span class="required">*</span></label>
                <textarea id="pg-desc" class="form-textarea" rows="5"
                  placeholder="Describe your service, deliverables, process, and what makes you unique…"
                  maxlength="1000" oninput="updateDescCounter(this)"></textarea>
                <div class="form-hint"><span id="desc-count">0</span>/1000 characters</div>
                <div class="form-error">Please enter a description (min 30 characters).</div>
              </div>

              <div class="form-group">
                <label class="form-label" for="pg-tags">Tags <span style="font-weight:400;color:var(--text-muted)">(optional)</span></label>
                <input id="pg-tags" class="form-input" type="text"
                  placeholder="e.g. Logo, Figma, Branding (comma-separated)" maxlength="100"/>
                <div class="form-hint">Help clients find your gig faster.</div>
              </div>

              <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top:8px">
                ⚡ Publish Gig
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>`;

  window.updateTitleCounter = (el) => { document.getElementById("title-count").textContent = el.value.length; };
  window.updateDescCounter  = (el) => { document.getElementById("desc-count").textContent  = el.value.length; };

  document.getElementById("post-gig-form").addEventListener("submit", submitPostGig);
}

function submitPostGig(e) {
  e.preventDefault();
  const creator = document.getElementById("pg-creator").value.trim();
  const title   = document.getElementById("pg-title").value.trim();
  const cat     = document.getElementById("pg-cat").value;
  const rtype   = document.getElementById("pg-rtype").value;
  const rate    = parseFloat(document.getElementById("pg-rate").value);
  const desc    = document.getElementById("pg-desc").value.trim();
  const tags    = document.getElementById("pg-tags").value.split(",").map(t=>t.trim()).filter(Boolean);

  let valid = true;
  const validate = (fgId, condition) => {
    const fg = document.getElementById(fgId);
    fg.classList.toggle("error", !condition);
    if (!condition) valid = false;
  };
  validate("fg-creatorName", creator.length >= 2);
  validate("fg-title",       title.length >= 10);
  validate("fg-category",    !!cat);
  validate("fg-rate",        !isNaN(rate) && rate >= 1 && rate <= 10000);
  validate("fg-description", desc.length >= 30);

  if (!valid) { toast("Please fix the errors above.", "error"); return; }

  // Save creator name
  const meta = Store.getMeta();
  meta.creatorName = creator;
  Store.setMeta(meta);

  const gig = { id: uid(), createdAt: Date.now(), creatorName: creator, creatorId: creator, title, category: cat, rate, rateType: rtype, description: desc, tags };
  const gigs = Store.getGigs();
  gigs.unshift(gig);
  Store.setGigs(gigs);

  toast("Your gig is live! 🎉", "success");
  Router.go("marketplace");
}

/* ── Page: GIG DETAIL ───────────────────────────────────────── */
function renderGigDetail(gigId) {
  const gig = Store.getGigs().find(g => g.id === gigId);
  if (!gig) { Router.go("marketplace"); return; }
  State.currentGigId = gigId;

  const meta = Store.getMeta();
  const savedClient = meta.clientName  || "";
  const savedEmail  = meta.clientEmail || "";

  const [c1,c2] = avatarColor(gig.creatorName);

  document.getElementById("app-root").innerHTML = `
    <div class="page">
      <div class="container">
        <button class="back-btn" onclick="history.back()">← Back to marketplace</button>
        <div class="detail-layout">
          <!-- LEFT: Gig Info -->
          <div>
            <div class="detail-banner ${bannerClass(gig.category)}">
              <div class="banner-emoji" style="font-size:5rem">${CAT_EMOJI[gig.category]||"✨"}</div>
            </div>
            <div class="detail-header">
              <span class="cat-tag ${catClass(gig.category)}">${CAT_EMOJI[gig.category]} ${escHtml(gig.category)}</span>
              <h1 class="detail-title" style="margin-top:12px">${escHtml(gig.title)}</h1>
              <div class="detail-creator">
                <div class="detail-creator-avatar" style="background:linear-gradient(135deg,${c1},${c2})">${avatarInitials(gig.creatorName)}</div>
                <div>
                  <div style="font-weight:700">${escHtml(gig.creatorName)}</div>
                  <div style="font-size:0.78rem;color:var(--text-muted)">Posted ${fmt(gig.createdAt)}</div>
                </div>
              </div>
              <p class="detail-desc">${escHtml(gig.description)}</p>
              ${gig.tags && gig.tags.length ? `<div class="detail-tags">${gig.tags.map(t=>`<span class="tag">#${escHtml(t)}</span>`).join("")}</div>` : ""}
            </div>
          </div>

          <!-- RIGHT: Booking sidebar -->
          <div class="booking-sidebar">
            <div class="booking-card">
              <div class="booking-card-rate">$${gig.rate} <span>${gig.rateType==="hourly"?"/hr":"fixed price"}</span></div>
              <p style="font-size:0.82rem;color:var(--text-muted);margin-top:4px">Book directly with ${escHtml(gig.creatorName.split(" ")[0])}</p>
              <div class="booking-divider"></div>

              <form id="booking-form" novalidate>
                <div class="form-group" id="bfg-name">
                  <label class="form-label" for="bk-name">Your Name <span class="required">*</span></label>
                  <input id="bk-name" class="form-input" type="text" placeholder="Full name" value="${escHtml(savedClient)}" maxlength="60"/>
                  <div class="form-error">Please enter your name.</div>
                </div>
                <div class="form-group" id="bfg-email">
                  <label class="form-label" for="bk-email">Email <span class="required">*</span></label>
                  <input id="bk-email" class="form-input" type="email" placeholder="you@email.com" value="${escHtml(savedEmail)}"/>
                  <div class="form-error">Please enter a valid email.</div>
                </div>
                <div class="form-group" id="bfg-date">
                  <label class="form-label" for="bk-date">Preferred Start Date <span class="required">*</span></label>
                  <input id="bk-date" class="form-input" type="date" min="${new Date().toISOString().split("T")[0]}"/>
                  <div class="form-error">Please pick a date.</div>
                </div>
                <div class="form-group">
                  <label class="form-label" for="bk-msg">Message to Creator <span style="font-weight:400;color:var(--text-muted)">(optional)</span></label>
                  <textarea id="bk-msg" class="form-textarea" rows="3" placeholder="Describe your project, goals, or any questions…" maxlength="500"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">
                  🚀 Book This Gig
                </button>
                <p style="font-size:0.75rem;color:var(--text-muted);text-align:center;margin-top:10px">
                  No payment now · Creator confirms first
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById("booking-form").addEventListener("submit", submitBooking.bind(null, gig));
}

function submitBooking(gig, e) {
  e.preventDefault();
  const name  = document.getElementById("bk-name").value.trim();
  const email = document.getElementById("bk-email").value.trim();
  const date  = document.getElementById("bk-date").value;
  const msg   = document.getElementById("bk-msg").value.trim();

  let valid = true;
  const validate = (fgId, condition) => {
    document.getElementById(fgId).classList.toggle("error", !condition);
    if (!condition) valid = false;
  };
  validate("bfg-name",  name.length >= 2);
  validate("bfg-email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  validate("bfg-date",  !!date);
  if (!valid) return;

  // Save client info
  const meta = Store.getMeta();
  meta.clientName  = name;
  meta.clientEmail = email;
  Store.setMeta(meta);

  // DP2: No blocking — allow multiple bookings on same gig
  const booking = {
    id: uid(), gigId: gig.id, gigTitle: gig.title,
    gigCategory: gig.category, gigRate: gig.rate, gigRateType: gig.rateType,
    creatorId: gig.creatorId, creatorName: gig.creatorName,
    clientName: name, clientEmail: email,
    message: msg, preferredDate: date,
    status: "pending", createdAt: Date.now()
  };
  const bookings = Store.getBookings();
  bookings.push(booking);
  Store.setBookings(bookings);

  updateDashboardBadge();
  launchConfetti();
  showBookingConfirmModal(booking, gig);
}

function showBookingConfirmModal(booking, gig) {
  App.openModal(`
    <button class="modal-close" onclick="App.closeModal()">✕</button>
    <div class="modal-icon">🎉</div>
    <div class="modal-title">Booking Requested!</div>
    <div class="modal-sub">Your request has been sent to <strong>${escHtml(gig.creatorName)}</strong>. They'll review and respond shortly.</div>
    <div class="receipt">
      <div class="modal-detail-row"><span>Gig</span><span>${escHtml(gig.title.slice(0,35))}…</span></div>
      <div class="modal-detail-row"><span>Creator</span><span>${escHtml(gig.creatorName)}</span></div>
      <div class="modal-detail-row"><span>Rate</span><span>$${gig.rate} ${gig.rateType==="hourly"?"/hr":"fixed"}</span></div>
      <div class="modal-detail-row"><span>Start Date</span><span>${fmt(booking.preferredDate + "T12:00:00")}</span></div>
      <div class="modal-detail-row"><span>Status</span><span><span class="status-pill status-pending"><span class="status-dot"></span>Pending</span></span></div>
    </div>
    <div style="display:flex;gap:10px;flex-direction:column">
      <button class="btn btn-primary btn-block" onclick="App.closeModal();Router.go('my-bookings')">View My Bookings</button>
      <button class="btn btn-ghost btn-block" onclick="App.closeModal();Router.go('marketplace')">Continue Browsing</button>
    </div>
  `);
}

/* ── Page: CREATOR DASHBOARD ────────────────────────────────── */
function renderCreatorDashboard() {
  const meta        = Store.getMeta();
  const creatorName = meta.creatorName || "";

  document.getElementById("app-root").innerHTML = `
    <div class="page">
      <div class="container">
        <div class="dashboard-header">
          <div>
            <h1>Creator <span class="gradient-text">Dashboard</span></h1>
            <p style="margin-top:6px">Manage your incoming bookings</p>
          </div>
          ${creatorName
            ? `<div style="display:flex;align-items:center;gap:12px">
                <div class="creator-avatar" style="${avatarStyle(creatorName)};width:44px;height:44px;font-size:1rem">${avatarInitials(creatorName)}</div>
                <div><div style="font-weight:700">${escHtml(creatorName)}</div><div style="font-size:0.78rem;color:var(--text-muted)">Active Creator</div></div>
               </div>`
            : ""}
        </div>

        ${!creatorName
          ? renderCreatorSetup()
          : renderDashboardContent(creatorName)
        }
      </div>
    </div>`;

  if (creatorName) bindDashboardTabs(creatorName);
}

function renderCreatorSetup() {
  return `
    <div class="form-card" style="max-width:480px;margin:0 auto;text-align:center">
      <div style="font-size:3rem;margin-bottom:16px">🎨</div>
      <h3 style="margin-bottom:8px">Set up your creator profile</h3>
      <p style="margin-bottom:24px">Enter your name to access your dashboard. This should match the name you use when posting gigs.</p>
      <div class="form-group" id="fg-cname">
        <input id="creator-name-input" class="form-input" type="text" placeholder="Your creator name" maxlength="60"/>
        <div class="form-error">Please enter your name.</div>
      </div>
      <button class="btn btn-primary btn-block" onclick="saveCreatorName()">Access Dashboard →</button>
    </div>`;
}

window.saveCreatorName = function() {
  const name = document.getElementById("creator-name-input").value.trim();
  if (name.length < 2) { document.getElementById("fg-cname").classList.add("error"); return; }
  const meta = Store.getMeta();
  meta.creatorName = name;
  Store.setMeta(meta);
  toast(`Welcome, ${name}! 🎉`, "success");
  renderCreatorDashboard();
};

function renderDashboardContent(creatorName) {
  const all = Store.getBookings().filter(b => b.creatorId === creatorName);
  const pending  = all.filter(b=>b.status==="pending").length;
  const accepted = all.filter(b=>b.status==="accepted").length;
  const declined = all.filter(b=>b.status==="declined").length;

  return `
    <div class="dashboard-stats">
      <div class="stat-card"><div class="stat-card-num gradient-text">${all.length}</div><div class="stat-card-label">Total Bookings</div></div>
      <div class="stat-card"><div class="stat-card-num" style="color:var(--amber)">${pending}</div><div class="stat-card-label">Pending</div></div>
      <div class="stat-card"><div class="stat-card-num" style="color:var(--green)">${accepted}</div><div class="stat-card-label">Accepted</div></div>
      <div class="stat-card"><div class="stat-card-num" style="color:var(--red)">${declined}</div><div class="stat-card-label">Declined</div></div>
    </div>

    <div class="tab-row" id="dash-tabs">
      <button class="tab-btn active" data-tab="all"      onclick="switchDashTab('all')">All (${all.length})</button>
      <button class="tab-btn"        data-tab="pending"  onclick="switchDashTab('pending')">Pending (${pending})</button>
      <button class="tab-btn"        data-tab="accepted" onclick="switchDashTab('accepted')">Accepted (${accepted})</button>
      <button class="tab-btn"        data-tab="declined" onclick="switchDashTab('declined')">Declined (${declined})</button>
    </div>

    <div class="booking-list" id="dash-booking-list"></div>`;
}

function bindDashboardTabs(creatorName) {
  window.switchDashTab = (tab) => {
    State.dashTab = tab;
    document.querySelectorAll("#dash-tabs .tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    renderDashBookings(creatorName);
  };
  window.acceptBooking = (id) => updateBookingStatus(id, "accepted", creatorName);
  window.declineBooking = (id) => updateBookingStatus(id, "declined", creatorName);
  renderDashBookings(creatorName);
}

function renderDashBookings(creatorName) {
  let bookings = Store.getBookings().filter(b => b.creatorId === creatorName);
  if (State.dashTab !== "all") bookings = bookings.filter(b => b.status === State.dashTab);
  bookings.sort((a,b) => b.createdAt - a.createdAt);

  const list = document.getElementById("dash-booking-list");
  if (!list) return;

  if (bookings.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><h3>No bookings here</h3><p>They'll show up as clients book your gigs</p></div>`;
    return;
  }

  list.innerHTML = bookings.map(b => `
    <div class="booking-item" id="bi-${b.id}">
      <div>
        <div class="booking-item-title">${escHtml(b.gigTitle)}</div>
        <div style="margin-top:6px">${statusPill(b.status)}</div>
        ${b.message ? `<div class="booking-message">"${escHtml(b.message)}"</div>` : ""}
        <div class="booking-item-meta">
          <span>👤 ${escHtml(b.clientName)}</span>
          <span>📧 ${escHtml(b.clientEmail)}</span>
          <span>📅 ${fmt(b.preferredDate + "T12:00:00")}</span>
          <span>🕐 Requested ${fmt(b.createdAt)}</span>
        </div>
      </div>
      <div class="booking-actions">
        ${b.status === "pending" ? `
          <button class="btn btn-success btn-sm" onclick="acceptBooking('${b.id}')">✓ Accept</button>
          <button class="btn btn-danger btn-sm"  onclick="declineBooking('${b.id}')">✕ Decline</button>
        ` : ""}
        ${b.status === "accepted" ? `<button class="btn btn-ghost btn-sm" disabled style="opacity:0.5">Accepted</button>` : ""}
        ${b.status === "declined" ? `<button class="btn btn-ghost btn-sm" disabled style="opacity:0.5">Declined</button>` : ""}
      </div>
    </div>
  `).join("");
}

function updateBookingStatus(id, status, creatorName) {
  const bookings = Store.getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return;
  bookings[idx].status = status;
  Store.setBookings(bookings);
  toast(status === "accepted" ? "Booking accepted! 🎉" : "Booking declined.", status === "accepted" ? "success" : "info");
  updateDashboardBadge();
  renderDashBookings(creatorName);
  // Re-render stats row
  const all = Store.getBookings().filter(b => b.creatorId === creatorName);
  const pending  = all.filter(b=>b.status==="pending").length;
  const accepted = all.filter(b=>b.status==="accepted").length;
  const declined = all.filter(b=>b.status==="declined").length;
  const statsEls = document.querySelectorAll(".stat-card-num");
  if (statsEls[0]) statsEls[0].textContent = all.length;
  if (statsEls[1]) statsEls[1].textContent = pending;
  if (statsEls[2]) statsEls[2].textContent = accepted;
  if (statsEls[3]) statsEls[3].textContent = declined;
  // Update tab labels
  const tabs = document.querySelectorAll("#dash-tabs .tab-btn");
  if (tabs[0]) tabs[0].textContent = `All (${all.length})`;
  if (tabs[1]) tabs[1].textContent = `Pending (${pending})`;
  if (tabs[2]) tabs[2].textContent = `Accepted (${accepted})`;
  if (tabs[3]) tabs[3].textContent = `Declined (${declined})`;
}

/* ── Page: MY BOOKINGS ──────────────────────────────────────── */
function renderMyBookings() {
  const meta        = Store.getMeta();
  const clientEmail = meta.clientEmail || "";
  const clientName  = meta.clientName  || "";

  document.getElementById("app-root").innerHTML = `
    <div class="page">
      <div class="container">
        <div class="my-bookings-header">
          <h1>My <span class="gradient-text">Bookings</span></h1>
          <p style="margin-top:6px">Track all your booking requests</p>
        </div>

        ${!clientEmail
          ? renderClientSetup()
          : renderMyBookingsContent(clientEmail, clientName)
        }
      </div>
    </div>`;

  if (clientEmail) bindMyBookingsTabs(clientEmail);
}

function renderClientSetup() {
  return `
    <div class="form-card" style="max-width:480px;margin:0 auto;text-align:center">
      <div style="font-size:3rem;margin-bottom:16px">📋</div>
      <h3 style="margin-bottom:8px">Access your bookings</h3>
      <p style="margin-bottom:24px">Enter the email you used when booking a gig.</p>
      <div class="form-group" id="fg-cemail">
        <input id="client-email-input" class="form-input" type="email" placeholder="you@email.com"/>
        <div class="form-error">Please enter a valid email.</div>
      </div>
      <button class="btn btn-primary btn-block" onclick="saveClientEmail()">View My Bookings →</button>
    </div>`;
}

window.saveClientEmail = function() {
  const email = document.getElementById("client-email-input").value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("fg-cemail").classList.add("error"); return;
  }
  const meta = Store.getMeta();
  meta.clientEmail = email;
  Store.setMeta(meta);
  toast("Bookings loaded!", "success");
  renderMyBookings();
};

function renderMyBookingsContent(clientEmail, clientName) {
  const all      = Store.getBookings().filter(b => b.clientEmail === clientEmail);
  const pending  = all.filter(b=>b.status==="pending").length;
  const accepted = all.filter(b=>b.status==="accepted").length;
  const declined = all.filter(b=>b.status==="declined").length;

  return `
    ${clientName ? `<div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
      <div class="creator-avatar" style="${avatarStyle(clientName)};width:36px;height:36px;font-size:0.8rem">${avatarInitials(clientName)}</div>
      <span style="font-weight:600">${escHtml(clientName)}</span>
      <span style="color:var(--text-muted);font-size:0.8rem">· ${escHtml(clientEmail)}</span>
    </div>` : ""}

    <div class="dashboard-stats">
      <div class="stat-card"><div class="stat-card-num gradient-text">${all.length}</div><div class="stat-card-label">Total</div></div>
      <div class="stat-card"><div class="stat-card-num" style="color:var(--amber)">${pending}</div><div class="stat-card-label">Pending</div></div>
      <div class="stat-card"><div class="stat-card-num" style="color:var(--green)">${accepted}</div><div class="stat-card-label">Accepted</div></div>
      <div class="stat-card"><div class="stat-card-num" style="color:var(--red)">${declined}</div><div class="stat-card-label">Declined</div></div>
    </div>

    <div class="tab-row" id="my-tabs">
      <button class="tab-btn active" data-tab="all"      onclick="switchMyTab('all')">All (${all.length})</button>
      <button class="tab-btn"        data-tab="pending"  onclick="switchMyTab('pending')">Pending</button>
      <button class="tab-btn"        data-tab="accepted" onclick="switchMyTab('accepted')">Accepted</button>
      <button class="tab-btn"        data-tab="declined" onclick="switchMyTab('declined')">Declined</button>
    </div>

    <div class="booking-list" id="my-booking-list"></div>`;
}

function bindMyBookingsTabs(clientEmail) {
  window.switchMyTab = (tab) => {
    State.bookingsTab = tab;
    document.querySelectorAll("#my-tabs .tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    renderMyBookingList(clientEmail);
  };
  renderMyBookingList(clientEmail);
}

function renderMyBookingList(clientEmail) {
  let bookings = Store.getBookings().filter(b => b.clientEmail === clientEmail);
  if (State.bookingsTab !== "all") bookings = bookings.filter(b => b.status === State.bookingsTab);
  bookings.sort((a,b) => b.createdAt - a.createdAt);

  const list = document.getElementById("my-booking-list");
  if (!list) return;

  if (bookings.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <h3>No bookings yet</h3>
        <p>Browse the marketplace and book your first gig!</p>
        <button class="btn btn-primary" style="margin-top:8px" onclick="Router.go('marketplace')">Explore Gigs →</button>
      </div>`;
    return;
  }

  list.innerHTML = bookings.map(b => {
    const [c1,c2] = avatarColor(b.creatorName);
    // DP1: Declined bookings show Rebook CTA
    const rebookBtn = b.status === "declined"
      ? `<button class="btn btn-cyan btn-sm" onclick="Router.go('gig/${b.gigId}')">🔄 Rebook</button>`
      : "";
    // Browse similar CTA for declined
    const browseBtn = b.status === "declined"
      ? `<button class="btn btn-ghost btn-sm" onclick="State.filterCategory='${b.gigCategory}';Router.go('marketplace')">Browse Similar →</button>`
      : "";

    return `
    <div class="booking-item">
      <div>
        <div class="booking-item-title">${escHtml(b.gigTitle)}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
          ${statusPill(b.status)}
          <span class="cat-tag ${catClass(b.gigCategory)}" style="font-size:0.7rem">${CAT_EMOJI[b.gigCategory]||""} ${escHtml(b.gigCategory)}</span>
        </div>
        <div class="booking-item-meta" style="margin-top:12px">
          <span style="display:flex;align-items:center;gap:6px">
            <span class="creator-avatar" style="background:linear-gradient(135deg,${c1},${c2});width:22px;height:22px;font-size:0.6rem">${avatarInitials(b.creatorName)}</span>
            ${escHtml(b.creatorName)}
          </span>
          <span>💰 $${b.gigRate} ${b.gigRateType==="hourly"?"/hr":"fixed"}</span>
          <span>📅 ${fmt(b.preferredDate + "T12:00:00")}</span>
          <span>🕐 ${fmt(b.createdAt)}</span>
        </div>
        ${b.status === "declined" ? `
          <div style="margin-top:12px;padding:10px 14px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:var(--radius-sm);">
            <p style="font-size:0.82rem;color:var(--red);margin-bottom:0">This booking was declined. You can rebook this creator or find similar talent.</p>
          </div>` : ""}
      </div>
      <div class="booking-actions">
        ${rebookBtn}
        ${browseBtn}
        <button class="btn btn-ghost btn-sm" onclick="Router.go('gig/${b.gigId}')">View Gig →</button>
      </div>
    </div>`;
  }).join("");
}

/* ── Status Pill helper ─────────────────────────────────────── */
function statusPill(status) {
  const labels = { pending:"Pending", accepted:"Accepted", declined:"Declined" };
  return `<span class="status-pill status-${status}"><span class="status-dot"></span>${labels[status]||status}</span>`;
}

/* ── Boot ───────────────────────────────────────────────────── */
window.App    = App;
window.Router = Router;
window.State  = State;
App.init();
