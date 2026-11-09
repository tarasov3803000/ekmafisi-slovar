/* «Словарь» — экран приложения. Грузится из sync.js после входа (EKM_CONFIG.main).
   Адреса: без решётки — поиск; #<лемма> — статья. Системное «назад» — из статьи к списку. */
(() => {
  const $ = id => document.getElementById(id);
  $('app').classList.remove('hidden');
  const fromHash = () => decodeURIComponent(location.hash.slice(1)) || null;
  const api = Slovar.mount($('slv'), {
    aside: $('setOpen'),
    onPick(l) { history.pushState({ d: ((history.state && history.state.d) || 0) + 1 }, '', '#' + encodeURIComponent(l)); api.show(l); },
    onBack() {
      if (history.state && history.state.d) history.back();
      else { history.replaceState(null, '', location.pathname + location.search); api.show(null); }  /* открыто ссылкой прямо на статью */
    }
  });
  addEventListener('popstate', () => api.show(fromHash()));
  api.show(fromHash());
  api.ready.then(() => { if (!fromHash()) api.focus(); });

  /* настройки: тема (своя), шрифт (общий с Экмафиси), выход */
  $('setOpen').onclick = () => { const on = $('settings').classList.toggle('hidden'); $('setOpen').setAttribute('aria-expanded', String(!on)); paint(); };
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  function paint() {
    const t = get('slovar-theme') || 'auto', up = +(get('ekmafisi-up') || 0);
    document.querySelectorAll('#setTheme button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === t)));
    document.querySelectorAll('#setBig button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.up === up)));
    $('who').textContent = EK.email || '';
  }
  document.querySelectorAll('#setTheme button').forEach(b => b.onclick = () => {
    set('slovar-theme', b.dataset.t);
    if (b.dataset.t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = b.dataset.t;
    paint();
  });
  document.querySelectorAll('#setBig button').forEach(b => b.onclick = () => {
    set('ekmafisi-up', b.dataset.up); document.documentElement.style.setProperty('--up', b.dataset.up + 'px'); paint();
  });
  $('signOut').onclick = () => EK.signOut();
})();
