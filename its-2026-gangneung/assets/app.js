/* =========================================================================
   RIDEUS Events × ITS 2026 Gangneung — Transport Portal · shared JS
   reveal-on-scroll · language toggle (UI mock) · booking-lookup modal (UI mock)
   booking.html has its own inline script.
   ========================================================================= */
(function () {
  'use strict';

  var SITE_VERSION = '2026.07.13.1';
  try { console.log('%cRIDEUS Events · ITS 2026 Gangneung · build ' + SITE_VERSION, 'color:#006241;font-weight:700'); } catch (e) {}

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- reveal on scroll (progressive enhancement — no hide by default) ---- */
  function initReveal() {
    // 애니메이션 없이 그냥 표시 — 실제 배포 시 IntersectionObserver로 교체 가능
    return;
  }

  /* ---- language toggle (UI only — labels switch, no real translation in demo) ---- */
  function setLang(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('data-ui-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    var toggle = document.getElementById('langToggle');
    if (toggle) toggle.querySelectorAll('.seg').forEach(function (s) { s.classList.toggle('on', s.dataset.lang === lang); });
    try { localStorage.setItem('itsLang', lang); } catch (e) {}
  }
  function initLang() {
    var saved = 'ko';
    try { saved = localStorage.getItem('itsLang') || 'ko'; } catch (e) {}
    setLang(saved);
    var toggle = document.getElementById('langToggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'ko';
      setLang(cur === 'ko' ? 'en' : 'ko');
      if (window.__rerenderSnakes) window.__rerenderSnakes();
    });
  }

  /* ---- booking-lookup modal (UI mock) ---- */
  function initLookup() {
    var modal = document.getElementById('lookupModal');
    if (!modal) return;
    var openers = [document.getElementById('lookupBtn'), document.getElementById('lookupBtn2')];
    var closeBtn = document.getElementById('lookupClose');
    var submit = document.getElementById('lookupSubmit');
    var result = document.getElementById('lkResult');
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      modal.classList.add('on');
      var code = document.getElementById('lkCode');
      if (code) setTimeout(function () { code.focus(); }, 60);
    }
    function close() {
      modal.classList.remove('on');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    openers.forEach(function (b) { if (b) b.addEventListener('click', open); });
    if (closeBtn) closeBtn.addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('on')) close(); });

    if (submit) submit.addEventListener('click', function () {
      var code = (document.getElementById('lkCode').value || '').trim();
      if (!code) {
        result.innerHTML = '※ 예약번호를 입력해 주세요. (예: RE-ITS-AIR-1234)';
        return;
      }
      result.innerHTML = '✓ <b>' + code.replace(/</g, '&lt;') + '</b> — 데모 예약 1건 확인 (콘셉트 데모이므로 예시 안내만 표시됩니다).';
    });
  }

  /* ---- route diagrams (뱀 구조) + 접이식 전체 시간표 ---- */
  function toMin(s){ var p = String(s).split(':'); return (+p[0]) * 60 + (+p[1]); }
  function toHM(m){ m = ((m % 1440) + 1440) % 1440; var h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; }

  var SVGNS = 'http://www.w3.org/2000/svg';
  function splitName(nm){
    var sp = nm.indexOf(' ');
    if (sp >= 0) return [nm.slice(0, sp), nm.slice(sp + 1)];
    if (nm.length > 8){ var m = Math.ceil(nm.length / 2); return [nm.slice(0, m), nm.slice(m)]; }
    return [nm];
  }
  // 정류장 공용 아이콘(SVG) — 공항/역(기차)/휴게소/호텔/터미널. 그 외(베뉴 등)는 점.
  var LM_ICONS = {
    plane: { fill: 'M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z' },
    train: { stroke: 'M8 3.1V7a4 4 0 0 0 8 0V3.1M9 15l-1-1M15 15l1-1M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5ZM8 19l-2 3M16 19l2 3' },
    rest: { stroke: 'M3 2v7c0 1.1.9 2 2 2a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3ZM21 15v7' },
    hotel: { stroke: 'M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9' },
    bus: { stroke: 'M8 6v6M15 6v6M2 12h19.6M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3M8 18h5', extra: '<circle cx="7" cy="18" r="1.6"/><circle cx="16" cy="18" r="1.6"/>' }
  };
  function iconType(nm){
    if (/역|KTX/.test(nm)) return 'train';
    if (/공항|청사/.test(nm)) return 'plane';
    if (/휴게소/.test(nm)) return 'rest';
    if (/터미널/.test(nm)) return 'bus';
    if (/호텔|리조트|샌드파인|스카이베이|씨마크|세인트존스|모노그램|탑스텐|오션스위트|SL|씨티|썬크루즈/.test(nm)) return 'hotel';
    return null;
  }
  function drawIcon(svg, type, cx, cy){
    var D = 22, s = D / 24;
    var g = document.createElementNS(SVGNS, 'g');
    g.setAttribute('transform', 'translate(' + (cx - D / 2) + ' ' + (cy - D / 2) + ') scale(' + s + ')');
    var ic = LM_ICONS[type];
    if (ic.fill) g.innerHTML = '<path d="' + ic.fill + '" class="lm-ic-fill"/>';
    else g.innerHTML = '<path d="' + ic.stroke + '" class="lm-ic-stroke"/>' + (ic.extra || '');
    svg.appendChild(g);
  }
  // 지하철 노선도 스타일: 하나의 연결선 + 아이콘/번호 정류장 + 대각선 라벨, 뱀(⊐)형 굽이
  function buildSnake(container, stops, numbered){
    var W = container.clientWidth || container.offsetWidth || 900;
    if (W < 60) W = 900;
    var R = 13;
    var PADX = W < 520 ? 42 : 60, TOP = 94, RG = 116, BOT = 30;
    var n = stops.length;
    var minSp = W < 520 ? 104 : 150;
    var cols = Math.max(2, Math.min(n, Math.floor((W - 2 * PADX) / minSp) + 1));
    if (n < cols) cols = n;
    var rows = Math.ceil(n / cols);
    var stepX = cols > 1 ? (W - 2 * PADX) / (cols - 1) : 0;
    var pts = [];
    for (var k = 0; k < n; k++){
      var r = Math.floor(k / cols), i = k - r * cols;
      var col = (r % 2 === 0) ? i : (cols - 1 - i);
      pts.push({ x: PADX + col * stepX, y: TOP + r * RG, s: stops[k], col: col, row: r });
    }
    var H = TOP + (rows - 1) * RG + BOT;
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', H);
    svg.setAttribute('class', 'lm-svg');
    var d = 'M ' + pts[0].x + ' ' + pts[0].y;
    for (var p = 1; p < pts.length; p++) d += ' L ' + pts[p].x + ' ' + pts[p].y;
    var path = document.createElementNS(SVGNS, 'path');
    path.setAttribute('d', d); path.setAttribute('class', 'lm-line');
    svg.appendChild(path);
    pts.forEach(function(pt, idx){
      var hub = pt.s.end;
      var lines = splitName(pt.s.nm);
      var t = document.createElementNS(SVGNS, 'text');
      // 우측 끝 정류장(U자 커넥터가 아래로 내려가는 곳)은 라벨을 좌상향으로 눕혀 선·글씨 겹침 방지
      var rightEdge = (cols > 1 && pt.col === cols - 1 && rows > 1);
      var ax = pt.x + (rightEdge ? -3 : 0), ay = pt.y - (R + 7);
      t.setAttribute('x', ax); t.setAttribute('y', ay);
      t.setAttribute('transform', 'rotate(' + (rightEdge ? 52 : -52) + ' ' + ax + ' ' + ay + ')');
      t.setAttribute('text-anchor', rightEdge ? 'end' : 'start');
      t.setAttribute('class', hub ? 'lm-label lm-label-hub' : 'lm-label');
      lines.forEach(function(ln, li){
        var ts = document.createElementNS(SVGNS, 'tspan');
        ts.setAttribute('x', ax);
        if (li > 0) ts.setAttribute('dy', '1.02em');
        ts.textContent = ln;
        t.appendChild(ts);
      });
      svg.appendChild(t);
      var type = numbered ? null : iconType(pt.s.nm);
      if (numbered) {
        var c = document.createElementNS(SVGNS, 'circle');
        c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.setAttribute('r', R);
        c.setAttribute('class', 'lm-dot lm-num');
        svg.appendChild(c);
        var nt = document.createElementNS(SVGNS, 'text');
        nt.setAttribute('x', pt.x); nt.setAttribute('y', pt.y + 0.5);
        nt.setAttribute('text-anchor', 'middle'); nt.setAttribute('dominant-baseline', 'central');
        nt.setAttribute('class', 'lm-num-t');
        nt.textContent = (idx === n - 1 && pt.s.nm === stops[0].nm) ? '1' : String(idx + 1);
        svg.appendChild(nt);
      } else if (type) {
        drawIcon(svg, type, pt.x, pt.y);
      } else {
        var dd = document.createElementNS(SVGNS, 'circle');
        dd.setAttribute('cx', pt.x); dd.setAttribute('cy', pt.y); dd.setAttribute('r', hub ? 7 : 5.5);
        dd.setAttribute('class', hub ? 'lm-dot lm-hub' : 'lm-dot');
        svg.appendChild(dd);
      }
    });
    container.innerHTML = '';
    container.appendChild(svg);
  }

  function buildTimetable(cfg){
    var out = cfg.stops, segs = cfg.segs || [];
    var full = out.slice(), fullSegs = segs.slice();
    if (cfg.loop){
      full = out.concat(out.slice(0, -1).reverse());
      fullSegs = segs.concat(segs.slice().reverse());
    }
    var off = [0];
    for (var i = 0; i < fullSegs.length; i++) off.push(off[i] + fullSegs[i]);
    var first = toMin(cfg.first), last = toMin(cfg.last), hw = cfg.headway || 30;
    var starts = [];
    for (var t = first; t <= last; t += hw) starts.push(t);

    // 거점(출발·반환점·도착) 강조 — 순환은 출발지/반환점/복귀
    var apex = out.length - 1, lastIdx = full.length - 1;
    function hubType(idx){
      if (idx === 0) return { cls: 'tt-hub', tag: '출발' };
      if (cfg.loop && idx === apex) return { cls: 'tt-hub tt-turn', tag: '반환점' };
      if (idx === lastIdx) return { cls: 'tt-hub', tag: cfg.loop ? '복귀' : '도착' };
      return null;
    }
    var thead = '<tr><th class="tt-n">회차</th>' + full.map(function(nm, idx){
      var h = hubType(idx);
      return '<th' + (h ? ' class="' + h.cls + '"' : '') + '>' + nm + (h ? '<small>' + h.tag + '</small>' : '') + '</th>';
    }).join('') + '</tr>';
    var rows = starts.map(function(T, r){
      return '<tr><td class="tt-n">' + (r + 1) + '</td>' + off.map(function(o, idx){
        var h = hubType(idx);
        return '<td' + (h ? ' class="' + h.cls + '"' : '') + '>' + toHM(T + o) + '</td>';
      }).join('') + '</tr>';
    }).join('');

    return '<details class="tt"><summary><span class="tt-sum-t">📋 전체 시간표 보기</span>' +
      '<span class="tt-sum-m">첫차 ' + cfg.first + ' ~ 막차 ' + cfg.last + ' · ' + starts.length + '회 · 배차 ' + (cfg.headwayLabel || (hw + '분')) + '</span></summary>' +
      '<div class="tt-scroll"><table class="tt-table"><thead>' + thead + '</thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="tt-note">※ 출발 위치(강조 열) 기준 각 정류장 출발 시각. 배차는 ' + (cfg.headwayLabel || '15~60분') + ' 범위이며, 위 표는 ' + hw + '분 간격 예시입니다. 확정 시간표는 조직위 안내에 따릅니다.</p>' +
      '</details>';
  }

  function renderRoute(el){
    var cfg;
    try { cfg = JSON.parse(el.getAttribute('data-config')); } catch (e) { return; }
    var stops = cfg.stops.map(function(nm, i){ return { nm: nm, end: (i === 0 || i === cfg.stops.length - 1) }; });
    var head = '<div class="rd-head"><span class="rd-code' + (cfg.o ? ' o' : '') + '">' + cfg.code + '</span>' +
      '<span class="rd-name">' + cfg.title + '</span>' +
      '<a href="https://rideus.net/its2026/shuttlebus/map" target="_blank" rel="noopener" class="rd-live">📍 실시간 위치 확인 ↗</a></div>';
    var snakeId = 'snk-' + (cfg.code || Math.floor(el.offsetTop));
    el.innerHTML = head + '<div class="snk" data-snake="1"></div>' +
      (cfg.loop ? '<p class="rd-loop">↻ 왕복 순환 — 종점에서 동일 경로로 회차</p>' : '') +
      (cfg.timetable === false ? '' : (cfg.first ? buildTimetable(cfg) : ''));
    el._snakeStops = stops;
    el._numbered = !!cfg.numbered;
    buildSnake(el.querySelector('.snk'), stops, cfg.numbered);
  }

  var _routeEls = [];
  function initRoutes(){
    _routeEls = Array.prototype.slice.call(document.querySelectorAll('.rroute'));
    _routeEls.forEach(renderRoute);
  }
  function rerenderSnakes(){
    _routeEls.forEach(function(el){
      var c = el.querySelector('.snk');
      if (c && el._snakeStops && el.offsetParent !== null) buildSnake(c, el._snakeStops, el._numbered);
    });
  }
  window.__rerenderSnakes = rerenderSnakes;
  var _rt;
  window.addEventListener('resize', function(){ clearTimeout(_rt); _rt = setTimeout(rerenderSnakes, 180); });

  /* ---- 사진/도면 슬라이더 (넘기기 버튼, 자동 슬라이드 없음) ---- */
  function initSliders(){
    document.querySelectorAll('[data-slider]').forEach(function(card){
      var slides = card.querySelector('.pc-slides');
      if (!slides || slides.children.length < 2) return;
      var n = slides.children.length, idx = 0;
      var dots = card.querySelectorAll('.pc-dots span');
      var badge = card.querySelector('.pc-badge');
      var labels = (card.getAttribute('data-labels') || '📷,🗺️').split(',');
      function go(i){
        idx = (i + n) % n;
        slides.style.transform = 'translateX(' + (-idx * 100) + '%)';
        dots.forEach(function(d, di){ d.classList.toggle('on', di === idx); });
        if (badge) badge.textContent = labels[idx] || '';
      }
      var prev = card.querySelector('.pc-nav.prev'), next = card.querySelector('.pc-nav.next');
      if (prev) prev.addEventListener('click', function(){ go(idx - 1); });
      if (next) next.addEventListener('click', function(){ go(idx + 1); });
      go(0);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initLang();
    initLookup();
    initRoutes();
    initSliders();
  });
})();