/* Mobile menu details reuse the live menu; notices reuse their original copy. */
(() => {
  const phone = matchMedia('(max-width: 767px), (orientation: landscape) and (max-height: 500px) and (max-width: 1000px)');
  const front = document.querySelector('.front-page');
  const originalMainNodes = front ? Array.from(front.childNodes) : [];
  const menu = document.querySelector('.front-page > .kv-menu');
  const gallery = document.getElementById('gallery');
  const dialog = document.getElementById('mobile-menu-dialog');
  const content = dialog?.querySelector('.mobile-menu-content');
  const title = dialog?.querySelector('#mobile-menu-title');
  const closeButton = dialog?.querySelector('.mobile-menu-close');
  const groups = [[0], [1], [2, 3, 4]];
  let active = null;

  function restoreMenu(returnFocus = true) {
    if (!active) return;
    const previous = active;
    active = null;
    previous.placeholder.replaceWith(menu);
    previous.feature?.remove();
    previous.accordions.forEach(({element, hidden, open}) => {
      element.hidden = hidden;
      element.open = open;
    });
    document.body.classList.remove('menu-detail-open');
    if (returnFocus && phone.matches && previous.card.isConnected) {
      previous.card.focus({preventScroll: true});
    }
  }

  function closeMenu(returnFocus = true) {
    if (dialog?.open) dialog.close();
    restoreMenu(returnFocus);
  }

  function openMenu(card) {
    const value = card.dataset.mobileMenu;
    if (!phone.matches || !menu || !content || !title || !closeButton ||
        typeof dialog.showModal !== 'function' || !/^[0-2]$/.test(value) || dialog.open) return false;
    const index = Number(value);
    const accordions = Array.from(menu.querySelectorAll('.kv-accordion'));
    if (groups[index].some(item => !accordions[item])) return false;

    const label = (card.querySelector('.mobile-card-title')?.textContent || card.textContent).trim();
    const feature = card.querySelector('img')?.cloneNode(false);
    if (feature) {
      feature.removeAttribute('id');
      feature.removeAttribute('aria-labelledby');
      feature.removeAttribute('aria-describedby');
      feature.className = 'mobile-menu-feature';
      feature.alt = label;
      feature.loading = 'eager';
      feature.decoding = 'async';
      feature.sizes = '100vw';
    }
    const placeholder = document.createComment('Original menu position');
    active = {
      card,
      feature,
      placeholder,
      accordions: accordions.map(element => ({element, hidden: element.hidden, open: element.open})),
    };
    menu.before(placeholder);
    if (feature) content.append(feature);
    content.append(menu);
    accordions.forEach((element, item) => {
      const selected = groups[index].includes(item);
      element.hidden = !selected;
      element.open = selected;
    });
    title.textContent = label;
    dialog.dataset.tone = index === 0 || index === 2 ? 'dark' : 'light';
    document.body.classList.add('menu-detail-open');
    try {
      dialog.showModal();
      dialog.scrollTop = 0;
      content.scrollTop = 0;
      closeButton.focus({preventScroll: true});
      return true;
    } catch {
      // The card's original menu-page link remains the fallback.
      restoreMenu(false);
      return false;
    }
  }

  closeButton?.addEventListener('click', () => closeMenu());
  dialog?.addEventListener('close', () => {
    // A queued close event must not dismantle a newly opened detail view.
    if (!dialog.open) restoreMenu();
  });
  dialog?.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) closeMenu();
  });

  const pagePath = path => path.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
  function showMenuCards() {
    if (!phone.matches || !menu || !gallery) return;
    closeMenu(false);
    gallery.scrollIntoView({block: 'start'});
  }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
    const card = event.target.closest('[data-mobile-menu]');
    if (card && openMenu(card)) {
      event.preventDefault();
      return;
    }
    const link = event.target.closest('a[href]');
    if (!link || !phone.matches || !menu || !gallery || link.hasAttribute('download') ||
        (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || pagePath(url.pathname) !== pagePath(location.pathname) ||
        url.hash !== '#menu') return;
    event.preventDefault();
    if (location.href !== url.href) history.pushState(null, '', url.href);
    showMenuCards();
  });

  function routeMenuHash() {
    if (!phone.matches || !front || !location.hash) return;
    const targetId = ({'#menu': 'gallery', '#moments': 'history', '#onlinestore': 'gallery'})[location.hash]
      || location.hash.slice(1);
    const target = document.getElementById(targetId);
    if (target) requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
  }
  window.addEventListener('hashchange', routeMenuHash);
  window.addEventListener('load', routeMenuHash, {once: true});

  const notices = Array.from(document.querySelectorAll('.ed-news li')).flatMap(item => {
    const nodes = Array.from(item.childNodes);
    const kicker = Array.from(item.children).find(child => child.matches('.ed-kicker'));
    if (!kicker || !Array.from(item.children).some(child => child.matches('p'))) return [];
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    const body = document.createElement('div');
    details.className = 'mobile-news-disclosure';
    summary.className = 'mobile-news-summary';
    body.className = 'mobile-news-body';
    details.append(summary, body);
    return [{item, nodes, kicker, details, summary, body}];
  });

  function syncNotices() {
    notices.forEach(({item, nodes, kicker, details, summary, body}) => {
      if (phone.matches) {
        if (details.parentNode === item) return;
        summary.append(kicker);
        body.append(...nodes.filter(node => node !== kicker));
        item.replaceChildren(details);
      } else if (details.parentNode === item) {
        item.replaceChildren(...nodes);
      }
    });
  }

  const locator = front?.querySelector('.kv-visit .kv-locator');
  const accessTools = locator ? document.createElement('details') : null;
  if (accessTools) {
    accessTools.className = 'mobile-access-tools';
    const summary = document.createElement('summary');
    summary.textContent = locator.querySelector('[data-current-location]')?.textContent.trim() ||
      window.totoyaText?.('Find my nearest shop') || 'Find my nearest shop';
    accessTools.append(summary);
  }

  function syncAccessTools() {
    if (!locator || !accessTools) return;
    if (phone.matches && locator.parentNode !== accessTools) {
      accessTools.open = false;
      accessTools.hidden = locator.hidden;
      locator.replaceWith(accessTools);
      accessTools.append(locator);
    } else if (!phone.matches && locator.parentNode === accessTools) {
      accessTools.replaceWith(locator);
    }
  }

  function syncMainOrder() {
    if (!front) return;
    if (!phone.matches) {
      front.replaceChildren(...originalMainNodes);
      return;
    }
    const ids = ['home', 'intro', 'gallery', 'menu', 'history', 'news', 'shopinfo', 'onlinestore'];
    const ordered = ids.map(id => originalMainNodes.find(node => node.id === id)).filter(Boolean);
    front.replaceChildren(...ordered, ...originalMainNodes.filter(node => !ordered.includes(node)));
  }

  function viewportChanged() {
    // Restore the menu's placeholder before moving any of its parent sections.
    closeMenu(false);
    syncMainOrder();
    syncAccessTools();
    syncNotices();
    routeMenuHash();
  }
  if (typeof phone.addEventListener === 'function') phone.addEventListener('change', viewportChanged);
  else phone.addListener(viewportChanged);
  viewportChanged();
})();
