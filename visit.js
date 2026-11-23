/* Store choices stay on this page. Google Maps opens only when a visitor follows a link. */
(() => {
  const dialog = document.querySelector('#booking-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    const views = Array.from(dialog.querySelectorAll('[data-booking-view]'));
    const close = dialog.querySelector('.kv-close');
    let opener;
    document.addEventListener('click', event => {
      const link = event.target.closest('[data-booking]');
      if (!link || event.defaultPrevented || event.button > 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const kind = link.dataset.booking;
      if (!views.some(panel => panel.dataset.bookingView === kind)) return;
      event.preventDefault();
      const drawer = link.closest('details');
      opener = drawer ? drawer.querySelector('summary') : link;
      if (drawer) drawer.open = false;
      views.forEach(panel => { panel.hidden = panel.dataset.bookingView !== kind; });
      dialog.setAttribute('aria-labelledby', 'visit-dialog-' + kind);
      dialog.showModal();
      close.focus();
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right ||
          event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => opener?.focus());
  }

  const section = document.querySelector('.kv-visit');
  if (!section) return;
  const shops = Array.from(section.querySelectorAll('[data-store]'));
  const tabs = Array.from(section.querySelectorAll('[data-tab]'));
  const pins = Array.from(section.querySelectorAll('[data-select-store]'));
  const finder = section.querySelector('[data-locator]');
  const useLocation = finder.querySelector('[data-current-location]');
  const areaButtons = Array.from(finder.querySelectorAll('[data-start]'));
  const status = finder.querySelector('[aria-live]');
  const tabList = section.querySelector('.kv-tabs');

  let syncMapSelection = () => {};
  function select(id) {
    if (!shops.some(panel => panel.id === id)) return;
    shops.forEach(panel => { panel.hidden = panel.id !== id; });
    tabs.forEach(tab => {
      const chosen = tab.dataset.tab === id;
      tab.setAttribute('aria-selected', String(chosen));
      tab.tabIndex = chosen ? 0 : -1;
    });
    pins.forEach(pin => pin.setAttribute('aria-current', String(pin.dataset.selectStore === id)));
    syncMapSelection(id);
  }

  tabList.setAttribute('role', 'tablist');
  shops.forEach(panel => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', 'visit-tab-' + panel.id);
    panel.tabIndex = 0;
  });
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', tab.dataset.tab);
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else return;
      event.preventDefault();
      tabs[next].click();
      tabs[next].focus();
    });
  });
  [...tabs, ...pins].forEach(control => control.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const id = control.dataset.tab || control.dataset.selectStore;
    select(id);
    history.replaceState(null, '', '#' + id);
    if (control.hasAttribute('data-select-store')) section.querySelector('#visit-tab-' + id).focus();
  }));
  function selectFromHash() {
    const id = location.hash.slice(1);
    select(shops.some(shop => shop.id === id) ? id : shops[0].id);
  }
  selectFromHash();
  window.addEventListener('hashchange', selectFromHash);
  finder.hidden = false;

  function distance(lat, lon, shop) {
    const radians = Math.PI / 180;
    const otherLat = Number(shop.dataset.lat);
    const otherLon = Number(shop.dataset.lon);
    const dLat = (lat - otherLat) * radians;
    const dLon = (lon - otherLon) * radians;
    return Math.sin(dLat / 2) ** 2 +
      Math.cos(lat * radians) * Math.cos(otherLat * radians) * Math.sin(dLon / 2) ** 2;
  }

  let request = 0;
  function nearby(lat, lon, button) {
    const nearest = shops.reduce((a, b) => distance(lat, lon, a) < distance(lat, lon, b) ? a : b);
    select(nearest.id);
    areaButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const area = button ? button.textContent : 'your location';
    status.textContent = 'Closest to ' + area + ' by straight-line distance: TOTOYA ' + nearest.dataset.label + '.';
    shops.forEach(shop => {
      const a = shop.querySelector('[data-directions]');
      const url = new URL(a.href);
      if (button) url.searchParams.set('origin', button.dataset.origin);
      else url.searchParams.delete('origin');
      a.href = url.href;
    });
  }
  areaButtons.forEach(button => button.addEventListener('click', () => {
    request++;
    useLocation.disabled = false;
    nearby(Number(button.dataset.lat), Number(button.dataset.lon), button);
  }));
  useLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
      status.textContent = 'Choose a starting area above to find a nearby TOTOYA.';
      return;
    }
    const current = ++request;
    useLocation.disabled = true;
    status.textContent = 'Finding your nearest TOTOYA…';
    navigator.geolocation.getCurrentPosition(position => {
      if (request !== current) return;
      useLocation.disabled = false;
      nearby(position.coords.latitude, position.coords.longitude, null);
    }, () => {
      if (request !== current) return;
      useLocation.disabled = false;
      status.textContent = 'Location unavailable. Choose a starting area above.';
    }, {enableHighAccuracy: false, timeout: 10000, maximumAge: 300000});
  });

  const mapBox = section.querySelector('.kv-map');
  if (!window.L || !mapBox) return;
  // Wait until the visitor reaches the map before requesting any public map tiles.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        initStreetMap();
      }
    });
    observer.observe(mapBox);
  } else {
    initStreetMap();
  }

  function initStreetMap() {
    const L = window.L;
    const container = mapBox.querySelector('.kv-live-map');
    const fallback = mapBox.querySelector('.kv-map-surface');
    const reset = section.querySelector('[data-map-reset]');
    const note = section.querySelector('[data-map-note]');
    const locations = new Map();
    const points = [];
    const map = L.map(container, {
      minZoom: 8, maxZoom: 18, scrollWheelZoom: false,
      maxBounds: [[20.96, -158.58], [21.93, -157.38]], maxBoundsViscosity: 1,
    });
    map.attributionControl.setPrefix(false);

    function coords(element) {
      return [Number(element.dataset.lat), Number(element.dataset.lon)];
    }
    function fitPlaces() {
      map.fitBounds(points, {padding: [35, 38], maxZoom: 13, animate: false});
    }
    const shopIcon = L.divIcon({className: 'kv-tile-shop', iconSize: [32, 32]});
    const originIcon = L.divIcon({className: 'kv-tile-origin', iconSize: [24, 24]});
    shops.forEach(shop => {
      const point = coords(shop);
      points.push(point);
      const marker = L.marker(point, {icon: shopIcon, title: 'TOTOYA ' + shop.dataset.label,
        alt: 'TOTOYA ' + shop.dataset.label, zIndexOffset: 300}).addTo(map);
      locations.set(shop.id, marker);
      const tab = tabs.find(item => item.dataset.tab === shop.id);
      marker.bindTooltip(tab.textContent.trim(), {permanent: true, direction: 'top',
        offset: [0, -7], className: 'kv-map-label'});
      const body = document.createElement('div');
      body.className = 'kv-bubble';
      const title = document.createElement('b');
      title.textContent = 'TOTOYA ' + shop.dataset.label;
      const address = document.createElement('div');
      address.textContent = shop.querySelector('address').firstChild.textContent;
      const more = document.createElement('a');
      more.href = '#' + shop.id;
      more.textContent = 'View shop details';
      more.addEventListener('click', () => { select(shop.id); shop.focus(); });
      body.append(title, address, more);
      marker.bindPopup(body);
      marker.on('click', () => {
        select(shop.id);
        history.replaceState(null, '', '#' + shop.id);
      });
    });
    areaButtons.forEach(button => {
      const point = coords(button);
      points.push(point);
      const isAirport = button.dataset.start === 'hnl';
      L.circle(point, {
        radius: isAirport ? 850 : 600, stroke: false,
        fillColor: isAirport ? '#537a99' : '#789b72', fillOpacity: .2, interactive: false,
      }).addTo(map);
      const marker = L.marker(point, {icon: originIcon, title: button.textContent,
        alt: button.textContent}).addTo(map);
      marker.bindTooltip(button.textContent, {direction: 'bottom'});
      marker.bindPopup(button.textContent);
      marker.on('click', () => button.click());
    });
    fitPlaces();
    reset.addEventListener('click', fitPlaces);
    syncMapSelection = id => {
      locations.forEach((marker, key) => {
        marker.getElement()?.classList.toggle('is-chosen', key === id);
      });
    };
    syncMapSelection(shops.find(shop => !shop.hidden)?.id);
    // Only shop and landmark coordinates are used here. GPS stays inside the nearest-shop calculation.
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, keepBuffer: 1,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
    });
    let loaded = 0;
    let failed = 0;
    tiles.on('loading', () => { loaded = 0; failed = 0; });
    tiles.on('tileerror', () => { failed++; });
    tiles.on('tileload', () => {
      loaded++;
      mapBox.classList.add('is-live');
      container.removeAttribute('inert');
      container.removeAttribute('aria-hidden');
      fallback.setAttribute('inert', '');
      fallback.setAttribute('aria-hidden', 'true');
      reset.hidden = false;
      note.hidden = false;
    });
    tiles.on('load', () => {
      if (!failed || loaded) return;
      mapBox.classList.remove('is-live');
      container.setAttribute('inert', '');
      container.setAttribute('aria-hidden', 'true');
      fallback.removeAttribute('inert');
      fallback.removeAttribute('aria-hidden');
      reset.hidden = true;
      note.hidden = true;
      syncMapSelection = () => {};
      map.remove();
    });
    tiles.addTo(map);
  }
})();
