/* =========================================================================
   RIDEUS Events × ITS 2026 Gangneung — Transport Portal · shared JS
   reveal-on-scroll · language toggle (UI mock) · booking-lookup modal (UI mock)
   booking.html has its own inline script.
   ========================================================================= */
(function () {
  'use strict';

  var SITE_VERSION = '2026.07.13.10';
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
    var parts = nm.split(' ');
    // 3단어 이상이고 길면 3줄로 분할(예: Shilla Monogram Gangneung) — 박스 밖 이탈 방지
    if (parts.length >= 3 && nm.length > 19){
      return [parts[0], parts[1], parts.slice(2).join(' ')];
    }
    var sp = nm.indexOf(' ');
    if (sp >= 0) return [nm.slice(0, sp), nm.slice(sp + 1)];
    if (nm.length > 8){ var m = Math.ceil(nm.length / 2); return [nm.slice(0, m), nm.slice(m)]; }
    return [nm];
  }
  // 거점 이름·노선 제목 영문 대응표 (노선도/시간표 언어 토글용)
  var STOP_EN = {
    '강릉올림픽파크': 'Gangneung Olympic Park',
    '강릉오발': 'Gangneung Oval',
    '라카이샌드파인리조트': 'Lakai Sandpine Resort',
    '스카이베이호텔 경포': 'Skybay Hotel Gyeongpo',
    '씨마크호텔': 'Seamarq Hotel',
    '세인트존스호텔': "St. John's Hotel",
    '신라모노그램강릉': 'Shilla Monogram Gangneung',
    '컨피넨스 오션스위트': 'Ocean Suite Hotel',
    'SL호텔 강릉': 'SL Hotel Gangneung',
    '강릉씨티호텔': 'Gangneung City Hotel',
    '썬크루즈 호텔·리조트': 'Sun Cruise Hotel & Resort',
    '호텔탑스텐': 'Hotel Tops10',
    '강릉종합운동장': 'Gangneung Stadium',
    '강릉역(KTX)': 'Gangneung Stn (KTX)',
    '월화거리': 'Wolhwa Street',
    '강릉버스터미널': 'Gangneung Bus Terminal',
    '강릉아이스아레나': 'Gangneung Ice Arena',
    '회의장': 'Convention Center',
    '전시장': 'Exhibition Hall',
    '올림픽파크 후문': 'Rear Gate',
    '아레나 정류장': 'Arena Bus Stop',
    '인천공항 제2터미널': 'Incheon Airport T2',
    '인천공항 제1터미널': 'Incheon Airport T1',
    '문막휴게소(강릉방향)': 'Munmak Rest Area',
    '김포국제공항 국제선청사': "Gimpo Airport Int'l Terminal",
    '서울역(KTX·공항철도)': 'Seoul Stn (KTX·AREX)'
  };
  var TITLE_EN = {
    '강릉올림픽파크 ~ 씨마크호텔 순환': 'Olympic Park ~ Seamarq Hotel Loop',
    '강릉올림픽파크 ~ 신라모노그램강릉 순환': 'Olympic Park ~ Shilla Monogram Loop',
    '강릉올림픽파크 ~ SL호텔 강릉 순환': 'Olympic Park ~ SL Hotel Loop',
    '강릉올림픽파크 ~ 호텔탑스텐 순환': 'Olympic Park ~ Hotel Tops10 Loop',
    '강릉올림픽파크 ~ 강릉버스터미널 순환': 'Olympic Park ~ Bus Terminal Loop',
    '강릉올림픽파크 순환': 'Olympic Park On-site Loop',
    '인천국제공항 → 강릉': 'Incheon Airport → Gangneung',
    '김포국제공항 → 강릉': 'Gimpo Airport → Gangneung',
    '강릉올림픽파크 → 서울역': 'Olympic Park → Seoul Station'
  };
  function curLang(){ return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'ko'; }
  function stopLabel(nm){ return (curLang() === 'en' && STOP_EN[nm]) ? STOP_EN[nm] : nm; }
  // 시간표 머릿글 — 긴 이름(특히 영문 호텔명)을 2~3줄로 줄바꿈해 가로 스크롤 방지
  function stopBi(nm){
    var ko = splitName(nm).join('<br>');
    var en = splitName(STOP_EN[nm] || nm).join('<br>');
    return '<span class="ko-only">' + ko + '</span><span class="en-only">' + en + '</span>';
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
    // 정류장 마커 종류 선판정 (선 끊김 계산용)
    pts.forEach(function(pt){ pt.mk = numbered ? 'num' : (iconType(pt.s.nm) ? 'icon' : 'dot'); });
    function gapR(pt){ return pt.mk === 'icon' ? 18 : (pt.mk === 'num' ? R : 0); }
    // 연결선 — 아이콘/번호 정류장 자리에서는 선을 끊어 겹침 방지 (구간별 선분)
    for (var p = 0; p < pts.length - 1; p++){
      var a = pts[p], b = pts[p + 1];
      var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len, uy = dy / len, ga = gapR(a), gb = gapR(b);
      var seg = document.createElementNS(SVGNS, 'line');
      seg.setAttribute('x1', a.x + ux * ga); seg.setAttribute('y1', a.y + uy * ga);
      seg.setAttribute('x2', b.x - ux * gb); seg.setAttribute('y2', b.y - uy * gb);
      seg.setAttribute('class', 'lm-line');
      svg.appendChild(seg);
    }
    pts.forEach(function(pt, idx){
      var hub = pt.s.end;
      var lines = splitName(stopLabel(pt.s.nm));
      var t = document.createElementNS(SVGNS, 'text');
      // 모든 라벨 우상향 대각선 통일. ㄱ자 꺾임 아래(우측 끝, 첫 행 제외) 라벨만 세로선과 겹치지 않게 우측으로 이동.
      var bendShift = (cols > 1 && pt.col === cols - 1 && pt.row > 0);
      var ax = pt.x + (bendShift ? 18 : 0), ay = pt.y - (R + 7);
      t.setAttribute('x', ax); t.setAttribute('y', ay);
      t.setAttribute('transform', 'rotate(-52 ' + ax + ' ' + ay + ')');
      t.setAttribute('text-anchor', 'start');
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
      if (idx === 0) return { cls: 'tt-hub', ko: '출발', en: 'Start' };
      if (cfg.loop && idx === apex) return { cls: 'tt-hub tt-turn', ko: '반환점', en: 'Turn' };
      if (idx === lastIdx) return { cls: 'tt-hub', ko: cfg.loop ? '복귀' : '도착', en: cfg.loop ? 'Return' : 'End' };
      return null;
    }
    function biTag(h){ return h ? '<small><span class="ko-only">' + h.ko + '</span><span class="en-only">' + h.en + '</span></small>' : ''; }
    var hwLabel = cfg.headwayLabel || (hw + '분');
    var hwEn = hwLabel.replace('분', ' min');
    var thead = '<tr><th class="tt-n"><span class="ko-only">회차</span><span class="en-only">Run</span></th>' + full.map(function(nm, idx){
      var h = hubType(idx);
      return '<th' + (h ? ' class="' + h.cls + '"' : '') + '>' + stopBi(nm) + biTag(h) + '</th>';
    }).join('') + '</tr>';
    var rows = starts.map(function(T, r){
      return '<tr><td class="tt-n">' + (r + 1) + '</td>' + off.map(function(o, idx){
        var h = hubType(idx);
        return '<td' + (h ? ' class="' + h.cls + '"' : '') + '>' + toHM(T + o) + '</td>';
      }).join('') + '</tr>';
    }).join('');

    return '<details class="tt"><summary><span class="tt-sum-t"><span class="ko-only">📋 전체 시간표 보기</span><span class="en-only">📋 View full timetable</span></span>' +
      '<span class="tt-sum-m"><span class="ko-only">첫차 ' + cfg.first + ' ~ 막차 ' + cfg.last + ' · ' + starts.length + '회 · 배차 ' + hwLabel + '</span>' +
      '<span class="en-only">First ' + cfg.first + ' ~ last ' + cfg.last + ' · ' + starts.length + ' runs · every ' + hwEn + '</span></span></summary>' +
      '<div class="tt-scroll"><table class="tt-table"><thead>' + thead + '</thead><tbody>' + rows + '</tbody></table></div>' +
      '<p class="tt-note"><span class="ko-only">※ 출발 위치(강조 열) 기준 각 정류장 출발 시각. 배차는 ' + hwLabel + ' 범위이며, 위 표는 ' + hw + '분 간격 예시입니다. 확정 시간표는 조직위 안내에 따릅니다.</span>' +
      '<span class="en-only">※ Departure time at each stop based on the highlighted origin column. Headways range ' + hwEn + '; the table shows ' + hw + '-min intervals as an example. The final timetable follows the organizing committee.</span></p>' +
      '</details>';
  }

  function renderRoute(el){
    var cfg;
    try { cfg = JSON.parse(el.getAttribute('data-config')); } catch (e) { return; }
    var stops = cfg.stops.map(function(nm, i){ return { nm: nm, end: (i === 0 || i === cfg.stops.length - 1) }; });
    // 실시간 위치 확인 링크 — cfg.live(노선별 지도 ID)면 개별 URL, 미지정 시 공용, false면 버튼 없음
    var liveHtml = '';
    if (cfg.live !== false) {
      var liveUrl = cfg.live ? ('https://rideus.net/its2026/shuttlebus/' + cfg.live + '/map') : 'https://rideus.net/its2026/shuttlebus/map';
      liveHtml = '<a href="' + liveUrl + '" target="_blank" rel="noopener" class="rd-live"><span class="ko-only">📍 실시간 위치 확인 ↗</span><span class="en-only">📍 Live location ↗</span></a>';
    }
    var head = '<div class="rd-head"><span class="rd-code' + (cfg.o ? ' o' : '') + '">' + cfg.code + '</span>' +
      '<span class="rd-name"><span class="ko-only">' + cfg.title + '</span><span class="en-only">' + (TITLE_EN[cfg.title] || cfg.title) + '</span></span>' +
      liveHtml + '</div>';
    var snakeId = 'snk-' + (cfg.code || Math.floor(el.offsetTop));
    el.innerHTML = head + '<div class="snk" data-snake="1"></div>' +
      (cfg.loop ? '<p class="rd-loop"><span class="ko-only">↻ 왕복 순환 — 종점에서 동일 경로로 회차</span><span class="en-only">↻ Round-trip loop — returns via the same route from the terminus</span></p>' : '') +
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