/* Store choices stay on this page. Google Maps opens only when a visitor follows a link. */
(() => {
  const t = window.totoyaText || ((key, ...values) => key.replace(/\{(\d+)\}/g, (_, i) => values[i]));
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
    if (control.hasAttribute('data-select-store')) section.querySelector('#visit-tab-' + id).focus({preventScroll: true});
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

  let routeRequest = 0;
  let clearRouteStatus = () => {};
  function bindRoute(link, message) {
    link.addEventListener('click', event => {
      // Modified clicks retain native new-tab behavior; Maps can get the origin itself.
      if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey ||
          event.shiftKey || event.altKey || !navigator.geolocation) return;
      event.preventDefault();
      clearRouteStatus();
      const attempt = ++routeRequest;
      const route = new URL(link.href);
      const fallback = document.createElement('a');
      fallback.href = route.href;
      fallback.textContent = t('Open Google Maps without sharing location');
      fallback.addEventListener('click', () => {
        routeRequest++;
        // Keep the link attached through the browser's native navigation / new-tab action.
        setTimeout(clearRouteStatus, 0);
      });
      message.replaceChildren(t('Getting your current location…') + ' ', fallback);
      clearRouteStatus = () => message.replaceChildren();
      const go = () => {
        if (attempt !== routeRequest) return;
        clearRouteStatus();
        window.location.assign(route.href);
      };
      try {
        navigator.geolocation.getCurrentPosition(position => {
          if (attempt !== routeRequest) return;
          const {latitude, longitude} = position.coords;
          if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            route.searchParams.set('origin', latitude.toFixed(6) + ',' + longitude.toFixed(6));
          }
          go();
        }, go, {enableHighAccuracy: true, timeout: 9000, maximumAge: 0});
      } catch {
        go();
      }
    });
  }
  shops.forEach(shop => bindRoute(shop.querySelector('[data-directions]'), shop.querySelector('[data-route-status]')));

  let request = 0;
  function nearby(lat, lon, button) {
    const nearest = shops.reduce((a, b) => distance(lat, lon, a) < distance(lat, lon, b) ? a : b);
    select(nearest.id);
    areaButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    const area = button ? button.textContent : t('your location');
    status.textContent = t('Closest to {0} by straight-line distance: TOTOYA {1}.', area, nearest.dataset.label);
  }
  areaButtons.forEach(button => button.addEventListener('click', () => {
    request++;
    useLocation.disabled = false;
    nearby(Number(button.dataset.lat), Number(button.dataset.lon), button);
  }));
  useLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
      status.textContent = t('Choose a landmark to find a nearby TOTOYA.');
      return;
    }
    const collectArea = window.totoyaAreaAccuracyWanted?.() === true;
    const current = ++request;
    useLocation.disabled = true;
    status.textContent = t('Finding your nearest TOTOYA…');
    navigator.geolocation.getCurrentPosition(position => {
      if (request !== current) return;
      useLocation.disabled = false;
      nearby(position.coords.latitude, position.coords.longitude, null);
      if (collectArea) window.totoyaVisitArea?.(position.coords);
    }, () => {
      if (request !== current) return;
      useLocation.disabled = false;
      status.textContent = t('Location unavailable. Choose a landmark to find a nearby TOTOYA.');
    }, {enableHighAccuracy: collectArea, timeout: 10000, maximumAge: collectArea ? 0 : 300000});
  });

  const mapBox = section.querySelector('.kv-map');
  if (!mapBox) return;
  function startMap() {
    const labels = overviewLabels(mapBox);
    if (window.L) initStreetMap(labels);
  }
  // Wait until the visitor reaches the map before requesting any public map tiles.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        startMap();
      }
    });
    observer.observe(mapBox);
  } else {
    startMap();
  }

  // Place measured labels near their true anchors. Reserve space for pins, controls and labels.
  function placeMapLabels(items, width, height, controls) {
    const clamp = (n, low, high) => Math.max(low, Math.min(high, n));
    const overlap = (r, b) => Math.max(0, Math.min(r.x + r.w, b.x + b.w) - Math.max(r.x, b.x))
      * Math.max(0, Math.min(r.y + r.h, b.y + b.h) - Math.max(r.y, b.y));
    const blocked = controls.concat(items.map(p => ({
      x: p.x - p.radius, y: p.y - p.radius, w: p.radius * 2, h: p.radius * 2,
    })));
    const preferred = {kaimuki: 'ne', piikoi: 'n', aiea: 'ne', hnl: 'w', downtown: 'w', moana: 'sw', waikiki: 's'};
    return items.map(item => {
      const {x, y, w, h} = item;
      let best, bestScore = Infinity, bestOverlap = Infinity;
      function consider(left, top, preference) {
        const rect = {x: Math.round(clamp(left, 3, width - w - 3)), y: Math.round(clamp(top, 3, height - h - 3)), w, h};
        const covered = blocked.reduce((sum, obstacle) => sum + overlap(rect, obstacle), 0);
        const endX = clamp(x, rect.x, rect.x + w);
        const endY = clamp(y, rect.y, rect.y + h);
        const score = Math.hypot(x - endX, y - endY) + preference;
        if (covered < bestOverlap || (covered === bestOverlap && score < bestScore)) {
          best = {...rect, endX, endY};
          bestOverlap = covered;
          bestScore = score;
        }
      }
      const directions = [preferred[item.id], 'n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'];
      for (const gap of [item.radius + 3, 22, 44]) {
        directions.forEach((dir, rank) => {
          const left = dir.includes('w') ? x - w - gap : dir.includes('e') ? x + gap : x - w / 2;
          const top = dir.includes('n') ? y - h - gap : dir.includes('s') ? y + gap : y - h / 2;
          consider(left, top, rank * 2);
        });
      }
      if (bestOverlap) {
        for (let top = 3; top < height - h + 9; top += 9)
          for (let left = 3; left < width - w + 9; left += 9) consider(left, top, 10);
      }
      blocked.push({x: best.x - 3, y: best.y - 3, w: w + 6, h: h + 6});
      return best;
    });
  }

  function overviewLabels(box) {
    const layer = box.querySelector('.kv-map-labels');
    const svg = layer.querySelector('svg');
    const nodes = new Map(Array.from(box.querySelectorAll('[data-point]'), el => [el.dataset.point, el]));
    const labels = Array.from(layer.querySelectorAll('[data-map-label]'), el => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const id = el.dataset.mapLabel;
      const nearbyButton = areaButtons.find(button => button.dataset.start === id);
      if (nearbyButton) el.addEventListener('click', () => nearbyButton.click());
      svg.append(line);
      return {id, el, line, radius: nearbyButton ? 4 : 9};
    });
    let projection = null;
    let frame = 0;
    function draw() {
      frame = 0;
      const bounds = box.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      layer.hidden = false;
      const visible = [];
      labels.forEach(label => {
        const fallbackPin = nodes.get(label.id).getBoundingClientRect();
        const {x, y} = projection ? projection(label.id) : {x: fallbackPin.left - bounds.left, y: fallbackPin.top - bounds.top};
        const show = x >= 0 && x <= bounds.width && y >= 0 && y <= bounds.height;
        label.el.hidden = !show;
        label.line.style.display = show ? '' : 'none';
        if (show) {
          const size = label.el.getBoundingClientRect();
          visible.push({...label, x, y, w: size.width, h: size.height});
        }
      });
      const controls = projection ? Array.from(box.querySelectorAll('.leaflet-control-zoom, .leaflet-control-attribution'), el => {
        const r = el.getBoundingClientRect();
        return {x: r.left - bounds.left - 3, y: r.top - bounds.top - 3, w: r.width + 6, h: r.height + 6};
      }) : [];
      const positions = placeMapLabels(visible, bounds.width, bounds.height, controls);
      positions.forEach((pos, i) => {
        const {el, line, x, y} = visible[i];
        el.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)';
        line.setAttribute('x1', x);
        line.setAttribute('y1', y);
        line.setAttribute('x2', pos.endX);
        line.setAttribute('y2', pos.endY);
      });
      box.classList.add('has-placed-labels');
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }
    if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(box);
    else window.addEventListener('resize', schedule);
    document.fonts?.ready.then(schedule);
    schedule();
    return {schedule, useProjection(fn) { projection = fn; schedule(); }};
  }

  function initStreetMap(labels) {
    const L = window.L;
    const container = mapBox.querySelector('.kv-live-map');
    const fallback = mapBox.querySelector('.kv-map-surface');
    const reset = section.querySelector('[data-map-reset]');
    const publicPlaces = new Map();
    const locations = new Map();
    const points = [];
    const map = L.map(container, {
      minZoom: 8, maxZoom: 18, scrollWheelZoom: false,
      maxBounds: [[20.96, -158.58], [21.93, -157.38]], maxBoundsViscosity: 1,
    });
    map.attributionControl.setPrefix(false);
    for (const [selector, key] of [['.leaflet-control-zoom-in','Zoom in'],['.leaflet-control-zoom-out','Zoom out']]) {
      const button = container.querySelector(selector);
      if (button) { button.title = t(key); button.setAttribute('aria-label', t(key)); }
    }
    map.on('popupopen', event => {
      const close = event.popup.getElement()?.querySelector('.leaflet-popup-close-button');
      if (close) { close.title = t('Close popup'); close.setAttribute('aria-label', t('Close popup')); }
    });

    function coords(element) {
      return [Number(element.dataset.lat), Number(element.dataset.lon)];
    }
    function fitPlaces() {
      const narrow = mapBox.clientWidth < 450;
      map.fitBounds(points, {paddingTopLeft: narrow ? [42, 55] : [78, 55],
        paddingBottomRight: narrow ? [30, 40] : [70, 52], maxZoom: 13, animate: false});
    }

    const originIcon = L.divIcon({className: 'kv-tile-origin', iconSize: [24, 24]});
    shops.forEach(shop => {
      const point = coords(shop);
      points.push(point);
      publicPlaces.set(shop.id, point);
      L.circle(point, {radius: Number(shop.dataset.areaRadius), color: shop.dataset.areaColor,
        weight: 2, opacity: .82, fillColor: shop.dataset.areaColor, fillOpacity: .24, interactive: false}).addTo(map);
      const shopIcon = L.divIcon({className: 'kv-tile-shop ' + shop.id, iconSize: [32, 32]});
      const marker = L.marker(point, {icon: shopIcon, title: 'TOTOYA ' + shop.dataset.label,
        alt: 'TOTOYA ' + shop.dataset.label, zIndexOffset: 300}).addTo(map);
      locations.set(shop.id, marker);

      const body = document.createElement('div');
      body.className = 'kv-bubble';
      const title = document.createElement('b');
      title.textContent = 'TOTOYA ' + shop.dataset.label;
      const address = document.createElement('div');
      address.textContent = shop.querySelector('address').firstChild.textContent;
      const more = document.createElement('a');
      more.href = '#' + shop.id;
      more.textContent = t('View shop details');
      more.addEventListener('click', () => { select(shop.id); shop.focus(); });
      const route = document.createElement('a');
      route.href = shop.querySelector('[data-directions]').href;
      route.textContent = t('Directions from my location');
      const routeStatus = document.createElement('p');
      routeStatus.className = 'kv-route-status';
      routeStatus.setAttribute('role', 'status');
      bindRoute(route, routeStatus);
      body.append(title, address, more, route, routeStatus);
      marker.bindPopup(body);
      marker.on('click', () => {
        select(shop.id);
        history.replaceState(null, '', '#' + shop.id);
      });
    });
    areaButtons.forEach(button => {
      const point = coords(button);
      points.push(point);
      publicPlaces.set(button.dataset.start, point);
      const marker = L.marker(point, {icon: originIcon, title: button.textContent,
        alt: button.textContent}).addTo(map);
      marker.bindPopup(button.textContent);
      marker.on('click', () => button.click());
    });
    fitPlaces();
    reset.addEventListener('click', fitPlaces);
    // A single label plane lays out shops and landmarks during pan, zoom and resize.
    map.on('move zoom resize', labels.schedule);
    map.on('popupopen', () => mapBox.classList.add('is-showing-popup'));
    map.on('popupclose', () => mapBox.classList.remove('is-showing-popup'));
    pins.filter(pin => pin.dataset.mapLabel).forEach(pin => pin.addEventListener('click', event => {
      if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && mapBox.classList.contains('is-live')) {
        locations.get(pin.dataset.selectStore).openPopup();
      }
    }));
    syncMapSelection = id => {
      locations.forEach((marker, key) => {
        marker.getElement()?.classList.toggle('is-chosen', key === id);
      });
    };
    syncMapSelection(shops.find(shop => !shop.hidden)?.id);
    // Tile requests follow the public map viewport. Device coordinates never center this map.
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, keepBuffer: 1,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">' + t('OpenStreetMap contributors') + '</a>',
    });
    let loaded = 0;
    let failed = 0;
    tiles.on('loading', () => { loaded = 0; failed = 0; });
    tiles.on('tileerror', () => { failed++; });
    tiles.on('tileload', () => {
      loaded++;
      if (!mapBox.classList.contains('is-live')) {
        mapBox.classList.add('is-live');
        labels.useProjection(id => map.latLngToContainerPoint(publicPlaces.get(id)));
      }
      container.removeAttribute('inert');
      container.removeAttribute('aria-hidden');
      fallback.setAttribute('inert', '');
      fallback.setAttribute('aria-hidden', 'true');
      reset.hidden = false;
    });
    tiles.on('load', () => {
      if (!failed || loaded) return;
      mapBox.classList.remove('is-live', 'is-showing-popup');
      container.setAttribute('inert', '');
      container.setAttribute('aria-hidden', 'true');
      fallback.removeAttribute('inert');
      fallback.removeAttribute('aria-hidden');
      reset.hidden = true;
      labels.useProjection(null);
      syncMapSelection = () => {};
      map.remove();
    });
    tiles.addTo(map);
  }
})();
