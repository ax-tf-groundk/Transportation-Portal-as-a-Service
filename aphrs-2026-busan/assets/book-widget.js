/* GroundK shared "Book" floating widget — injected on every page.
   FAB (bottom-right) -> slide-in side panel with Private Car (default) / Shuttle / Train forms.
   Auto-expands once on first visit to each page (per session). */
(function () {
  if (window.__gkBook) return; window.__gkBook = true;

  var FROM = ['Incheon Int’l Airport (ICN)', 'Gimhae Int’l Airport (PUS)', 'Busan KTX Station'];
  var TO   = ['BEXCO (APHRS 2026 Venue)', 'Busan Paradise Hotel', 'Haeundae'];
  var opt = function (arr) { return arr.map(function (v) { return '<option>' + v + '</option>'; }).join(''); };

  var html =
    '<button id="gkFab" class="gk-fab" aria-label="Book transportation"><span class="ic">🚐</span><span>Book</span></button>' +
    '<div id="gkOv" class="gk-ov"></div>' +
    '<aside id="gkPanel" class="gk-panel" role="dialog" aria-label="Book transportation">' +
      '<div class="gk-ph"><div><b>Book Transportation</b><small>Reserve a ride from any page</small></div>' +
        '<button class="gk-x" id="gkClose" aria-label="Close">✕</button></div>' +
      '<div class="gk-tabs">' +
        '<button data-svc="car" class="active"><span class="ic">🚗</span>Private Car</button>' +
        '<button data-svc="shuttle"><span class="ic">🚌</span>Shuttle</button>' +
        '<button data-svc="train"><span class="ic">🚄</span>Train</button>' +
      '</div>' +
      '<div class="gk-body">' +
        // Private Car
        '<form data-form="car">' +
          '<div class="f"><label>From</label><select>' + opt(FROM) + '</select></div>' +
          '<div class="f"><label>To</label><select>' + opt(TO) + '</select></div>' +
          '<div class="f two"><div><label>Date</label><input value="2026-10-21"></div><div><label>Time</label><input value="10:00"></div></div>' +
          '<div class="f"><label>Passengers</label><select><option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option><option>6</option></select></div>' +
          '<div class="gk-note">Door-to-door private car. Fare from KRW 75,000.</div>' +
        '</form>' +
        // Shuttle
        '<form data-form="shuttle" hidden>' +
          '<div class="f"><label>Route</label><select><option>Gimhae Airport → Official Hotels</option><option>Official Hotels → BEXCO</option><option>Haeundae → BEXCO</option></select></div>' +
          '<div class="f two"><div><label>Date</label><input value="2026-10-21"></div><div><label>Departure</label><select><option>08:00</option><option selected>09:00</option><option>10:00</option><option>11:00</option></select></div></div>' +
          '<div class="f"><label>Passengers</label><select><option>1</option><option selected>2</option><option>3</option><option>4</option></select></div>' +
          '<div class="gk-note">Free for APHRS 2026 registered participants.</div>' +
        '</form>' +
        // Train
        '<form data-form="train" hidden>' +
          '<div class="f two"><div><label>From</label><input value="Seoul" readonly></div><div><label>To</label><input value="Busan" readonly></div></div>' +
          '<div class="f"><label>Date</label><input value="2026-10-21"></div>' +
          '<div class="f"><label>Seat class</label><select><option selected>Economy — KRW 59,800</option><option>First class — KRW 83,700</option></select></div>' +
          '<div class="gk-note">KTX high-speed rail · approx. 2h 30m.</div>' +
        '</form>' +
      '</div>' +
      '<div class="gk-foot"><a id="gkGo" class="btn btn-red btn-block" href="gt-private-car.html">Continue to booking →</a></div>' +
    '</aside>';

  var box = document.createElement('div');
  box.innerHTML = html;
  document.body.appendChild(box);

  var fab = document.getElementById('gkFab'),
      ov = document.getElementById('gkOv'),
      panel = document.getElementById('gkPanel'),
      go = document.getElementById('gkGo'),
      tabs = panel.querySelectorAll('.gk-tabs button'),
      forms = panel.querySelectorAll('[data-form]');
  var LINK = { car: 'gt-private-car.html', shuttle: 'gt-shuttle.html', train: 'gt-korail.html' };

  function open() { ov.classList.add('on'); panel.classList.add('on'); fab.classList.add('hide'); }
  function close() { ov.classList.remove('on'); panel.classList.remove('on'); fab.classList.remove('hide'); }
  function select(svc) {
    tabs.forEach(function (t) { t.classList.toggle('active', t.dataset.svc === svc); });
    forms.forEach(function (f) { f.hidden = (f.dataset.form !== svc); });
    go.setAttribute('href', LINK[svc]);
  }

  fab.addEventListener('click', open);
  document.getElementById('gkClose').addEventListener('click', close);
  ov.addEventListener('click', close);
  tabs.forEach(function (t) { t.addEventListener('click', function () { select(t.dataset.svc); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  // Auto-expand only ONCE on first arrival to the site (per session).
  // After the user closes it, it stays closed across all pages.
  try {
    if (!sessionStorage.getItem('gkBookSeenSite')) {
      sessionStorage.setItem('gkBookSeenSite', '1');
      setTimeout(open, 650);
    }
  } catch (e) { /* sessionStorage unavailable -> skip auto-open */ }
})();
