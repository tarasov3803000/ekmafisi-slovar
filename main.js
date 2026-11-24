/* «Словарь» — экран приложения. Грузится из sync.js после входа (EKM_CONFIG.main).
   Адреса: без решётки — поиск; #<лемма> — статья. Системное «назад» — из статьи к списку. */
(() => {
  const $ = id => document.getElementById(id);
  $('app').classList.remove('hidden');
  /* #<лемма> — статья, #<лемма>/tab — её таблицы спряжения или склонения, #<лемма>/etym — её происхождение */
  const fromHash = () => { const h = decodeURIComponent(location.hash.slice(1)); if (!h) return [null, null]; const m = h.match(/\/(tab|etym|hist)$/); return m ? [h.slice(0, -m[0].length), m[1]] : [h, null]; };
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

  /* настройки: почта (выход), тема (своя), скорость голоса и шрифт (общие с Экмафиси). Замер открытия — Slovar.zamer, в консоли */
  $('setOpen').onclick = () => { const on = $('settings').classList.toggle('hidden'); $('setOpen').setAttribute('aria-expanded', String(!on)); paint(); };
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  /* тема — один значок, нажатие — следующая по кругу; значок показывает нынешнюю: авто — полукруг, светлая — солнце, тёмная — луна */
  const TEMY = ['auto', 'light', 'dark'], TNAME = { auto: 'авто', light: 'светлая', dark: 'тёмная' };
  const TICON = {
    auto: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    dark: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'
  };
  const tema = () => { const t = get('slovar-theme'); return TEMY.includes(t) ? t : 'auto'; };
  const skor = () => { const v = +(get('slovar-skorost') || 0.9); return v >= 0.5 && v <= 1.5 ? v : 0.9; };  /* читает slovar.js при каждом нажатии 🔊 */
  function paint() {
    const t = tema(), up = +(get('ekmafisi-up') || 0), sk = skor();
    $('setTheme').innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${TICON[t]}</svg>`;
    $('setTheme').setAttribute('aria-label', 'Тема: ' + TNAME[t] + '. Сменить');
    $('setSkor').value = sk; $('skorV').textContent = 'Скорость голоса: ' + sk.toLocaleString('ru-RU', { minimumFractionDigits: 1 });
    $('setBig').value = up; $('bigV').textContent = 'Шрифт: ' + (up ? '+' + up : 'обычный');
    $('who').textContent = EK.email || 'Войти с Google'; $('who').classList.toggle('vhod', !EK.email);
  }
  $('setTheme').onclick = () => {
    const t = TEMY[(TEMY.indexOf(tema()) + 1) % TEMY.length];
    set('slovar-theme', t);
    if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t;
    paint();
  };
  $('setBig').oninput = e => { set('ekmafisi-up', e.target.value); document.documentElement.style.setProperty('--up', e.target.value + 'px'); paint(); };
  $('setSkor').oninput = e => { set('slovar-skorost', e.target.value); paint(); };
  /* почта — нажатие: выход после одного вопроса; не вошёл — на её месте «Войти с Google» */
  $('who').onclick = () => {
    if (!EK.email) { const b = $('loginBtn'); if (b) b.click(); return; }
    if (confirm(`Выйти из аккаунта ${EK.email}?`)) EK.signOut();
  };
})();
