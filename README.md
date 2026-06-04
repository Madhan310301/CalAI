<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>NutriLens AI – README</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
<style>
  :root {
    --green: #00e87b;
    --green-dim: #00c865;
    --bg: #080c10;
    --surface: #0d1318;
    --surface2: #131c22;
    --border: rgba(0,232,123,0.15);
    --text: #e8f5ee;
    --muted: #6b8f7a;
    --accent: #00ffa3;
    --orange: #ff8c42;
    --blue: #4db8ff;
  }

  * { margin:0; padding:0; box-sizing:border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Sora', sans-serif;
    line-height: 1.7;
    overflow-x: hidden;
  }

  /* ── Scanline overlay ── */
  body::before {
    content:'';
    position:fixed; inset:0; z-index:0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,232,123,0.015) 2px,
      rgba(0,232,123,0.015) 4px
    );
    pointer-events:none;
  }

  /* ── Grid bg ── */
  body::after {
    content:'';
    position:fixed; inset:0; z-index:0;
    background-image:
      linear-gradient(rgba(0,232,123,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,232,123,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events:none;
  }

  .wrap { position:relative; z-index:1; max-width: 900px; margin: 0 auto; padding: 0 2rem 6rem; }

  /* ── Hero ── */
  .hero {
    text-align:center;
    padding: 5rem 0 3rem;
    animation: fadeUp 0.9s ease both;
  }

  .logo-ring {
    display: inline-flex; align-items:center; justify-content:center;
    width: 110px; height: 110px;
    border-radius: 50%;
    border: 1.5px solid var(--green);
    position: relative;
    margin-bottom: 2rem;
    animation: spin 20s linear infinite;
  }
  .logo-ring::before {
    content:'';
    position:absolute; inset:-8px;
    border-radius:50%;
    border: 1px dashed rgba(0,232,123,0.3);
    animation: spin-rev 15s linear infinite;
  }
  .logo-inner {
    width: 80px; height: 80px;
    background: linear-gradient(135deg, #0a1f14, #0d2a1a);
    border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size: 2.2rem;
    animation: spin-rev 20s linear infinite;
    border: 1px solid rgba(0,232,123,0.25);
  }

  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes spin-rev { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }

  .badge-row {
    display:flex; flex-wrap:wrap; gap:8px; justify-content:center;
    margin-bottom: 1.5rem;
    animation: fadeUp 0.9s 0.1s ease both;
  }
  .badge {
    display:inline-flex; align-items:center; gap:5px;
    font-family:'JetBrains Mono', monospace;
    font-size: 11px; font-weight:600;
    padding: 4px 12px;
    border-radius: 99px;
    border: 1px solid;
    letter-spacing: 0.05em;
    text-transform:uppercase;
  }
  .badge.g { color:var(--green); border-color:rgba(0,232,123,0.4); background:rgba(0,232,123,0.07); }
  .badge.o { color:var(--orange); border-color:rgba(255,140,66,0.4); background:rgba(255,140,66,0.07); }
  .badge.b { color:var(--blue); border-color:rgba(77,184,255,0.4); background:rgba(77,184,255,0.07); }

  h1 {
    font-size: clamp(2.8rem,6vw,5rem);
    font-weight:800; letter-spacing:-0.03em;
    line-height:1.05;
    margin-bottom: 0.5rem;
    animation: fadeUp 0.9s 0.15s ease both;
  }
  h1 span { color: var(--green); }

  .tagline {
    font-size: 1.1rem; color:var(--muted); max-width:520px; margin:0 auto 2rem;
    animation: fadeUp 0.9s 0.2s ease both;
  }

  .cta-row {
    display:flex; flex-wrap:wrap; gap:12px; justify-content:center;
    animation: fadeUp 0.9s 0.3s ease both;
    margin-bottom: 3rem;
  }
  .btn {
    padding: 12px 28px; border-radius:8px;
    font-family:'Sora',sans-serif; font-size:14px; font-weight:600;
    cursor:pointer; text-decoration:none;
    border: 1.5px solid transparent;
    transition: all 0.2s;
    letter-spacing:0.02em;
  }
  .btn-primary {
    background: var(--green); color:#050d09;
    border-color: var(--green);
  }
  .btn-primary:hover { background: var(--accent); transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,232,123,0.25); }
  .btn-ghost {
    background:transparent; color:var(--text);
    border-color: rgba(255,255,255,0.2);
  }
  .btn-ghost:hover { border-color:var(--green); color:var(--green); transform:translateY(-2px); }

  /* ── Demo strip ── */
  .demo-strip {
    display:flex; gap:12px; justify-content:center; flex-wrap:wrap;
    margin-bottom: 4rem;
    animation: fadeUp 0.9s 0.4s ease both;
  }
  .phone-mock {
    width:160px; height:300px;
    background: var(--surface);
    border-radius: 24px;
    border: 1px solid var(--border);
    overflow:hidden; position:relative;
    transition: transform 0.3s, box-shadow 0.3s;
  }
  .phone-mock:hover { transform:translateY(-8px) scale(1.03); box-shadow: 0 24px 60px rgba(0,232,123,0.15); }
  .phone-notch {
    height:28px; background:var(--surface2);
    display:flex; align-items:center; justify-content:center;
  }
  .phone-notch::after {
    content:''; width:48px; height:10px;
    background:var(--bg); border-radius:8px;
  }
  .phone-body { padding:10px; }
  .scan-anim {
    width:100%; height:120px;
    background: linear-gradient(180deg, rgba(0,232,123,0.05), rgba(0,232,123,0.12));
    border-radius:10px;
    border: 1px solid rgba(0,232,123,0.2);
    position:relative; overflow:hidden;
    margin-bottom:8px;
    display:flex; align-items:center; justify-content:center;
    font-size: 1.8rem;
  }
  .scan-line {
    position:absolute; left:0; right:0; height:2px;
    background: linear-gradient(90deg, transparent, var(--green), transparent);
    animation: scan 2.5s ease-in-out infinite;
    box-shadow: 0 0 12px var(--green);
  }
  @keyframes scan { 0%{top:10%} 50%{top:80%} 100%{top:10%} }
  .scan-line-2 { animation-delay: 0.8s; }
  .scan-line-3 { animation-delay: 1.6s; }

  .cal-result {
    font-family:'JetBrains Mono',monospace;
    font-size:13px; color:var(--green); font-weight:600;
  }
  .cal-bar { height:5px; background:var(--surface2); border-radius:99px; margin:5px 0; overflow:hidden; }
  .cal-fill { height:100%; border-radius:99px; animation: barGrow 2s ease both; }
  @keyframes barGrow { from{width:0} }
  .fill-p { background:var(--green); }
  .fill-c { background:var(--blue); }
  .fill-f { background:var(--orange); }
  .mini-label { font-size:9px; color:var(--muted); font-family:'JetBrains Mono',monospace; display:flex; justify-content:space-between; }

  /* ── Divider ── */
  .divider {
    display:flex; align-items:center; gap:16px;
    margin: 3rem 0 2rem;
    animation: fadeUp 0.7s ease both;
  }
  .divider::before,.divider::after {
    content:''; flex:1; height:1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
  }
  .divider span {
    font-family:'JetBrains Mono',monospace;
    font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.1em;
  }

  /* ── Section headings ── */
  h2 {
    font-size:1.6rem; font-weight:700; margin-bottom:1.5rem;
    color:var(--text); letter-spacing:-0.02em;
  }
  h2 .accent { color:var(--green); }
  h3 { font-size:1rem; font-weight:600; margin-bottom:.5rem; color:var(--text); }

  /* ── Feature grid ── */
  .feature-grid {
    display:grid; grid-template-columns: repeat(auto-fit,minmax(240px,1fr));
    gap:14px; margin-bottom:2rem;
  }
  .feat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius:14px; padding:1.25rem;
    transition: all 0.25s;
    position:relative; overflow:hidden;
    animation: fadeUp 0.7s ease both;
  }
  .feat-card:hover {
    border-color:rgba(0,232,123,0.5);
    transform:translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,232,123,0.1);
  }
  .feat-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background: linear-gradient(90deg, transparent, var(--green), transparent);
    opacity:0; transition:opacity 0.25s;
  }
  .feat-card:hover::before { opacity:1; }
  .feat-icon {
    font-size:1.6rem; margin-bottom:.75rem;
    display:block;
    filter: drop-shadow(0 0 8px rgba(0,232,123,0.4));
  }
  .feat-desc { font-size:.85rem; color:var(--muted); line-height:1.6; }

  /* ── Advantage table ── */
  .adv-table {
    width:100%; border-collapse:collapse;
    margin-bottom:2rem;
    animation: fadeUp 0.7s ease both;
  }
  .adv-table th {
    font-family:'JetBrains Mono',monospace;
    font-size:11px; text-transform:uppercase; letter-spacing:.08em;
    color:var(--muted); padding: 8px 12px; text-align:left;
    border-bottom:1px solid var(--border);
  }
  .adv-table td {
    padding:10px 12px; font-size:.88rem;
    border-bottom:1px solid rgba(0,232,123,0.05);
    vertical-align:middle;
  }
  .adv-table tr:last-child td { border-bottom:none; }
  .adv-table tr:hover td { background:rgba(0,232,123,0.04); }
  .check { color:var(--green); font-size:1.1rem; }
  .nope  { color:var(--muted); font-size:1.1rem; opacity:.5; }
  .feature-col { font-weight:500; }

  /* ── Tech stack pills ── */
  .tech-grid { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:2rem; }
  .tech-pill {
    font-family:'JetBrains Mono',monospace;
    font-size:12px; font-weight:600;
    padding:6px 14px; border-radius:6px;
    border:1px solid var(--border);
    background:var(--surface);
    color:var(--green);
    transition: all 0.2s;
    animation: popIn 0.5s ease both;
  }
  .tech-pill:hover { background:rgba(0,232,123,0.1); border-color:rgba(0,232,123,0.5); transform:scale(1.05); }
  @keyframes popIn { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }

  /* ── Code block ── */
  .code-block {
    background: var(--surface);
    border:1px solid var(--border);
    border-radius:12px; overflow:hidden;
    margin-bottom:2rem;
    animation: fadeUp 0.7s ease both;
  }
  .code-header {
    background:var(--surface2);
    padding:10px 16px;
    display:flex; align-items:center; justify-content:space-between;
    border-bottom:1px solid var(--border);
  }
  .code-dots { display:flex; gap:6px; }
  .code-dots span {
    width:10px; height:10px; border-radius:50%;
  }
  .dot-r{background:#ff5f57} .dot-y{background:#ffbd2e} .dot-g{background:#28c840}
  .code-lang {
    font-family:'JetBrains Mono',monospace;
    font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.1em;
  }
  pre {
    padding:1.25rem 1.5rem;
    font-family:'JetBrains Mono',monospace;
    font-size:.8rem; line-height:1.7;
    overflow-x:auto; color:#c9d9cc;
  }
  .kw  { color:#ff8c42; }
  .fn  { color:#00e87b; }
  .str { color:#4db8ff; }
  .cm  { color:#3d5c47; }

  /* ── Stats row ── */
  .stats-row {
    display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr));
    gap:12px; margin-bottom:3rem;
  }
  .stat-card {
    background:var(--surface);
    border:1px solid var(--border);
    border-radius:12px; padding:1.25rem;
    text-align:center;
    transition: all 0.25s;
    animation: fadeUp 0.7s ease both;
  }
  .stat-card:hover { transform:translateY(-4px); border-color:rgba(0,232,123,0.4); }
  .stat-num {
    font-size:2rem; font-weight:800;
    color:var(--green); font-family:'JetBrains Mono',monospace;
    line-height:1.1; margin-bottom:.2rem;
  }
  .stat-label { font-size:.75rem; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; }

  /* ── Roadmap ── */
  .roadmap { position:relative; padding-left:28px; margin-bottom:2rem; }
  .roadmap::before {
    content:''; position:absolute; left:6px; top:6px; bottom:6px;
    width:1px; background:linear-gradient(180deg,var(--green),transparent);
  }
  .road-item {
    position:relative; margin-bottom:1.5rem;
    animation: fadeUp 0.6s ease both;
  }
  .road-item::before {
    content:''; position:absolute; left:-25px; top:6px;
    width:10px; height:10px; border-radius:50%;
    border:2px solid var(--green);
    background:var(--bg);
  }
  .road-item.done::before { background:var(--green); }
  .road-label {
    font-family:'JetBrains Mono',monospace;
    font-size:10px; text-transform:uppercase; letter-spacing:.1em;
    color:var(--green); margin-bottom:.25rem;
  }
  .road-label.soon { color:var(--orange); }
  .road-label.future { color:var(--blue); }
  .road-text { font-size:.88rem; color:var(--muted); }

  /* ── Footer ── */
  .footer {
    text-align:center; padding:3rem 0 1rem;
    border-top:1px solid var(--border);
    font-size:.8rem; color:var(--muted);
    animation: fadeUp 0.7s ease both;
  }
  .footer a { color:var(--green); text-decoration:none; }
  .footer a:hover { text-decoration:underline; }
  .heart { color:#e25; animation: pulse 1.5s ease-in-out infinite; display:inline-block; }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }

  /* ── Animations ── */
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(20px)}
    to{opacity:1;transform:translateY(0)}
  }

  /* ── Glow blob ── */
  .glow-blob {
    position:fixed; width:600px; height:600px;
    background:radial-gradient(circle, rgba(0,232,123,0.06) 0%, transparent 70%);
    border-radius:50%; pointer-events:none; z-index:0;
    top:-100px; left:50%; transform:translateX(-50%);
    animation: blobFloat 8s ease-in-out infinite;
  }
  @keyframes blobFloat { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(30px)} }

  /* ── Scroll reveal via intersection ── */
  .reveal { opacity:0; transform:translateY(24px); transition:all .6s ease; }
  .reveal.visible { opacity:1; transform:translateY(0); }

  /* ── Typing cursor ── */
  .cursor {
    display:inline-block; width:2px; height:1em;
    background:var(--green); margin-left:2px; vertical-align:middle;
    animation:blink 1s step-end infinite;
  }
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
</style>
</head>
<body>

<div class="glow-blob"></div>

<div class="wrap">

  <!-- HERO -->
  <div class="hero">
    <div class="logo-ring">
      <div class="logo-inner">🥗</div>
    </div>

    <div class="badge-row">
      <span class="badge g">● Live</span>
      <span class="badge b">React Native</span>
      <span class="badge o">AI-Powered</span>
      <span class="badge g">Vision API</span>
      <span class="badge b">Open Source</span>
    </div>

    <h1>Nutri<span>Lens</span> AI<span class="cursor"></span></h1>
    <p class="tagline">Scan food. Get instant calories, macros & insights — powered by next-gen computer vision and a multimodal AI brain.</p>

    <div class="cta-row">
      <a class="btn btn-primary" href="#">⚡ Get Started</a>
      <a class="btn btn-ghost" href="#">📖 Documentation</a>
      <a class="btn btn-ghost" href="#">⭐ Star on GitHub</a>
    </div>
  </div>

  <!-- PHONE MOCKUPS -->
  <div class="demo-strip">
    <!-- Phone 1 -->
    <div class="phone-mock">
      <div class="phone-notch"></div>
      <div class="phone-body">
        <div class="scan-anim">
          🍕
          <div class="scan-line"></div>
        </div>
        <div class="cal-result">Scanning meal...</div>
        <div style="font-size:9px;color:var(--muted);margin:4px 0;">Confidence: 98.7%</div>
        <div class="mini-label"><span>Protein</span><span>32g</span></div>
        <div class="cal-bar"><div class="cal-fill fill-p" style="width:72%"></div></div>
        <div class="mini-label"><span>Carbs</span><span>45g</span></div>
        <div class="cal-bar"><div class="cal-fill fill-c" style="width:55%;animation-delay:.2s"></div></div>
        <div class="mini-label"><span>Fat</span><span>18g</span></div>
        <div class="cal-bar"><div class="cal-fill fill-f" style="width:40%;animation-delay:.4s"></div></div>
        <div style="font-size:18px;font-weight:800;color:var(--green);margin-top:8px;font-family:'JetBrains Mono',monospace;">476 kcal</div>
      </div>
    </div>

    <!-- Phone 2 -->
    <div class="phone-mock" style="animation-delay:.1s">
      <div class="phone-notch"></div>
      <div class="phone-body">
        <div class="scan-anim">
          🥗
          <div class="scan-line scan-line-2"></div>
        </div>
        <div class="cal-result">Multi-item detected</div>
        <div style="font-size:9px;color:var(--muted);margin:4px 0;">4 items identified</div>
        <div style="font-size:9px;color:var(--text);margin:3px 0;font-family:'JetBrains Mono',monospace;">• Caesar Salad · 210 kcal</div>
        <div style="font-size:9px;color:var(--text);margin:3px 0;font-family:'JetBrains Mono',monospace;">• Grilled Chicken · 185 kcal</div>
        <div style="font-size:9px;color:var(--text);margin:3px 0;font-family:'JetBrains Mono',monospace;">• Croutons · 45 kcal</div>
        <div style="font-size:9px;color:var(--text);margin:3px 0;font-family:'JetBrains Mono',monospace;">• Dressing · 80 kcal</div>
        <div style="font-size:18px;font-weight:800;color:var(--green);margin-top:8px;font-family:'JetBrains Mono',monospace;">520 kcal</div>
      </div>
    </div>

    <!-- Phone 3 -->
    <div class="phone-mock" style="animation-delay:.2s">
      <div class="phone-notch"></div>
      <div class="phone-body">
        <div class="scan-anim">
          📊
          <div class="scan-line scan-line-3"></div>
        </div>
        <div class="cal-result">Daily Insights</div>
        <div style="font-size:9px;color:var(--muted);margin:4px 0;">Goal: 2000 kcal</div>
        <div class="mini-label"><span>Progress</span><span>68%</span></div>
        <div class="cal-bar"><div class="cal-fill fill-p" style="width:68%;animation-delay:.3s"></div></div>
        <div style="font-size:9px;color:var(--muted);margin:6px 0 3px;">AI Suggestion:</div>
        <div style="font-size:8.5px;color:var(--text);line-height:1.5;">You have 640 kcal left. Add lean protein for optimal recovery. 💡</div>
        <div style="font-size:18px;font-weight:800;color:var(--blue);margin-top:8px;font-family:'JetBrains Mono',monospace;">1,360 kcal</div>
      </div>
    </div>
  </div>

  <!-- STATS -->
  <div class="stats-row reveal">
    <div class="stat-card" style="animation-delay:.05s">
      <div class="stat-num">98.7%</div>
      <div class="stat-label">Vision Accuracy</div>
    </div>
    <div class="stat-card" style="animation-delay:.1s">
      <div class="stat-num">&lt;1.5s</div>
      <div class="stat-label">Scan Speed</div>
    </div>
    <div class="stat-card" style="animation-delay:.15s">
      <div class="stat-num">2M+</div>
      <div class="stat-label">Foods Recognized</div>
    </div>
    <div class="stat-card" style="animation-delay:.2s">
      <div class="stat-num">32+</div>
      <div class="stat-label">Nutrients Tracked</div>
    </div>
  </div>

  <!-- ABOUT -->
  <div class="divider reveal"><span>About</span></div>
  <h2 class="reveal">Why <span class="accent">NutriLens AI</span> is different</h2>
  <p class="reveal" style="color:var(--muted);margin-bottom:2rem;font-size:.95rem;">
    NutriLens AI takes food recognition beyond simple photo analysis. By combining multimodal vision models, contextual natural language descriptions, and a real-time nutritional reasoning engine — it achieves a level of detail and precision that goes well beyond anything previously available. Describe your meal in words, snap a photo, or do both — the AI fuses every signal to give you the most accurate calorie and macro breakdown possible.
  </p>

  <!-- FEATURE GRID -->
  <div class="feature-grid">
    <div class="feat-card" style="animation-delay:.05s">
      <span class="feat-icon">🧠</span>
      <h3>Multimodal Fusion Engine</h3>
      <p class="feat-desc">Combines image embeddings and natural language descriptions simultaneously — not sequentially — for dramatically higher accuracy on ambiguous or mixed dishes.</p>
    </div>
    <div class="feat-card" style="animation-delay:.1s">
      <span class="feat-icon">🔬</span>
      <h3>32-Nutrient Deep Profile</h3>
      <p class="feat-desc">Goes beyond calories. Tracks protein, carbs, fat, fibre, sugar, sodium, 13 vitamins, 8 minerals, and net carbs in a single scan.</p>
    </div>
    <div class="feat-card" style="animation-delay:.15s">
      <span class="feat-icon">🍽️</span>
      <h3>Multi-Item Plate Detection</h3>
      <p class="feat-desc">Detects and logs individual food items on a plate separately — even when stacked or overlapping — using instance segmentation, not just classification.</p>
    </div>
    <div class="feat-card" style="animation-delay:.2s">
      <span class="feat-icon">📏</span>
      <h3>Smart Portion Estimation</h3>
      <p class="feat-desc">Uses depth inference and reference object detection (hands, plates, cutlery) to estimate portion sizes without manual input.</p>
    </div>
    <div class="feat-card" style="animation-delay:.25s">
      <span class="feat-icon">🌏</span>
      <h3>Regional Cuisine Intelligence</h3>
      <p class="feat-desc">Natively understands 40+ global cuisines including South Indian, Middle Eastern, and East Asian dishes — trained on a regionally diverse dataset.</p>
    </div>
    <div class="feat-card" style="animation-delay:.3s">
      <span class="feat-icon">💬</span>
      <h3>Natural Language Description Mode</h3>
      <p class="feat-desc">Can't photograph your meal? Just describe it. The AI interprets context, cooking methods, ingredients, and portions from plain-text input.</p>
    </div>
    <div class="feat-card" style="animation-delay:.35s">
      <span class="feat-icon">📈</span>
      <h3>Adaptive Goal Engine</h3>
      <p class="feat-desc">Learns your dietary patterns over time and dynamically adjusts daily calorie and macro goals based on activity, trends, and stated objectives.</p>
    </div>
    <div class="feat-card" style="animation-delay:.4s">
      <span class="feat-icon">🔒</span>
      <h3>Privacy-First Architecture</h3>
      <p class="feat-desc">On-device pre-processing ensures food photos are never stored raw. Analysis happens with anonymized embeddings, not identifiable images.</p>
    </div>
    <div class="feat-card" style="animation-delay:.45s">
      <span class="feat-icon">⚡</span>
      <h3>Offline-Ready Core</h3>
      <p class="feat-desc">A lightweight on-device model handles common foods offline. Cloud inference kicks in only for rare, complex, or ambiguous cases.</p>
    </div>
  </div>

  <!-- COMPARISON TABLE -->
  <div class="divider reveal"><span>Comparison</span></div>
  <h2 class="reveal">How we <span class="accent">stack up</span></h2>
  <div class="reveal">
    <table class="adv-table">
      <thead>
        <tr>
          <th>Feature</th>
          <th>NutriLens AI</th>
          <th>Existing Solutions</th>
        </tr>
      </thead>
      <tbody>
        <tr><td class="feature-col">Multimodal (Image + Text Fusion)</td><td><span class="check">✓ Native</span></td><td><span class="nope">✗ Photo-only</span></td></tr>
        <tr><td class="feature-col">Nutrients tracked</td><td><span class="check">32 nutrients</span></td><td><span class="nope">5–7 typical</span></td></tr>
        <tr><td class="feature-col">Multi-item detection on one plate</td><td><span class="check">✓ Instance segmentation</span></td><td><span class="nope">✗ Single label</span></td></tr>
        <tr><td class="feature-col">Portion size estimation (no input)</td><td><span class="check">✓ Depth inference</span></td><td><span class="nope">Manual entry required</span></td></tr>
        <tr><td class="feature-col">Regional cuisine coverage</td><td><span class="check">40+ cuisines</span></td><td><span class="nope">Western-biased</span></td></tr>
        <tr><td class="feature-col">Offline mode</td><td><span class="check">✓ On-device model</span></td><td><span class="nope">Always online</span></td></tr>
        <tr><td class="feature-col">Privacy (no raw image storage)</td><td><span class="check">✓ Embedding-only</span></td><td><span class="nope">Cloud-stored</span></td></tr>
        <tr><td class="feature-col">Adaptive personal goals</td><td><span class="check">✓ ML-driven</span></td><td><span class="nope">Static targets</span></td></tr>
        <tr><td class="feature-col">Open Source</td><td><span class="check">✓ MIT License</span></td><td><span class="nope">Proprietary</span></td></tr>
      </tbody>
    </table>
  </div>

  <!-- TECH STACK -->
  <div class="divider reveal"><span>Tech Stack</span></div>
  <h2 class="reveal">Built with <span class="accent">modern tools</span></h2>
  <div class="tech-grid reveal">
    <span class="tech-pill" style="animation-delay:.02s">React Native</span>
    <span class="tech-pill" style="animation-delay:.04s">TypeScript</span>
    <span class="tech-pill" style="animation-delay:.06s">Node.js</span>
    <span class="tech-pill" style="animation-delay:.08s">Express</span>
    <span class="tech-pill" style="animation-delay:.10s">MongoDB</span>
    <span class="tech-pill" style="animation-delay:.12s">OpenAI Vision API</span>
    <span class="tech-pill" style="animation-delay:.14s">CLIP Embeddings</span>
    <span class="tech-pill" style="animation-delay:.16s">FastAPI</span>
    <span class="tech-pill" style="animation-delay:.18s">TensorFlow Lite</span>
    <span class="tech-pill" style="animation-delay:.20s">Python</span>
    <span class="tech-pill" style="animation-delay:.22s">Redis</span>
    <span class="tech-pill" style="animation-delay:.24s">Docker</span>
    <span class="tech-pill" style="animation-delay:.26s">GitHub Actions</span>
    <span class="tech-pill" style="animation-delay:.28s">Expo</span>
  </div>

  <!-- CODE BLOCK -->
  <div class="divider reveal"><span>Quick Start</span></div>
  <h2 class="reveal">Up and running in <span class="accent">60 seconds</span></h2>
  <div class="code-block reveal">
    <div class="code-header">
      <div class="code-dots">
        <span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span>
      </div>
      <span class="code-lang">bash</span>
    </div>
    <pre><span class="cm"># 1. Clone the repository</span>
git clone https://github.com/your-username/nutrilens-ai.git
<span class="kw">cd</span> nutrilens-ai

<span class="cm"># 2. Install dependencies</span>
npm install

<span class="cm"># 3. Set up environment variables</span>
<span class="kw">cp</span> .env.example .env
<span class="cm"># Add your OPENAI_API_KEY and MONGODB_URI</span>

<span class="cm"># 4. Start the backend</span>
<span class="fn">npm</span> run start:server

<span class="cm"># 5. Launch the mobile app (Expo)</span>
<span class="fn">npx</span> expo start</pre>
  </div>

  <div class="code-block reveal">
    <div class="code-header">
      <div class="code-dots">
        <span class="dot-r"></span><span class="dot-y"></span><span class="dot-g"></span>
      </div>
      <span class="code-lang">JavaScript — API Usage</span>
    </div>
    <pre><span class="kw">import</span> { <span class="fn">analyzeFood</span> } <span class="kw">from</span> <span class="str">'@nutrilens/core'</span>;

<span class="cm">// Analyze from photo + description</span>
<span class="kw">const</span> result = <span class="kw">await</span> <span class="fn">analyzeFood</span>({
  image: photoUri,
  description: <span class="str">"Homemade chicken biryani, one large plate"</span>,
  options: { detailed: <span class="kw">true</span>, regional: <span class="str">'south-indian'</span> }
});

<span class="cm">// result.nutrients — 32 fields</span>
<span class="cm">// result.items     — per-item breakdown</span>
<span class="cm">// result.insight   — AI-generated suggestion</span>
console.<span class="fn">log</span>(result.total.calories); <span class="cm">// → 680</span></pre>
  </div>

  <!-- ROADMAP -->
  <div class="divider reveal"><span>Roadmap</span></div>
  <h2 class="reveal">What's <span class="accent">coming next</span></h2>
  <div class="roadmap reveal">
    <div class="road-item done">
      <div class="road-label">✓ Shipped</div>
      <div class="road-text">Core photo scan + calorie estimation with multimodal fusion</div>
    </div>
    <div class="road-item done">
      <div class="road-label">✓ Shipped</div>
      <div class="road-text">Natural language description mode + 32-nutrient profiling</div>
    </div>
    <div class="road-item done">
      <div class="road-label">✓ Shipped</div>
      <div class="road-text">Daily goals dashboard with adaptive ML-based recommendations</div>
    </div>
    <div class="road-item">
      <div class="road-label soon">🔥 In Progress</div>
      <div class="road-text">Barcode scanner integration for packaged foods & restaurant QR menus</div>
    </div>
    <div class="road-item">
      <div class="road-label soon">🔥 In Progress</div>
      <div class="road-text">Apple Health & Google Fit two-way sync</div>
    </div>
    <div class="road-item">
      <div class="road-label future">🚀 Planned</div>
      <div class="road-text">Wearable integration — auto calorie logging via Apple Watch food detection</div>
    </div>
    <div class="road-item">
      <div class="road-label future">🚀 Planned</div>
      <div class="road-text">Social meal sharing + community recipe calorie contributions</div>
    </div>
    <div class="road-item">
      <div class="road-label future">🚀 Planned</div>
      <div class="road-text">Dietitian-mode API for clinical nutrition tracking workflows</div>
    </div>
  </div>

  <!-- CONTRIBUTING -->
  <div class="divider reveal"><span>Contributing</span></div>
  <h2 class="reveal"><span class="accent">Open</span> to contributors</h2>
  <p class="reveal" style="color:var(--muted);margin-bottom:1.5rem;font-size:.95rem;">
    NutriLens AI is MIT-licensed and welcomes contributions of all kinds — bug fixes, new cuisine training data, UI improvements, or entirely new features. See <code style="color:var(--green);font-family:'JetBrains Mono',monospace;background:rgba(0,232,123,.08);padding:1px 6px;border-radius:4px;">CONTRIBUTING.md</code> to get started.
  </p>
  <div class="cta-row reveal">
    <a class="btn btn-ghost" href="#">🐛 Report Bug</a>
    <a class="btn btn-ghost" href="#">💡 Request Feature</a>
    <a class="btn btn-primary" href="#">🤝 Submit PR</a>
  </div>

  <!-- FOOTER -->
  <div class="footer reveal">
    <p style="margin-bottom:.5rem;">Built with <span class="heart">♥</span> by <a href="#">Madhan Kumar T</a></p>
    <p>MIT License · NutriLens AI · 2025</p>
    <p style="margin-top:.5rem;font-size:.75rem;opacity:.5;">"Scan smarter. Eat better. Live longer."</p>
  </div>

</div>

<script>
  // Intersection observer for scroll reveals
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));

  // Stagger animation delays for feat-cards
  document.querySelectorAll('.feat-card').forEach((c,i)=>{
    c.style.animationDelay = (i * 0.07) + 's';
  });
</script>
</body>
</html>
