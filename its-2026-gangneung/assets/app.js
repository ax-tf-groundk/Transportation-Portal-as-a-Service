/* =========================================================================
   RIDEUS Events × ITS 2026 Gangneung — Transport Portal · shared JS
   reveal-on-scroll · language toggle (UI mock) · booking-lookup modal (UI mock)
   booking.html has its own inline script.
   ========================================================================= */
(function () {
  'use strict';

  var SITE_VERSION = '2026.07.10.3';
  try { console.log('%cRIDEUS Events · ITS 2026 Gangneung · build ' + SITE_VERSION, 'color:#006241;font-weight:700'); } catch (e) {}

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- reveal on scroll (progressive enhancement — no hide by default) ---- */
  function initReveal() {
    // 애니메이션 없이 그냥 표시 — 실제 배포 시 IntersectionObserver로 교체 가능
    return;
  }

  /* ---- language toggle (UI only — labels switch, no real translation in demo) ---- */
  function initLang() {
    var toggle = document.getElementById('langToggle');
    if (!toggle) return;
    var segs = toggle.querySelectorAll('.seg');
    toggle.addEventListener('click', function () {
      var active = toggle.querySelector('.seg.on');
      var next = active && active.dataset.lang === 'ko' ? 'en' : 'ko';
      Array.prototype.forEach.call(segs, function (s) { s.classList.toggle('on', s.dataset.lang === next); });
      document.documentElement.setAttribute('data-ui-lang', next);
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
  // 지하철 노선도 스타일: 하나의 연결선 + 원(정류장) + 대각선 라벨, 뱀(⊐)형 굽이
  function buildSnake(container, stops){
    var W = container.clientWidth || container.offsetWidth || 900;
    if (W < 60) W = 900;
    var PADX = W < 520 ? 40 : 58, TOP = 84, RG = 106, BOT = 26;
    var n = stops.length;
    var minSp = W < 520 ? 92 : 126;
    var cols = Math.max(2, Math.min(n, Math.floor((W - 2 * PADX) / minSp) + 1));
    if (n < cols) cols = n;
    var rows = Math.ceil(n / cols);
    var stepX = cols > 1 ? (W - 2 * PADX) / (cols - 1) : 0;
    var pts = [];
    for (var k = 0; k < n; k++){
      var r = Math.floor(k / cols), i = k - r * cols;
      var col = (r % 2 === 0) ? i : (cols - 1 - i);
      pts.push({ x: PADX + col * stepX, y: TOP + r * RG, s: stops[k] });
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
    pts.forEach(function(pt){
      var hub = pt.s.end;
      var lines = splitName(pt.s.nm);
      var t = document.createElementNS(SVGNS, 'text');
      var ax = pt.x, ay = pt.y - 14;
      t.setAttribute('x', ax); t.setAttribute('y', ay);
      t.setAttribute('transform', 'rotate(-52 ' + ax + ' ' + ay + ')');
      t.setAttribute('class', hub ? 'lm-label lm-label-hub' : 'lm-label');
      lines.forEach(function(ln, li){
        var ts = document.createElementNS(SVGNS, 'tspan');
        ts.setAttribute('x', ax);
        if (li > 0) ts.setAttribute('dy', '1.02em');
        ts.textContent = ln;
        t.appendChild(ts);
      });
      svg.appendChild(t);
      var c = document.createElementNS(SVGNS, 'circle');
      c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y);
      c.setAttribute('r', hub ? 8 : 6);
      c.setAttribute('class', hub ? 'lm-dot lm-hub' : 'lm-dot');
      svg.appendChild(c);
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
      '<button type="button" class="rd-live" data-live="1">📍 실시간 위치 확인</button></div>';
    var snakeId = 'snk-' + (cfg.code || Math.floor(el.offsetTop));
    el.innerHTML = head + '<div class="snk" data-snake="1"></div>' +
      (cfg.loop ? '<p class="rd-loop">↻ 왕복 순환 — 종점에서 동일 경로로 회차</p>' : '') +
      (cfg.timetable === false ? '' : (cfg.first ? buildTimetable(cfg) : ''));
    el._snakeStops = stops;
    buildSnake(el.querySelector('.snk'), stops);
  }

  var _routeEls = [];
  function initRoutes(){
    _routeEls = Array.prototype.slice.call(document.querySelectorAll('.rroute'));
    _routeEls.forEach(renderRoute);
  }
  function rerenderSnakes(){
    _routeEls.forEach(function(el){
      var c = el.querySelector('.snk');
      if (c && el._snakeStops && el.offsetParent !== null) buildSnake(c, el._snakeStops);
    });
  }
  window.__rerenderSnakes = rerenderSnakes;
  // 실시간 위치 확인 (데모 — 실제 트래킹 미제공)
  document.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.rd-live') : null;
    if (!b || b.getAttribute('data-busy')) return;
    var old = b.textContent; b.setAttribute('data-busy', '1');
    b.textContent = '📍 준비 중입니다 (데모)';
    setTimeout(function(){ b.textContent = old; b.removeAttribute('data-busy'); }, 1800);
  });
  var _rt;
  window.addEventListener('resize', function(){ clearTimeout(_rt); _rt = setTimeout(rerenderSnakes, 180); });

  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initLang();
    initLookup();
    initRoutes();
  });
})();