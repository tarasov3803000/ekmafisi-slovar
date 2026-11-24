/* «Словарь» — экран приложения. Грузится из sync.js после входа (EKM_CONFIG.main).
   Адреса: без решётки — поиск; #<лемма> — статья. Системное «назад» — из статьи к списку. */
(() => {
  const $ = id => document.getElementById(id);
  $('app').classList.remove('hidden');
  /* #<лемма> — статья, #<лемма>/tab — её таблицы спряжения или склонения, #<лемма>/etym — её происхождение */
  const fromHash = () => { const h = decodeURIComponent(location.hash.slice(1)); if (!h) return [null, null]; const m = h.match(/\/(tab|etym)$/); return m ? [h.slice(0, -m[0].length), m[1]] : [h, null]; };
  const api = Slovar.mount($('slv'), {
    aside: $('setOpen'),
    onPick(l, m) { history.pushState({ d: ((history.state && history.state.d) || 0) + 1 }, '', '#' + encodeURIComponent(l) + (m ? '/' + m : '')); api.show(l, m); },
    onBack() {
      if (history.state && history.state.d) history.back();
      else { history.replaceState(null, '', location.pathname + location.search); api.show(null); }  /* открыто ссылкой прямо на статью */
    }
  });
  addEventListener('popstate', () => api.show(...fromHash()));
  api.show(...fromHash());
  api.ready.then(() => { if (!fromHash()[0]) api.focus(); });

  /* настройки: тема (своя), шрифт (общий с Экмафиси), выход */
  $('setOpen').onclick = () => { const on = $('settings').classList.toggle('hidden'); $('setOpen').setAttribute('aria-expanded', String(!on)); paint(); };
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  function paint() {
    const t = get('slovar-theme') || 'auto', up = +(get('ekmafisi-up') || 0);
    document.querySelectorAll('#setTheme button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === t)));
    document.querySelectorAll('#setBig button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.up === up)));
    $('who').textContent = EK.email || '';
    const sk = +(get('slovar-skorost') || 0.9);  /* скорость голоса — читает slovar.js при каждом нажатии 🔊; по умолчанию 0,9 */
    document.querySelectorAll('#setSkor button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.s === sk)));
    /* замер открытия (Slovar.zamer, мс от начала страницы): сколько ждали поиска и статей — на этом телефоне */
    const z = Slovar.zamer, sek = ms => (ms / 1000).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    $('zamer').textContent = z.ready ? `Открытие словаря: поиск — ${sek(z.ready)} с${z.s ? `, статьи — ${sek(z.s)} с` : ''} (из них версия — ${sek(z.ptr)}, указатель — ${sek(z.i - z.ptr)})` : '';
  }
  document.querySelectorAll('#setTheme button').forEach(b => b.onclick = () => {
    set('slovar-theme', b.dataset.t);
    if (b.dataset.t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = b.dataset.t;
    paint();
  });
  document.querySelectorAll('#setBig button').forEach(b => b.onclick = () => {
    set('ekmafisi-up', b.dataset.up); document.documentElement.style.setProperty('--up', b.dataset.up + 'px'); paint();
  });
  document.querySelectorAll('#setSkor button').forEach(b => b.onclick = () => { set('slovar-skorost', b.dataset.s); paint(); });
  $('signOut').onclick = () => EK.signOut();
})();
