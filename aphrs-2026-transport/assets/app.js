/* =========================================================================
   RIDEUS Events × APHRS 2026 — Transport Portal · shared JS
   reveal-on-scroll · language toggle (UI mock) · booking-lookup modal (UI mock)
   booking.html has its own inline script.
   ========================================================================= */
(function () {
  'use strict';

  var SITE_VERSION = '2026.07.14.2';
  try { console.log('%cRIDEUS Events · APHRS 2026 · build ' + SITE_VERSION, 'color:#e8344e;font-weight:700'); } catch (e) {}

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- reveal on scroll (progressive enhancement — no hide by default) ---- */
  function initReveal() {
    // 애니메이션 없이 그냥 표시 — 실제 배포 시 IntersectionObserver로 교체 가능
    return;
  }

  /* ---- language toggle — switches .ko-only / .en-only content via data-ui-lang on <html> ---- */
  function initLang() {
    var toggles = document.querySelectorAll('.lang');
    if (!toggles.length) return;
    function apply(next) {
      document.documentElement.setAttribute('data-ui-lang', next);
      Array.prototype.forEach.call(toggles, function (t) {
        Array.prototype.forEach.call(t.querySelectorAll('.seg'), function (s) {
          s.classList.toggle('on', s.dataset.lang === next);
        });
      });
      try { sessionStorage.setItem('ui-lang', next); } catch(e) {}
    }
    Array.prototype.forEach.call(toggles, function (t) {
      t.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-ui-lang') || 'ko';
        apply(current === 'ko' ? 'en' : 'ko');
      });
    });
    /* restore last choice across page navigations */
    try {
      if (sessionStorage.getItem('ui-lang') === 'en') apply('en');
    } catch(e) {}
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
      var isEn = document.documentElement.getAttribute('data-ui-lang') === 'en';
      if (!code) {
        result.innerHTML = isEn
          ? '※ Please enter your booking number (e.g. RE-APHRS-AIR-1234).'
          : '※ 예약번호를 입력해 주세요. (예: RE-APHRS-AIR-1234)';
        return;
      }
      result.innerHTML = isEn
        ? '✓ <b>' + code.replace(/</g, '&lt;') + '</b> — 1 demo booking found (example result — concept demo only).'
        : '✓ <b>' + code.replace(/</g, '&lt;') + '</b> — 데모 예약 1건 확인 (콘셉트 데모이므로 예시 안내만 표시됩니다).';
    });
  }

  /* ---- responsive tables — inject per-cell header labels so narrow screens can render each row as a card (see .acc-body card CSS) ---- */
  function initResponsiveTables() {
    var tables = document.querySelectorAll('.acc-body table');
    Array.prototype.forEach.call(tables, function (table) {
      var headRow = table.querySelector('thead tr');
      if (!headRow) return;
      var labels = Array.prototype.map.call(headRow.querySelectorAll('th'), function (th) {
        var ko = th.querySelector('.ko-only');
        var en = th.querySelector('.en-only');
        return {
          ko: (ko ? ko.textContent : th.textContent).trim(),
          en: (en ? en.textContent : th.textContent).trim()
        };
      });
      Array.prototype.forEach.call(table.querySelectorAll('tbody tr'), function (tr) {
        var col = 0;
        Array.prototype.forEach.call(tr.children, function (cell) {
          if (cell.tagName !== 'TD') return;
          var lab = labels[col];
          if (lab) {
            cell.setAttribute('data-th-ko', lab.ko);
            cell.setAttribute('data-th-en', lab.en);
          }
          col += parseInt(cell.getAttribute('colspan') || '1', 10);
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initLang();
    initLookup();
    initDemoBanner();
    initResponsiveTables();
  });

  /* ---- demo banner close ---- */
  function initDemoBanner() {
    var banner = document.querySelector('.demo-banner');
    if (!banner) return;
    var btn = document.createElement('button');
    btn.className = 'demo-banner-close';
    btn.setAttribute('aria-label', '닫기');
    btn.innerHTML = '✕';
    btn.addEventListener('click', function () {
      banner.style.display = 'none';
      try { sessionStorage.setItem('demo-banner-closed', '1'); } catch(e) {}
    });
    banner.appendChild(btn);
    try {
      if (sessionStorage.getItem('demo-banner-closed') === '1') banner.style.display = 'none';
    } catch(e) {}
  }
})();