/* =========================================================================
   RIDEUS Events × APHRS 2026 — Transport Portal · shared JS
   reveal-on-scroll · language toggle (UI mock) · booking-lookup modal (UI mock)
   booking.html has its own inline script.
   ========================================================================= */
(function () {
  'use strict';

  var SITE_VERSION = '2026.06.28.1';
  try { console.log('%cRIDEUS Events · APHRS 2026 · build ' + SITE_VERSION, 'color:#e8344e;font-weight:700'); } catch (e) {}

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
        result.innerHTML = '※ 예약번호를 입력해 주세요. (예: RE-APHRS-AIR-1234)';
        return;
      }
      result.innerHTML = '✓ <b>' + code.replace(/</g, '&lt;') + '</b> — 데모 예약 1건 확인 (콘셉트 데모이므로 예시 안내만 표시됩니다).';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initLang();
    initLookup();
  });
})();