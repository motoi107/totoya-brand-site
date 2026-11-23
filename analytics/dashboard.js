(() => {
  'use strict';

  const api = 'https://totoya-production-analytics.m-kubota1984.chatgpt.site/api/public/analytics';
  const $ = id => document.getElementById(id);
  const number = new Intl.NumberFormat('ja-JP');
  const hst = 'Pacific/Honolulu';
  const localDay = new Intl.DateTimeFormat('en-CA', {timeZone: hst, year: 'numeric', month: '2-digit', day: '2-digit'});
  const displayDay = new Intl.DateTimeFormat('ja-JP', {timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric'});
  const monthDay = new Intl.DateTimeFormat('ja-JP', {timeZone: 'UTC', month: 'numeric', day: 'numeric'});
  const clock = new Intl.DateTimeFormat('ja-JP', {timeZone: hst, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'});
  const shops = {kaimuki: 'Kaimuki', piikoi: 'Piikoi', aiea: 'Aiea'};
  const sources = {direct: '直接アクセス', search: '検索', social: 'SNS', email: 'メール', paid: '広告', referral: '外部サイト', other: 'その他'};
  const pages = {
    '/': 'トップページ', '/about.html': 'Totoyaのストーリー', '/craft.html': 'ネギトロへのこだわり',
    '/menu.html': 'メニュー', '/locations.html': '店舗・予約', '/order.html': 'オンライン注文',
    '/news.html': 'お知らせ', '/company/': '運営会社', '/privacy/': 'プライバシー',
    '/media-credits.html': '写真・動画クレジット', '/recruit.html': '採用情報'
  };
  const metricNames = ['visitors', 'sessions', 'pageviews', 'reservationClicks', 'orderClicks'];
  const buttons = [...document.querySelectorAll('[data-period]')];
  const validPeriods = buttons.map(button => button.dataset.period);
  let period = '7';
  let displayedPeriod = '';
  let activeRequest;

  function localRange(key) {
    const parts = Object.fromEntries(localDay.formatToParts(new Date()).map(part => [part.type, part.value]));
    const end = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
    if (key === 'yesterday') end.setUTCDate(end.getUTCDate() - 1);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - (Number(key) || 1) + 1);
    return {from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10)};
  }

  function dateValue(iso) {
    return new Date(iso + 'T00:00:00Z');
  }

  function showRange({from, to}) {
    const start = displayDay.format(dateValue(from));
    const end = displayDay.format(dateValue(to));
    $('period-range').textContent = (from === to ? start : start + ' 〜 ' + end) + '（ハワイ時間）';
  }

  const validISO = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(+dateValue(value)) && dateValue(value).toISOString().slice(0, 10) === value;
  const counts = (row, keys) => row && keys.every(key => Number.isSafeInteger(row[key]) && row[key] >= 0);
  function validReport(data, key) {
    const p = data?.period;
    const days = Number(key) || 1;
    return p?.timeZone === hst && validISO(p.from) && validISO(p.to) && p.days === days &&
      counts(data.summary, metricNames) && Array.isArray(data.trend) && data.trend.length === days &&
      data.trend.every(day => validISO(day.date) && counts(day, ['pageviews', 'visitors', 'sessions'])) &&
      Array.isArray(data.pages) && data.pages.every(row => typeof row?.path === 'string' && counts(row, ['views'])) &&
      Array.isArray(data.sources) && data.sources.every(row => Object.hasOwn(sources, row?.channel) && counts(row, ['sessions', 'views'])) &&
      Array.isArray(data.shops) && data.shops.length === Object.keys(shops).length &&
      new Set(data.shops.map(row => row?.location)).size === data.shops.length &&
      data.shops.every(row => Object.hasOwn(shops, row?.location) && counts(row, ['reservationClicks', 'orderClicks']));
  }

  function tableRow(label, values) {
    const row = document.createElement('tr');
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = label;
    row.append(heading);
    for (const value of values) {
      const td = document.createElement('td');
      td.textContent = typeof value === 'number' ? number.format(value) : value;
      if (typeof value !== 'number') td.className = 'na';
      row.append(td);
    }
    return row;
  }

  function showTrend(trend) {
    const max = Math.max(...trend.map(day => day.pageviews));
    $('chart-empty').hidden = max > 0;
    $('chart').hidden = max === 0;
    if (max > 0) {
      const unit = 10 ** Math.floor(Math.log10(max));
      const top = Math.max(2, [1, 2, 4, 6, 8, 10].find(factor => factor * unit >= max) * unit);
      $('scale-top').textContent = number.format(top);
      $('scale-mid').textContent = number.format(top / 2);
      $('chart-bars').style.gridTemplateColumns = 'repeat(' + trend.length + ', minmax(0, 1fr))';
      $('chart-bars').replaceChildren(...trend.map(day => {
        const bar = document.createElement('span');
        bar.className = 'chart-bar';
        bar.style.height = 100 * day.pageviews / top + '%';
        bar.title = monthDay.format(dateValue(day.date)) + '：' + number.format(day.pageviews) + ' 閲覧';
        return bar;
      }));
      const labelIndices = new Set([0, Math.floor((trend.length - 1) / 2), trend.length - 1]);
      $('chart-dates').replaceChildren(...Array.from(labelIndices, i => {
        const label = document.createElement('span');
        label.textContent = monthDay.format(dateValue(trend[i].date));
        return label;
      }));
    }
    $('daily-rows').replaceChildren(...trend.slice().reverse().map(day =>
      tableRow(monthDay.format(dateValue(day.date)), [day.visitors, day.sessions, day.pageviews])));
  }

  function showRanked(name, rows) {
    $(name + '-table').hidden = !rows.length;
    $(name + '-empty').hidden = rows.length > 0;
  }

  function showReport(data) {
    showRange(data.period);
    for (const el of document.querySelectorAll('[data-metric]')) el.textContent = number.format(data.summary[el.dataset.metric]);
    showTrend(data.trend);
    $('shop-rows').replaceChildren(...Object.entries(shops).map(([key, name]) => {
      const row = data.shops.find(shop => shop.location === key);
      return tableRow(name, [key === 'piikoi' ? '予約対象外' : row.reservationClicks, row.orderClicks]);
    }));
    const viewed = data.pages.filter(row => row.views).sort((a, b) => b.views - a.views);
    showRanked('pages', viewed);
    $('page-rows').replaceChildren(...viewed.map(row => tableRow(pages[row.path] || row.title || row.path, [row.views])));
    const referred = data.sources.filter(row => row.views || row.sessions).sort((a, b) => b.sessions - a.sessions || b.views - a.views);
    showRanked('channels', referred);
    $('source-rows').replaceChildren(...referred.map(row => tableRow(sources[row.channel], [row.sessions, row.views])));
    $('report').hidden = false;
    $('fetched-at').textContent = '取得時刻 ' + clock.format(new Date()) + ' HST';
  }

  async function load(key) {
    if (!validPeriods.includes(key)) return;
    activeRequest?.abort();
    const controller = new AbortController();
    activeRequest = controller;
    period = key;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.period === key)));
    const showingPrevious = displayedPeriod === key && !$('report').hidden;
    if (!showingPrevious) {
      $('report').hidden = true;
      $('fetched-at').textContent = '';
      showRange(localRange(key));
    }
    $('status').removeAttribute('data-error');
    $('status').textContent = showingPrevious ? '数値を更新しています…' : '集計を読み込んでいます…';
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const url = new URL(api);
      url.searchParams.set('period', key);
      const response = await fetch(url.href, {credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store', signal: controller.signal});
      if (!response.ok) throw new Error('Report unavailable');
      const data = await response.json();
      if (controller !== activeRequest) return;
      if (!validReport(data, key)) throw new Error('Unexpected report');
      showReport(data);
      displayedPeriod = key;
      $('status').textContent = '';
    } catch {
      if (controller !== activeRequest) return;
      $('status').setAttribute('data-error', '');
      $('status').textContent = showingPrevious
        ? '更新できませんでした。前回取得した数値を表示しています。「更新」で再取得できます。'
        : '集計を取得できませんでした。少し待ってから「更新」を押してください。';
    } finally {
      clearTimeout(timer);
    }
  }

  for (const button of buttons) button.addEventListener('click', () => load(button.dataset.period));
  $('refresh').addEventListener('click', () => load(period));
  load(period);
})();
