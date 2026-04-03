const http = require('http');

const PORT = process.env.PORT || 3000;

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Visual Studio — AI Image Generation</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --white:   #ffffff;
      --off:     #f7f6f3;
      --stone:   #eeece8;
      --border:  #e0ddd8;
      --border2: #ccc9c2;
      --ink:     #1a1916;
      --ink2:    #3d3c39;
      --muted:   #8c8a84;
      --radius:  6px;
      --max:     840px;
    }
    html { scroll-behavior: smooth; }
    body { background: var(--white); color: var(--ink); font-family: 'Outfit', sans-serif; font-weight: 400; min-height: 100vh; -webkit-font-smoothing: antialiased; }

    /* NAV */
    nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,.93); backdrop-filter: blur(14px); border-bottom: 1px solid var(--border); padding: 0 40px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
    .logo-wordmark { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; letter-spacing: .01em; color: var(--ink); display: flex; align-items: center; gap: 1px; }
    .logo-wordmark em { font-style: italic; font-weight: 400; }
    .nav-right { display: flex; align-items: center; gap: 16px; }
    .nav-tag { font-size: .7rem; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
    .nav-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,.5); }

    /* HERO */
    .hero { border-bottom: 1px solid var(--border); padding: 68px 40px 60px; text-align: center; }
    .hero-kicker { font-size: .72rem; font-weight: 500; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-bottom: 20px; }
    h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.6rem, 6vw, 4rem); font-weight: 500; line-height: 1.06; letter-spacing: -.01em; color: var(--ink); margin-bottom: 18px; }
    h1 em { font-style: italic; font-weight: 400; }
    .hero-sub { font-size: .93rem; color: var(--muted); line-height: 1.7; max-width: 400px; margin: 0 auto; font-weight: 300; }

    /* PAGE */
    .page { max-width: var(--max); margin: 0 auto; padding: 52px 24px 100px; }

    /* SECTION LABEL */
    .sec-label { font-size: .68rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
    .sec-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

    /* STEPS */
    .steps-row { display: flex; align-items: center; margin-bottom: 44px; padding-bottom: 40px; border-bottom: 1px solid var(--border); }
    .step-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; position: relative; }
    .step-item:not(:last-child)::after { content: ''; position: absolute; top: 14px; left: 50%; width: 100%; height: 1px; background: var(--border); }
    .step-num { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border2); background: var(--white); display: flex; align-items: center; justify-content: center; font-size: .72rem; font-weight: 600; color: var(--muted); z-index: 1; transition: all .3s; }
    .step-item.active .step-num { background: var(--ink); border-color: var(--ink); color: var(--white); }
    .step-item.done   .step-num { background: #22c55e; border-color: #22c55e; color: var(--white); }
    .step-lbl { font-size: .68rem; letter-spacing: .06em; text-transform: uppercase; font-weight: 500; color: var(--muted); text-align: center; }
    .step-item.active .step-lbl { color: var(--ink); }
    .step-item.done   .step-lbl { color: #22c55e; }

    /* UPLOAD GRID */
    .upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px; }
    @media (max-width: 580px) {
      .upload-grid { grid-template-columns: 1fr; }
      nav { padding: 0 20px; }
      .hero { padding: 48px 20px; }
      .page { padding: 36px 16px 80px; }
      .options-row { flex-direction: column; }
    }

    .upload-field-label { font-size: .78rem; font-weight: 500; color: var(--ink2); margin-bottom: 8px; }

    /* INPUT MODE TABS */
    .input-tabs { display: flex; border: 1px solid var(--border2); border-radius: var(--radius); overflow: hidden; margin-bottom: 10px; }
    .input-tab {
      flex: 1; padding: 7px 0; font-size: .72rem; font-weight: 500; text-align: center;
      cursor: pointer; background: var(--off); color: var(--muted);
      border: none; font-family: 'Outfit', sans-serif; transition: all .2s;
      display: flex; align-items: center; justify-content: center; gap: 5px;
    }
    .input-tab:not(:last-child) { border-right: 1px solid var(--border2); }
    .input-tab.active { background: var(--ink); color: var(--white); }
    .input-tab svg { flex-shrink: 0; }

    /* UPLOAD ZONE */
    .upload-zone {
      position: relative;
      border: 1.5px dashed var(--border2);
      border-radius: var(--radius);
      background: var(--off);
      min-height: 216px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      transition: border-color .2s, background .2s;
      overflow: hidden;
    }
    .upload-zone:hover { border-color: var(--ink); background: var(--stone); }
    .upload-zone.drag-over { border-color: var(--ink); background: var(--stone); border-style: solid; }
    .upload-zone.has-image { border-style: solid; border-color: var(--border2); }

    .upload-zone input[type="file"] {
      position: absolute; inset: 0; opacity: 0; cursor: pointer; z-index: 5; width: 100%; height: 100%;
    }

    .upload-preview { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border-radius: calc(var(--radius) - 1px); display: none; pointer-events: none; }

    .upload-hover-overlay {
      position: absolute; inset: 0; background: rgba(247,246,243,.88);
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
      opacity: 0; transition: opacity .2s; border-radius: calc(var(--radius) - 1px);
      pointer-events: none; z-index: 4;
    }
    .upload-zone.has-image:hover .upload-hover-overlay { opacity: 1; }

    .upload-icon-box { width: 44px; height: 44px; border: 1px solid var(--border2); border-radius: 8px; background: var(--white); display: flex; align-items: center; justify-content: center; margin-bottom: 2px; pointer-events: none; }
    .upload-title-text { font-size: .85rem; font-weight: 500; color: var(--ink2); pointer-events: none; }
    .upload-hint-text { font-size: .73rem; color: var(--muted); text-align: center; line-height: 1.5; pointer-events: none; }
    .upload-browse-btn {
      margin-top: 4px; padding: 7px 16px; border-radius: var(--radius);
      background: var(--white); border: 1px solid var(--border2);
      font-family: 'Outfit', sans-serif; font-size: .75rem; font-weight: 500; color: var(--ink);
      cursor: pointer; pointer-events: none; transition: border-color .2s;
    }
    .upload-zone:hover .upload-browse-btn { border-color: var(--ink); }
    .upload-fname { font-size: .7rem; color: var(--ink); font-weight: 500; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: var(--stone); border: 1px solid var(--border); border-radius: 4px; padding: 3px 8px; pointer-events: none; display: none; }

    /* URL INPUT AREA */
    .url-input-wrap { display: none; }
    .url-input-wrap.show { display: block; }

    .url-field-box {
      border: 1.5px dashed var(--border2);
      border-radius: var(--radius);
      background: var(--off);
      min-height: 216px;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      padding: 20px 18px;
      gap: 12px;
      transition: border-color .2s;
    }
    .url-field-box:focus-within { border-color: var(--ink); border-style: solid; background: var(--stone); }
    .url-field-box.has-url { border-style: solid; border-color: var(--border2); background: var(--white); padding: 0; overflow: hidden; min-height: unset; }

    .url-input-inner { display: flex; flex-direction: column; gap: 10px; align-items: center; }
    .url-field-box.has-url .url-input-inner { display: none; }

    .url-placeholder-icon { width: 44px; height: 44px; border: 1px solid var(--border2); border-radius: 8px; background: var(--white); display: flex; align-items: center; justify-content: center; }
    .url-placeholder-title { font-size: .85rem; font-weight: 500; color: var(--ink2); }
    .url-placeholder-hint { font-size: .73rem; color: var(--muted); text-align: center; line-height: 1.5; }

    .url-text-input {
      width: 100%; height: 40px; border: 1px solid var(--border2); border-radius: var(--radius);
      background: var(--white); padding: 0 12px;
      font-family: 'Outfit', sans-serif; font-size: .83rem; color: var(--ink);
      outline: none; transition: border-color .2s;
    }
    .url-text-input::placeholder { color: var(--muted); }
    .url-text-input:focus { border-color: var(--ink); }

    .url-confirm-btn {
      padding: 8px 20px; border-radius: var(--radius);
      background: var(--ink); border: none; color: var(--white);
      font-family: 'Outfit', sans-serif; font-size: .75rem; font-weight: 500;
      cursor: pointer; transition: background .2s; align-self: flex-end;
    }
    .url-confirm-btn:hover { background: var(--ink2); }

    /* URL preview once confirmed */
    .url-preview-img-wrap { position: relative; }
    .url-preview-img-wrap img { width: 100%; max-height: 216px; object-fit: cover; display: block; border-radius: calc(var(--radius) - 2px); }
    .url-preview-bar {
      padding: 10px 14px; border-top: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
    }
    .url-preview-label { font-size: .72rem; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; }
    .url-clear-btn {
      flex-shrink: 0; padding: 4px 10px; font-size: .7rem; font-weight: 500;
      border: 1px solid var(--border2); border-radius: 4px; background: var(--white);
      color: var(--ink); cursor: pointer; font-family: 'Outfit', sans-serif;
      transition: border-color .2s;
    }
    .url-clear-btn:hover { border-color: var(--ink); }

    /* OPTIONS ROW */
    .options-row { display: flex; gap: 16px; margin-top: 28px; margin-bottom: 0; }
    .option-field { flex: 1; }
    .option-field .sec-label { margin-bottom: 10px; }

    .select-wrap {
      position: relative;
      border: 1px solid var(--border2);
      border-radius: var(--radius);
      background: var(--white);
      overflow: hidden;
      transition: border-color .2s, box-shadow .2s;
    }
    .select-wrap:focus-within { border-color: var(--ink); box-shadow: 0 0 0 3px rgba(26,25,22,.06); }
    .select-wrap select {
      width: 100%; height: 44px; border: none; outline: none;
      background: transparent; padding: 0 36px 0 14px;
      font-family: 'Outfit', sans-serif; font-size: .88rem; color: var(--ink);
      cursor: pointer; appearance: none; -webkit-appearance: none;
    }
    .select-arrow {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      pointer-events: none; color: var(--muted);
    }

    /* PROMPT */
    .prompt-wrap { position: relative; margin-top: 28px; margin-bottom: 36px; }
    textarea { width: 100%; min-height: 110px; border: 1px solid var(--border2); border-radius: var(--radius); background: var(--white); color: var(--ink); font-family: 'Outfit', sans-serif; font-size: .9rem; font-weight: 300; line-height: 1.7; padding: 16px 18px 36px; outline: none; resize: vertical; transition: border-color .2s, box-shadow .2s; }
    textarea::placeholder { color: var(--muted); }
    textarea:focus { border-color: var(--ink); box-shadow: 0 0 0 3px rgba(26,25,22,.06); }
    .char-count { position: absolute; bottom: 12px; right: 14px; font-size: .7rem; color: var(--muted); }

    /* SUBMIT */
    .btn-submit { width: 100%; height: 52px; background: var(--ink); color: var(--white); font-family: 'Outfit', sans-serif; font-size: .88rem; font-weight: 500; letter-spacing: .04em; border: none; border-radius: var(--radius); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background .2s, transform .15s; }
    .btn-submit:hover { background: var(--ink2); transform: translateY(-1px); }
    .btn-submit:active { transform: translateY(0); }
    .btn-submit:disabled { opacity: .45; cursor: not-allowed; transform: none; }

    /* SPINNER */
    .spinner { width: 16px; height: 16px; border: 1.5px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; display: none; flex-shrink: 0; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* PROCESSING */
    .processing-state { display: none; text-align: center; padding: 22px 0 16px; }
    .processing-state.show { display: block; }
    .processing-dots { display: flex; justify-content: center; gap: 6px; margin-bottom: 12px; }
    .processing-dots span { width: 6px; height: 6px; background: var(--border2); border-radius: 50%; animation: dot-pulse 1.4s ease-in-out infinite; }
    .processing-dots span:nth-child(2) { animation-delay: .2s; }
    .processing-dots span:nth-child(3) { animation-delay: .4s; }
    @keyframes dot-pulse { 0%, 80%, 100% { background: var(--border2); transform: scale(.8); } 40% { background: var(--ink); transform: scale(1); } }
    .processing-label { font-size: .82rem; color: var(--muted); font-weight: 300; }

    /* RESULT */
    #result-section { margin-top: 40px; display: none; animation: fadeUp .4s cubic-bezier(.16,1,.3,1); }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .result-success { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--white); }
    .result-image-area { background: var(--off); min-height: 180px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
    .result-image-area img { width: 100%; max-height: 620px; object-fit: contain; display: none; }
    .result-img-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px; position: absolute; }
    .result-img-loading .ld-spin { width: 20px; height: 20px; border: 1.5px solid var(--border2); border-top-color: var(--ink); border-radius: 50%; animation: spin .7s linear infinite; }
    .result-bar { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
    .result-bar-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
    .result-check { width: 22px; height: 22px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .result-ready-text { font-size: .82rem; font-weight: 500; color: var(--ink); }
    .result-actions { display: flex; gap: 8px; flex-shrink: 0; }
    .result-error { border: 1px solid #fecaca; border-radius: var(--radius); background: #fff5f5; padding: 20px 22px; display: flex; gap: 14px; align-items: flex-start; }
    .error-icon { width: 28px; height: 28px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
    .error-title { font-size: .85rem; font-weight: 600; color: #b91c1c; margin-bottom: 4px; }
    .error-msg { font-size: .82rem; color: #7f1d1d; line-height: 1.6; }

    /* BUTTONS */
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: var(--radius); font-family: 'Outfit', sans-serif; font-size: .78rem; font-weight: 500; letter-spacing: .02em; cursor: pointer; border: 1px solid; transition: all .18s; text-decoration: none; white-space: nowrap; }
    .btn-primary { background: var(--ink); border-color: var(--ink); color: var(--white); }
    .btn-primary:hover { background: var(--ink2); border-color: var(--ink2); }
    .btn-outline { background: var(--white); border-color: var(--border2); color: var(--ink); }
    .btn-outline:hover { border-color: var(--ink); }

    /* TOAST */
    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(80px); background: var(--ink); color: var(--white); font-size: .8rem; padding: 10px 22px; border-radius: 100px; z-index: 999; opacity: 0; transition: all .3s cubic-bezier(.16,1,.3,1); white-space: nowrap; pointer-events: none; }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

    /* FOOTER */
    footer { border-top: 1px solid var(--border); padding: 24px 40px; display: flex; align-items: center; justify-content: space-between; }
    .footer-note { font-size: .72rem; color: var(--muted); }
  </style>
</head>
<body>

  <!-- NAV -->
  <nav>
    <div class="logo-wordmark">Cody <em>Deer</em></div>
  </nav>

  <!-- HERO -->
  <div class="hero">
    <div class="hero-kicker">AI Image Generation</div>
    <h1>Drop a template.<br/><em>Dress it. Generate it.</em></h1>
    <p class="hero-sub">Upload your template and product images — or paste a URL — describe the vision, and the workflow returns the generated image instantly.</p>
  </div>

  <!-- PAGE -->
  <div class="page">

    <!-- Steps -->
    <div class="steps-row">
      <div class="step-item active" id="step-1">
        <div class="step-num">1</div>
        <div class="step-lbl">Upload</div>
      </div>
      <div class="step-item" id="step-2">
        <div class="step-num">2</div>
        <div class="step-lbl">Configure</div>
      </div>
      <div class="step-item" id="step-3">
        <div class="step-num">3</div>
        <div class="step-lbl">Prompt</div>
      </div>
      <div class="step-item" id="step-4">
        <div class="step-num">4</div>
        <div class="step-lbl">Process</div>
      </div>
      <div class="step-item" id="step-5">
        <div class="step-num">5</div>
        <div class="step-lbl">Result</div>
      </div>
    </div>

    <!-- Assets -->
    <div class="sec-label">Assets</div>
    <div class="upload-grid">

      <!-- ── Template Image ── -->
      <div>
        <div class="upload-field-label">Template Image</div>

        <!-- Tabs -->
        <div class="input-tabs">
          <button class="input-tab active" id="tab-template-file" onclick="switchMode('template','file')">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload File
          </button>
          <button class="input-tab" id="tab-template-url" onclick="switchMode('template','url')">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Paste URL
          </button>
        </div>

        <!-- File Upload Zone -->
        <div id="file-wrap-template">
          <div class="upload-zone" id="zone-template"
            ondragover="onDragOver(event,'template')"
            ondragleave="onDragLeave('template')"
            ondrop="onDrop(event,'template')">
            <input type="file" id="templateFile" accept="image/*" onchange="handleFile(event,'template')" />
            <img class="upload-preview" id="preview-template" alt="" />
            <div class="upload-hover-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span style="font-size:.75rem;font-weight:500;color:var(--ink)">Replace</span>
            </div>
            <div class="upload-icon-box" id="icon-template">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
            </div>
            <div class="upload-title-text" id="title-template">Template Image</div>
            <div class="upload-hint-text" id="hint-template">PNG · JPG · WEBP · up to 10MB</div>
            <div class="upload-browse-btn" id="browse-template">Browse file</div>
            <div class="upload-fname" id="fname-template"></div>
          </div>
        </div>

        <!-- URL Input Zone -->
        <div class="url-input-wrap" id="url-wrap-template">
          <div class="url-field-box" id="urlbox-template">
            <div class="url-input-inner">
              <div class="url-placeholder-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div class="url-placeholder-title">Paste image URL</div>
              <div class="url-placeholder-hint">Direct link to PNG · JPG · WEBP</div>
              <input class="url-text-input" id="url-input-template" type="url"
                placeholder="https://example.com/image.jpg"
                oninput="onURLInput('template')"
                onkeydown="if(event.key==='Enter') confirmURL('template')" />
              <button class="url-confirm-btn" onclick="confirmURL('template')">Use this URL</button>
            </div>
            <!-- Preview after confirmation -->
            <div class="url-preview-img-wrap" id="url-preview-wrap-template" style="display:none;">
              <img id="url-preview-img-template" src="" alt="Template preview"
                onerror="onURLPreviewError('template')" />
              <div class="url-preview-bar">
                <span class="url-preview-label" id="url-preview-label-template"></span>
                <button class="url-clear-btn" onclick="clearURL('template')">Change</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Product Image ── -->
      <div>
        <div class="upload-field-label">Product Image</div>

        <!-- Tabs -->
        <div class="input-tabs">
          <button class="input-tab active" id="tab-product-file" onclick="switchMode('product','file')">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload File
          </button>
          <button class="input-tab" id="tab-product-url" onclick="switchMode('product','url')">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            Paste URL
          </button>
        </div>

        <!-- File Upload Zone -->
        <div id="file-wrap-product">
          <div class="upload-zone" id="zone-product"
            ondragover="onDragOver(event,'product')"
            ondragleave="onDragLeave('product')"
            ondrop="onDrop(event,'product')">
            <input type="file" id="productFile" accept="image/*" onchange="handleFile(event,'product')" />
            <img class="upload-preview" id="preview-product" alt="" />
            <div class="upload-hover-overlay">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span style="font-size:.75rem;font-weight:500;color:var(--ink)">Replace</span>
            </div>
            <div class="upload-icon-box" id="icon-product">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div class="upload-title-text" id="title-product">Product Image</div>
            <div class="upload-hint-text" id="hint-product">PNG · JPG · WEBP · up to 10MB</div>
            <div class="upload-browse-btn" id="browse-product">Browse file</div>
            <div class="upload-fname" id="fname-product"></div>
          </div>
        </div>

        <!-- URL Input Zone -->
        <div class="url-input-wrap" id="url-wrap-product">
          <div class="url-field-box" id="urlbox-product">
            <div class="url-input-inner">
              <div class="url-placeholder-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <div class="url-placeholder-title">Paste image URL</div>
              <div class="url-placeholder-hint">Direct link to PNG · JPG · WEBP</div>
              <input class="url-text-input" id="url-input-product" type="url"
                placeholder="https://example.com/image.jpg"
                oninput="onURLInput('product')"
                onkeydown="if(event.key==='Enter') confirmURL('product')" />
              <button class="url-confirm-btn" onclick="confirmURL('product')">Use this URL</button>
            </div>
            <!-- Preview after confirmation -->
            <div class="url-preview-img-wrap" id="url-preview-wrap-product" style="display:none;">
              <img id="url-preview-img-product" src="" alt="Product preview"
                onerror="onURLPreviewError('product')" />
              <div class="url-preview-bar">
                <span class="url-preview-label" id="url-preview-label-product"></span>
                <button class="url-clear-btn" onclick="clearURL('product')">Change</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /upload-grid -->

    <!-- Options Row: Aspect Ratio + Quality -->
    <div class="options-row">
      <div class="option-field">
        <div class="sec-label">Aspect Ratio</div>
        <div class="select-wrap">
          <select id="aspectRatio">
            <option value="1:1">1 : 1 — Square</option>
            <option value="4:3">4 : 3 — Standard</option>
            <option value="16:9" selected>16 : 9 — Widescreen</option>
            <option value="9:16">9 : 16 — Portrait</option>
            <option value="3:4">3 : 4 — Tall</option>
          </select>
          <div class="select-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>
      <div class="option-field">
        <div class="sec-label">Quality</div>
        <div class="select-wrap">
          <select id="quality">
            <option value="720">720p — Standard</option>
            <option value="1080" selected>1080p — High Definition</option>
          </select>
          <div class="select-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Prompt -->
    <div class="prompt-wrap">
      <div class="sec-label" style="margin-top:28px;">Prompt</div>
      <textarea id="promptText" maxlength="600"
        placeholder="Describe the scene, style, and mood — e.g. 'Fashion editorial, soft natural light, the template wearing the product in a minimalist studio setting…'"
        oninput="updateCharCount()"></textarea>
      <span class="char-count" id="charCount">0 / 600</span>
    </div>

    <!-- Processing -->
    <div class="processing-state" id="processingState">
      <div class="processing-dots"><span></span><span></span><span></span></div>
      <div class="processing-label">Sending to n8n — this usually takes 15–60 seconds</div>
    </div>

    <!-- Submit -->
    <button class="btn-submit" id="submitBtn" onclick="submitJob()">
      <div class="spinner" id="spinner"></div>
      <svg id="btnIcon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
      <span id="btnText">Generate Image</span>
    </button>

    <!-- Result -->
    <div id="result-section"></div>

  </div>

  <!-- FOOTER -->
  <footer>
    <div class="logo-wordmark" style="font-size:1rem;opacity:.6;">Cody <em>Deer</em></div>
  </footer>

  <div class="toast" id="toast"></div>

  <script>
    const WEBHOOK_URL = 'https://primary-production-a830.up.railway.app/webhook/f7ce9781-f8fa-4b16-a7fc-09139c14fb78';

    // ── State ──────────────────────────────────────────────────────────────
    const state = {
      template: null,       // { base64, mime, name } when file uploaded
      product:  null,
      templateMode: 'file', // 'file' | 'url'
      productMode:  'file',
      templateURL: '',      // confirmed URL string
      productURL:  ''
    };
    let currentObjectUrl = null;

    // ── Mode switcher ──────────────────────────────────────────────────────
    function switchMode(type, mode) {
      state[type + 'Mode'] = mode;

      // Update tab buttons
      document.getElementById('tab-' + type + '-file').classList.toggle('active', mode === 'file');
      document.getElementById('tab-' + type + '-url').classList.toggle('active', mode === 'url');

      // Show/hide panels
      document.getElementById('file-wrap-' + type).style.display = mode === 'file' ? 'block' : 'none';
      document.getElementById('url-wrap-'  + type).classList.toggle('show', mode === 'url');

      updateSteps();
    }

    // ── File handling ──────────────────────────────────────────────────────
    function handleFile(e, type) {
      const file = e.target.files[0];
      if (file) applyFile(file, type);
    }

    function applyFile(file, type) {
      if (!file.type.startsWith('image/')) { showToast('Please upload an image file.'); return; }
      if (file.size > 10 * 1024 * 1024)   { showToast('File must be under 10MB.'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        state[type] = { base64: ev.target.result.split(',')[1], mime: file.type, name: file.name };
        const preview = document.getElementById('preview-' + type);
        preview.src = ev.target.result;
        preview.style.display = 'block';
        document.getElementById('icon-'    + type).style.display = 'none';
        document.getElementById('title-'   + type).style.display = 'none';
        document.getElementById('hint-'    + type).style.display = 'none';
        document.getElementById('browse-'  + type).style.display = 'none';
        const fname = document.getElementById('fname-' + type);
        fname.textContent   = file.name;
        fname.style.display = 'block';
        document.getElementById('zone-' + type).classList.add('has-image');
        updateSteps();
      };
      reader.readAsDataURL(file);
    }

    function onDragOver(e, type) { e.preventDefault(); document.getElementById('zone-' + type).classList.add('drag-over'); }
    function onDragLeave(type)   { document.getElementById('zone-' + type).classList.remove('drag-over'); }
    function onDrop(e, type) {
      e.preventDefault();
      document.getElementById('zone-' + type).classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) applyFile(file, type);
    }

    // ── URL handling ───────────────────────────────────────────────────────
    function onURLInput(type) {
      // Live-clear confirmed state if user edits
      if (state[type + 'URL']) {
        state[type + 'URL'] = '';
        document.getElementById('urlbox-' + type).classList.remove('has-url');
        document.getElementById('url-preview-wrap-' + type).style.display = 'none';
      }
      updateSteps();
    }

    function confirmURL(type) {
      const input = document.getElementById('url-input-' + type);
      const url   = input.value.trim();
      if (!url) { showToast('Please paste a URL first.'); return; }
      if (!isValidURL(url)) { showToast('Please enter a valid URL starting with http:// or https://'); return; }

      state[type + 'URL'] = url;

      // Show preview
      const box       = document.getElementById('urlbox-' + type);
      const previewW  = document.getElementById('url-preview-wrap-' + type);
      const previewI  = document.getElementById('url-preview-img-' + type);
      const label     = document.getElementById('url-preview-label-' + type);

      previewI.src    = url;
      label.textContent = url;
      previewW.style.display = 'block';
      box.classList.add('has-url');
      updateSteps();
    }

    function clearURL(type) {
      state[type + 'URL'] = '';
      const box      = document.getElementById('urlbox-' + type);
      const previewW = document.getElementById('url-preview-wrap-' + type);
      const input    = document.getElementById('url-input-' + type);
      box.classList.remove('has-url');
      previewW.style.display = 'none';
      input.value = '';
      updateSteps();
    }

    function onURLPreviewError(type) {
      showToast('Could not load image from that URL. Try another link.');
      clearURL(type);
    }

    function isValidURL(str) {
      try { const u = new URL(str); return u.protocol === 'http:' || u.protocol === 'https:'; }
      catch { return false; }
    }

    // ── Steps & char count ─────────────────────────────────────────────────
    function updateCharCount() {
      const len = document.getElementById('promptText').value.length;
      document.getElementById('charCount').textContent = len + ' / 600';
      updateSteps();
    }

    function hasAsset(type) {
      if (state[type + 'Mode'] === 'file') return !!state[type];
      return !!state[type + 'URL'];
    }

    function updateSteps() {
      const hasTemplate = hasAsset('template');
      const hasProduct  = hasAsset('product');
      const hasPrompt   = document.getElementById('promptText').value.trim().length > 0;
      setStep(1, hasTemplate && hasProduct ? 'done' : 'active');
      setStep(2, hasTemplate && hasProduct ? 'done' : '');
      setStep(3, hasPrompt ? 'done' : (hasTemplate && hasProduct ? 'active' : ''));
    }

    function setStep(n, status) {
      const el = document.getElementById('step-' + n);
      el.classList.remove('active', 'done');
      if (status) el.classList.add(status);
    }

    // ── Submit ─────────────────────────────────────────────────────────────
    async function submitJob() {
      const prompt      = document.getElementById('promptText').value.trim();
      const aspectRatio = document.getElementById('aspectRatio').value;
      const quality     = document.getElementById('quality').value;

      // Validate template
      if (state.templateMode === 'file' && !state.template) {
        showToast('Please upload a template image.'); return;
      }
      if (state.templateMode === 'url' && !state.templateURL) {
        showToast('Please confirm a template image URL.'); return;
      }
      // Validate product
      if (state.productMode === 'file' && !state.product) {
        showToast('Please upload a product image.'); return;
      }
      if (state.productMode === 'url' && !state.productURL) {
        showToast('Please confirm a product image URL.'); return;
      }
      if (!prompt) { showToast('Please enter a prompt.'); return; }

      setLoading(true);
      setStep(4, 'active');
      document.getElementById('result-section').style.display = 'none';

      if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; }

      // Build payload — file fields empty when URL mode, URL fields empty when file mode
      const templateIsFile = state.templateMode === 'file';
      const productIsFile  = state.productMode  === 'file';

      const payload = {
        templateImage: {
          data:     templateIsFile ? state.template.base64 : '',
          mimeType: templateIsFile ? state.template.mime   : '',
          filename: templateIsFile ? state.template.name   : ''
        },
        productImage: {
          data:     productIsFile ? state.product.base64 : '',
          mimeType: productIsFile ? state.product.mime   : '',
          filename: productIsFile ? state.product.name   : ''
        },
        templateURL: templateIsFile ? '' : state.templateURL,
        productURL:  productIsFile  ? '' : state.productURL,
        prompt,
        aspectRatio,
        quality
      };

      try {
        const res = await fetch(WEBHOOK_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload)
        });

        if (!res.ok) {
          let msg = 'HTTP ' + res.status;
          try { const d = await res.json(); msg = d.message || d.error || msg; } catch {}
          throw new Error(msg);
        }

        const contentType = res.headers.get('content-type') || '';

        if (contentType.startsWith('image/')) {
          const blob = await res.blob();
          currentObjectUrl = URL.createObjectURL(blob);
          const ext = contentType.split('/')[1]?.split(';')[0] || 'png';
          renderResult(currentObjectUrl, 'generated-image.' + ext);
        } else {
          let data = {};
          try { data = await res.json(); } catch {}
          const link = data.url || data.link || data.result || data.output || data.imageUrl || data.image_url || data.image || '';
          if (!link) throw new Error('n8n responded but returned no image. Check your Respond to Webhook node.');
          renderResult(link, 'generated-image.png');
        }

        setStep(4, 'done');
        setStep(5, 'active');

      } catch (err) {
        renderError(err.message || 'Something went wrong.');
        setStep(4, '');
      } finally {
        setLoading(false);
      }
    }

    // ── Render result ──────────────────────────────────────────────────────
    function renderResult(src, filename) {
      const section = document.getElementById('result-section');
      section.innerHTML = \`
        <div class="result-success">
          <div class="result-image-area" id="imgArea">
            <div class="result-img-loading" id="imgLoading">
              <div class="ld-spin"></div>
              <span>Loading generated image…</span>
            </div>
            <img id="generatedImg" src="\${src}" alt="Generated result"
              onload="onImgLoad()" onerror="onImgError('\${src}')" />
          </div>
          <div class="result-bar">
            <div class="result-bar-left">
              <div class="result-check">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span class="result-ready-text">Image ready</span>
            </div>
            <div class="result-actions">
              <button class="btn btn-outline" onclick="copyLink('\${src}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy URL
              </button>
              <a class="btn btn-primary" href="\${src}" download="\${filename}">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download Image
              </a>
            </div>
          </div>
        </div>\`;
      section.style.display = 'block';
    }

    function onImgLoad() {
      const loading = document.getElementById('imgLoading');
      const img     = document.getElementById('generatedImg');
      if (loading) loading.style.display = 'none';
      if (img)     img.style.display     = 'block';
    }

    function onImgError(src) {
      const area = document.getElementById('imgArea');
      if (!area) return;
      area.innerHTML = \`
        <div style="padding:44px;text-align:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="var(--border2)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
            style="display:block;margin:0 auto 14px">
            <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <div style="font-size:.85rem;font-weight:500;color:var(--ink);margin-bottom:6px;">Preview unavailable</div>
          <div style="font-size:.74rem;color:var(--muted);max-width:340px;margin:0 auto;word-break:break-all;line-height:1.6">\${src}</div>
          <div style="font-size:.72rem;color:var(--muted);margin-top:10px;opacity:.65">Use the Download button below to save the file.</div>
        </div>\`;
    }

    function renderError(msg) {
      const section = document.getElementById('result-section');
      section.innerHTML = \`
        <div class="result-error">
          <div class="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="#b91c1c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <div>
            <div class="error-title">Workflow error</div>
            <div class="error-msg">\${msg}</div>
          </div>
        </div>\`;
      section.style.display = 'block';
    }

    function setLoading(on) {
      const btn = document.getElementById('submitBtn');
      btn.disabled = on;
      document.getElementById('spinner').style.display  = on ? 'block' : 'none';
      document.getElementById('btnIcon').style.display  = on ? 'none'  : 'block';
      document.getElementById('btnText').textContent    = on ? 'Generating…' : 'Generate Image';
      document.getElementById('processingState').classList.toggle('show', on);
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }

    function copyLink(link) {
      navigator.clipboard.writeText(link).then(() => showToast('URL copied to clipboard'));
    }
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(HTML);
});

server.listen(PORT, () => {
  console.log('Visual Studio running on port ' + PORT);
});
