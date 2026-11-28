/* Cumulative visitor measurements for TOTOYA. The payload contains no names, IPs or full URLs. */
(() => {
  'use strict';
  try {
    const VISITOR_KEY = 'totoya.analytics.visitor';
    const SESSION_KEY = 'totoya.analytics.session';
    const OPTOUT_KEY = 'totoya.analytics.optout';
    const DAY = 86400000;
    const IDLE = 60000;
    const SESSION_IDLE = 30 * 60000;
    const storage = window.localStorage;
    // Without durable preferences we cannot honor a future choice across pages.
    storage.getItem(OPTOUT_KEY);
    const privacySignal = navigator.globalPrivacyControl === true ||
      navigator.doNotTrack === '1' || window.doNotTrack === '1';
    function optedOut() { return privacySignal || storage.getItem(OPTOUT_KEY) === '1'; }
    function clearIdentifiers() {
      try { storage.removeItem(VISITOR_KEY); storage.removeItem(SESSION_KEY); } catch { /* Storage may be disabled. */ }
    }
    const checkbox = document.getElementById('analytics-optout');
    if (checkbox) {
      const displayPreference = () => { checkbox.checked = optedOut(); checkbox.disabled = privacySignal; };
      displayPreference();
      window.addEventListener('storage', displayPreference);
      checkbox.addEventListener('change', () => {
        try {
          if (checkbox.checked) {
            storage.setItem(OPTOUT_KEY, '1');
            clearIdentifiers();
            window.dispatchEvent(new Event('totoya:analytics-preference'));
          } else {
            storage.removeItem(OPTOUT_KEY);
            location.reload();
          }
        } catch {
          checkbox.disabled = true;
          checkbox.checked = true;
          window.dispatchEvent(new Event('totoya:analytics-preference'));
        }
      });
    }
    if (optedOut()) { clearIdentifiers(); return; }
    const productionOrigins = ['https://www.totoyahawaii.com', 'https://totoyahawaii.com'];
    if (!productionOrigins.includes(location.origin) || window.self !== window.top) return;
    // Page identity comes from our template, never from visitor-supplied paths or fragments.
    const page = document.currentScript?.dataset.page;
    if (!page) return;
    const endpoint = 'https://totoya-production-analytics.m-kubota1984.chatgpt.site/api/analytics/collect';
    function readJSON(key) {
      try { return JSON.parse(storage.getItem(key) || 'null'); } catch { return null; }
    }
    function uuid() {
      if (crypto.randomUUID) return crypto.randomUUID();
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 15) | 64;
      bytes[8] = (bytes[8] & 63) | 128;
      const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
    const isUUID = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    const wallNow = Date.now();
    let visitor = readJSON(VISITOR_KEY);
    if (!visitor || !isUUID(visitor.id) || !Number.isFinite(visitor.expires) || visitor.expires <= wallNow || visitor.expires > wallNow + 31 * DAY) {
      visitor = {id: uuid(), expires: wallNow + 30 * DAY};
      storage.setItem(VISITOR_KEY, JSON.stringify(visitor));
    }
    const cleanCampaign = value => {
      const text = String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim();
      // Discard obvious identifiers and URLs before they ever leave the browser.
      return /@|[a-z][a-z0-9+.-]*:\/\/|\bwww\.|[?#]/i.test(text) ? '' : text.slice(0, 80);
    };
    const query = new URLSearchParams(location.search);
    let referrerHost = '';
    try {
      const host = new URL(document.referrer).hostname;
      if (!['www.totoyahawaii.com', 'totoyahawaii.com'].includes(host) && /^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?$/i.test(host)) referrerHost = host;
    } catch { /* Empty and invalid referrers are direct visits. */ }
    let source = {
      referrerHost,
      utmSource: cleanCampaign(query.get('utm_source')),
      utmMedium: cleanCampaign(query.get('utm_medium')),
      utmCampaign: cleanCampaign(query.get('utm_campaign'))
    };
    let session = readJSON(SESSION_KEY);
    if (!session || !isUUID(session.id) || !Number.isFinite(session.touched) || wallNow - session.touched >= SESSION_IDLE || session.touched > wallNow + 60000) {
      session = {id: uuid(), touched: wallNow, source};
    } else {
      // Keep the session's acquisition source on internal navigation and reload.
      if (session.source) {
        source = {
          referrerHost: String(session.source.referrerHost || '').slice(0, 120),
          utmSource: cleanCampaign(session.source.utmSource),
          utmMedium: cleanCampaign(session.source.utmMedium),
          utmCampaign: cleanCampaign(session.source.utmCampaign)
        };
      }
      session.touched = wallNow;
    }
    storage.setItem(SESSION_KEY, JSON.stringify(session));
    let lastSessionWrite = wallNow;
    function touchSession() {
      const now = Date.now();
      if (now - lastSessionWrite < 5000 || now - session.touched >= SESSION_IDLE) return;
      // Another tab may already have started a new session.
      if (readJSON(SESSION_KEY)?.id !== session.id) return;
      session.touched = now;
      storage.setItem(SESSION_KEY, JSON.stringify(session));
      lastSessionWrite = now;
    }
    const pageviewId = uuid();
    const agent = navigator.userAgent;
    const browser = /Edg(?:e|A|iOS)?\//.test(agent) ? 'Edge' : /Firefox\/|FxiOS\//.test(agent) ? 'Firefox' : /Chrome\/|CriOS\//.test(agent) ? 'Chrome' : /Safari\//.test(agent) ? 'Safari' : 'Other';
    const device = innerWidth <= 767 ? 'mobile' : innerWidth <= 1100 ? 'tablet' : 'desktop';
    const sectionKeys = ['home', 'intro', 'news', 'history', 'menu', 'gallery', 'shopinfo', 'onlinestore', 'our-group', 'sister-restaurants', 'careers', 'contact'];
    const visibleSections = sectionKeys.map(key => [key, document.getElementById(key)]);
    visibleSections.push(['footer', document.querySelector('.public-footer')]);
    const sections = visibleSections.filter(([, element]) => element)
      .map(([key, element]) => ({key, element, views: 0, ms: 0, visibleSince: null}));
    const rail = document.querySelector('.site-rail');
    const companyHeader = document.querySelector('.company-top');
    const menuDrawer = document.querySelector('.rail-menu');
    const bookingDialog = document.getElementById('booking-dialog');
    const categories = [...document.querySelectorAll('.kv-accordion')];
    const items = categories.flatMap(category => [...category.querySelectorAll('[data-menu-item]')]
      .map(element => ({element, category, key: element.dataset.menuItem, views: 0, visibleSince: null})));
    const actions = new Map();
    let sequence = 0;
    let engagedMs = 0;
    let maxScroll = 0;
    let stopped = false;
    const locatorButton = document.querySelector('[data-current-location]');
    if (locatorButton) {
      const installAreas = () => import('/analytics/visit-area.mjs')
        .then(module => module.install({button: locatorButton, pageviewId, allowed: () => !stopped && !optedOut()}))
        .catch(() => {});
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); installAreas(); }
        });
        observer.observe(locatorButton);
      } else { installAreas(); }
    }
    let suspended = false;
    let lastActivity = performance.now();
    let actionCount = 0;
    let lastTick = lastActivity;
    let previousMeasurable = document.visibilityState === 'visible';
    let dominant = null;
    let actionTimer;
    let heartbeat;
    let sampling;

    function stop() {
      stopped = true;
      clearInterval(heartbeat);
      clearInterval(sampling);
      clearTimeout(actionTimer);
      clearIdentifiers();
      actions.clear();
    }
    function canMeasure(now) {
      return !suspended && document.visibilityState === 'visible' &&
        !menuDrawer?.open && !bookingDialog?.open && now - lastActivity <= IDLE;
    }
    function visibleArea(element, top) {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return {area: 0, full: 0};
      const width = Math.max(0, Math.min(rect.right, innerWidth) - Math.max(rect.left, 0));
      const height = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, top));
      return {area: width * height, full: rect.width * rect.height};
    }
    function sample(now, measurable) {
      let largest = 0;
      dominant = null;
      const headerBottom = companyHeader?.getBoundingClientRect().bottom ||
        (rail && getComputedStyle(rail).position === 'sticky' ? rail.getBoundingClientRect().bottom : 0);
      const top = Math.max(0, Math.min(innerHeight, headerBottom));
      const viewportArea = innerWidth * innerHeight;
      sections.forEach(section => {
        const area = measurable ? visibleArea(section.element, top) : {area: 0, full: 0};
        if (area.area > largest) { largest = area.area; dominant = section; }
        const enough = area.area > 0 && area.area >= Math.min(area.full, viewportArea) * .25;
        if (enough) {
          if (section.visibleSince === null) section.visibleSince = now;
          if (now - section.visibleSince >= 1000) section.views = 1;
        } else section.visibleSince = null;
      });
      items.forEach(item => {
        if (item.views) return;
        const area = measurable && item.category.open ? visibleArea(item.element, top) : {area: 0, full: 0};
        if (area.area > 0 && area.area >= area.full * .5) {
          if (item.visibleSince === null) item.visibleSince = now;
          if (now - item.visibleSince >= 1000) item.views = 1;
        } else item.visibleSince = null;
      });
      if (document.visibilityState === 'visible' && !suspended) {
        const height = document.documentElement.scrollHeight;
        if (height > 0) maxScroll = Math.max(maxScroll, Math.min(100, Math.round((scrollY + innerHeight) / height * 100)));
      }
    }
    function tick() {
      if (stopped) return;
      if (optedOut()) { stop(); return; }
      const now = performance.now();
      if (previousMeasurable) {
        // Cap a stalled timer interval; a background/suspended tab cannot add minutes.
        const delta = Math.max(0, Math.min(now, lastActivity + IDLE) - lastTick);
        const measured = Math.min(delta, 5000, DAY - engagedMs);
        engagedMs += measured;
        if (dominant) dominant.ms += measured;
      }
      lastTick = now;
      previousMeasurable = canMeasure(now);
      sample(now, previousMeasurable);
    }
    function snapshot() {
      return {
        v: 1, pageviewId, visitorId: visitor.id, sessionId: session.id, seq: ++sequence, page,
        engagedMs: Math.floor(engagedMs), maxScroll,
        sections: sections.filter(section => section.views).map(section => ({key: section.key, views: 1, ms: Math.floor(section.ms)})),
        actions: [...actions.values()].map(action => ({...action})),
        items: items.filter(item => item.views).map(item => ({key: item.key, views: 1})),
        source, device, browser
      };
    }
    function send() {
      tick();
      if (stopped) return;
      clearTimeout(actionTimer);
      const payload = JSON.stringify(snapshot());
      if (new Blob([payload]).size > 60000) return;
      // Later cumulative snapshots safely retry failed or out-of-order deliveries.
      fetch(endpoint, {method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true,
        headers: {'Content-Type': 'application/json'}, body: payload})
        .catch(() => { /* Analytics must never interrupt browsing. */ });
    }
    function record(type, target = '', locationName = '', placement = '') {
      if (stopped || actionCount >= 10000) return;
      tick();
      if (stopped) return;
      const key = [type, target, locationName, placement].join('|');
      const old = actions.get(key);
      if (old) old.count = Math.min(10000, old.count + 1);
      else if (actions.size < 100) actions.set(key, {type, target, location: locationName, placement, count: 1});
      else return;
      actionCount++;
      clearTimeout(actionTimer);
      actionTimer = setTimeout(() => send(), 1000);
    }
    function activity(event) {
      if (!event.isTrusted || stopped) return;
      const now = performance.now();
      if (now - lastActivity < 500) return;
      tick();
      lastActivity = now;
      previousMeasurable = canMeasure(lastActivity);
      touchSession();
    }
    ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'scroll', 'focus'].forEach(type =>
      window.addEventListener(type, activity, {passive: true, capture: true})
    );
    function navPlacement() { return rail && getComputedStyle(rail).position === 'sticky' ? 'header' : 'rail'; }
    function placementFor(element) {
      if (element.closest('.site-rail, #booking-dialog')) return navPlacement();
      if (element.closest('.company-top')) return 'header';
      if (element.closest('.public-footer')) return 'footer';
      return element.closest('section[id]')?.id || '';
    }
    const shopKeys = ['kaimuki', 'piikoi', 'aiea'];
    const orderSlugs = {
      '/online/totoya-hawaii': 'kaimuki',
      '/online/totoya-ala-moana-436-piikoi-st-suite-b': 'piikoi',
      '/online/totoya-aiea-nro-99-115-aiea-heights-drive-unit-250': 'aiea'
    };
    const reservationLinks = {
      'https://toast.app/r/totoya-hawaii': 'kaimuki',
      'https://www.google.com/maps/reserve/v/dine/c/HFvPblyZHtM': 'aiea'
    };
    const companyTargets = {
      '/': 'group', '/company': 'about', '/brands': 'brands', '/toriton': 'toriton',
      '/tenkichi': 'tenkichi', '/marujuu': 'marujuu', '/izakayalala': 'izakayalala',
      '/hiring': 'hiring', '/apply': 'apply', '/contact': 'contact'
    };
    const companyPlacements = ['our-group', 'sister-restaurants', 'careers', 'contact', 'header', 'rail', 'footer'];
    const navTargets = ['home', 'news', 'history', 'moments', 'menu', 'shopinfo', 'onlinestore', 'company', 'our-group', 'sister-restaurants', 'careers', 'contact'];
    const navPlacements = [...companyPlacements, 'home', 'news', 'history', 'moments', 'gallery'];
    const sceneKeys = {home: 'hero-film', 'story-scene-1': 'story-craft', 'story-scene-2': 'story-finish', 'story-scene-3': 'story-taste'};
    // Read the intended film action before the player's own click handler switches the label.
    document.addEventListener('click', event => {
      const control = event.target instanceof Element && event.target.closest('.ed-reel-toggle, .slide-controls button');
      if (!control || stopped) return;
      if (control.matches('.ed-reel-toggle')) {
        const scene = sceneKeys[control.closest('[data-reel]')?.id];
        if (scene && ['play', 'pause'].includes(control.dataset.action)) {
          record('video_toggle', scene + ':' + control.dataset.action, '', scene === 'hero-film' ? 'home' : 'history');
        }
      } else if (control.classList.contains('slide-playback')) {
        record('slideshow_toggle', control.dataset.state === 'playing' ? 'pause' : 'play', '', 'home');
      } else {
        const index = [...control.parentElement.querySelectorAll('[aria-pressed]')].indexOf(control);
        if (index >= 0 && index < 3) record('slideshow_select', String(index + 1), '', 'home');
      }
    }, true);
    document.addEventListener('click', event => {
      if (stopped || !(event.target instanceof Element)) return;
      const element = event.target;
      const link = element.closest('a[href]');
      if (!link) return;
      const url = new URL(link.href);
      const placement = placementFor(link);
      const externalBooking = ['rail', 'header', 'shopinfo', 'news', 'onlinestore'].includes(placement);
      const reserveShop = reservationLinks[url.origin + url.pathname];
      const orderShop = url.origin === 'https://order.toasttab.com' && orderSlugs[url.pathname];
      const store = link.closest('[data-store]')?.dataset.store;
      if (reserveShop && externalBooking && placement !== 'onlinestore') {
        record('reservation_click', '', reserveShop, placement);
      } else if (orderShop && externalBooking) {
        record('takeout_click', '', orderShop, placement);
      } else if (placement === 'shopinfo' && shopKeys.includes(store) && url.protocol === 'tel:') {
        record('phone_click', '', store, placement);
      } else if (placement === 'shopinfo' && shopKeys.includes(store) &&
        (url.hostname === 'maps.app.goo.gl' || (url.hostname === 'www.google.com' && url.pathname.startsWith('/maps/dir/')))) {
        record('map_click', '', store, placement);
      } else if (url.origin === location.origin && url.pathname === '/assets/totoya-all-locations-menu.pdf') {
        record('menu_pdf_click', 'menu', '', 'menu');
      } else if (url.hostname === 'www.instagram.com' && url.pathname.startsWith('/totoya_hawaii') &&
        ['header', 'rail', 'footer', 'history'].includes(placement)) {
        record('instagram_click', 'instagram', '', placement);
      } else {
        const selected = link.dataset.tab || link.dataset.selectStore;
        if (shopKeys.includes(selected)) {
          record('location_select', link.dataset.tab ? 'tab' : 'map', selected, 'shopinfo');
          return;
        }
        const companyKey = url.origin === 'https://funergygroup.com' ?
          companyTargets[url.pathname.replace(/\/$/, '') || '/'] :
          url.href === 'mailto:office@funergygroup.com' ? 'email' : '';
        if (companyKey && companyPlacements.includes(placement)) {
          record('company_link_click', companyKey, '', placement);
        } else if (url.origin === location.origin && navPlacements.includes(placement) &&
          !link.closest('.language-menu') && !link.hasAttribute('data-booking')) {
          const path = url.pathname.replace(/^\/(?:ja|es|fr|ko|zh-Hans|zh-Hant)(?=\/|$)/, '');
          const home = path === '/' || path === '/index.html';
          const company = path === '/company/' || path === '/company/index.html';
          const target = url.hash ? url.hash.slice(1) : company ? 'company' : 'home';
          if ((!home && !company) || !navTargets.includes(target)) return;
          record('navigation_click', target, '', placement);
        } else return;
      }
      send();
    });
    categories.forEach((category, index) => {
      let previouslyOpen = category.open;
      category.addEventListener('toggle', () => {
        if (category.open && !previouslyOpen) record('menu_category_open', String(index), '', 'menu');
        previouslyOpen = category.open;
      });
    });
    document.addEventListener('visibilitychange', () => {
      tick();
      if (document.visibilityState === 'hidden') send();
      else { lastTick = performance.now(); previousMeasurable = canMeasure(lastTick); }
    });
    window.addEventListener('pagehide', () => {
      send();
      suspended = true;
      previousMeasurable = false;
    });
    window.addEventListener('pageshow', event => {
      if (!event.persisted || stopped) return;
      suspended = false;
      lastTick = performance.now();
      lastActivity = lastTick;
      previousMeasurable = canMeasure(lastTick);
      sample(lastTick, previousMeasurable);
      send();
    });
    window.addEventListener('storage', event => { if (event.key === OPTOUT_KEY && optedOut()) stop(); });
    window.addEventListener('totoya:analytics-preference', stop);
    sample(lastTick, previousMeasurable);
    sampling = setInterval(tick, 500);
    heartbeat = setInterval(() => { if (document.visibilityState === 'visible' && !suspended) send(); }, 15000);
    send();
  } catch {
    // Unsupported APIs or storage policies must leave the public site fully usable.
  }
})();
