/* ================= Super Admin page — shop management & performance ================= */
function marketAgg() {
  const from = dayKey(shiftDay(-6));
  const qtyByName = {}, prevQty = {}, lowCount = {};
  DB.sales.forEach(function (s) {
    if (s.day < from) return;
    const sh = shopById(s.shopId);
    if (!sh || sh.status === 'suspended') return;
    s.items.forEach(function (it) {
      qtyByName[it.name] = (qtyByName[it.name] || 0) + it.qty;
    });
  });
  const prevFrom = dayKey(shiftDay(-13)), prevTo = dayKey(shiftDay(-7));
  DB.sales.forEach(function (s) {
    if (s.day < prevFrom || s.day > prevTo) return;
    const sh = shopById(s.shopId);
    if (!sh || sh.status === 'suspended') return;
    s.items.forEach(function (it) { prevQty[it.name] = (prevQty[it.name] || 0) + it.qty; });
  });
  DB.products.forEach(function (p) {
    const sh = shopById(p.shopId);
    if (!sh || sh.status === 'suspended') return;
    if (p.stock <= sh.lowStockLevel) lowCount[p.name] = (lowCount[p.name] || 0) + 1;
  });
  const top = Object.keys(qtyByName).map(n => ({ name: n, qty: qtyByName[n] }))
    .sort((a, b) => b.qty - a.qty).slice(0, 6);
  const rising = Object.keys(qtyByName)
    .map(n => ({ name: n, now: qtyByName[n], before: prevQty[n] || 0 }))
    .filter(x => x.now > x.before && x.now >= 3)
    .map(x => ({ name: x.name, now: x.now, before: x.before, pct: x.before === 0 ? 100 : Math.round((x.now - x.before) / x.before * 100) }))
    .sort((a, b) => b.pct - a.pct).slice(0, 5);
  const finishing = Object.keys(lowCount).map(n => ({ name: n, shops: lowCount[n] }))
    .sort((a, b) => b.shops - a.shops).slice(0, 6);
  const avgOf = key => {
    const rows = DB.products.filter(p => p.name.toLowerCase().indexOf(key) === 0 ||
      p.name.toLowerCase().indexOf(' ' + key) > -1 || p.name.toLowerCase().indexOf(key) > -1);
    if (!rows.length) return null;
    const retail = rows.reduce((t, p) => t + p.retail, 0) / rows.length;
    const sold = [];
    DB.sales.forEach(s => { if (s.day >= from) s.items.forEach(it => { if (it.name.toLowerCase().indexOf(key) > -1) sold.push(it.price); }); });
    const soldAvg = sold.length ? sold.reduce((a, b) => a + b, 0) / sold.length : retail;
    return { retail: Math.round(retail), sold: Math.round(soldAvg) };
  };
  return {
    top, rising, finishing,
    prices: [
      { key: 'Sugar', label: 'Sugar (avg)', v: avgOf('sugar') },
      { key: 'Rice', label: 'Rice (avg)', v: avgOf('rice') },
      { key: 'Cooking Oil', label: 'Cooking Oil (avg)', v: avgOf('cooking oil') }
    ].filter(x => x.v)
  };
}
function superShopStats(sh) {
  const today = dayKey();
  const from7 = dayKey(shiftDay(-6));
  const prods = productsOf(sh.id);
  let s7 = 0, tx7 = 0, todaySales = 0, txToday = 0, totalAll = 0, lastDay = '';
  DB.sales.forEach(function (s) {
    if (s.shopId !== sh.id) return;
    totalAll += s.total;
    if (s.day > lastDay) lastDay = s.day;
    if (s.day >= from7) { s7 += s.total; tx7 += 1; }
    if (s.day === today) { todaySales += s.total; txToday += 1; }
  });
  const low = prods.filter(p => p.stock > 0 && p.stock <= sh.lowStockLevel).length;
  const out = prods.filter(p => p.stock <= 0).length;
  const inStock = prods.filter(p => p.stock > sh.lowStockLevel).length;
  const stockVal = sum(prods, p => p.buy * p.stock);
  const qtyByName = {};
  DB.sales.forEach(function (s) {
    if (s.shopId !== sh.id || s.day < from7) return;
    s.items.forEach(it => { qtyByName[it.name] = (qtyByName[it.name] || 0) + it.qty; });
  });
  const topProd = Object.keys(qtyByName).map(n => ({ name: n, qty: qtyByName[n] })).sort((a, b) => b.qty - a.qty)[0] || null;
  let health = 'healthy', healthLabel = 'Healthy';
  if (!prods.length || out === prods.length) { health = 'empty'; healthLabel = 'No stock'; }
  else if (out > 0) { health = 'out'; healthLabel = out + ' out of stock'; }
  else if (low > 0) { health = 'low'; healthLabel = low + ' low'; }
  if (tx7 === 0 && health === 'healthy') { health = 'quiet'; healthLabel = 'No sales 7d'; }
  return { s7, tx7, todaySales, txToday, totalAll, lastDay, prods: prods.length, low, out, inStock, stockVal, topProd, health, healthLabel };
}
function superHealthBadge(st) {
  if (st.health === 'healthy') return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700">Healthy</span>';
  if (st.health === 'low') return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700">' + esc(st.healthLabel) + '</span>';
  if (st.health === 'out') return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">' + esc(st.healthLabel) + '</span>';
  if (st.health === 'empty') return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">No stock</span>';
  return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-200 text-slate-600">No sales 7d</span>';
}

function superFilteredShops() {
  if (S.supQ == null) S.supQ = '';
  if (!S.supStatus) S.supStatus = 'all';
  if (!S.supHealth) S.supHealth = 'all';
  if (!S.supSort) S.supSort = 'sales7_desc';
  const q = String(S.supQ || '').trim().toLowerCase();
  let list = DB.shops.map(s => ({ shop: s, st: superShopStats(s) }));
  list = list.filter(function (r) {
    const s = r.shop;
    if (S.supStatus !== 'all' && s.status !== S.supStatus) return false;
    if (S.supHealth === 'with_stock' && r.st.prods - r.st.out <= 0) return false;
    if (S.supHealth === 'no_stock' && !(r.st.prods === 0 || r.st.out === r.st.prods)) return false;
    if (S.supHealth === 'low' && r.st.low === 0) return false;
    if (S.supHealth === 'out' && r.st.out === 0) return false;
    if (S.supHealth === 'healthy' && r.st.health !== 'healthy') return false;
    if (S.supHealth === 'quiet' && r.st.tx7 !== 0) return false;
    if (S.supHealth === 'selling' && r.st.tx7 === 0) return false;
    if (q) {
      const hay = (s.name + ' ' + s.owner + ' ' + s.location + ' ' + s.email + ' ' + s.phone).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });
  const by = S.supSort;
  list.sort(function (a, b) {
    if (by === 'sales7_desc') return b.st.s7 - a.st.s7;
    if (by === 'sales7_asc') return a.st.s7 - b.st.s7;
    if (by === 'today_desc') return b.st.todaySales - a.st.todaySales;
    if (by === 'tx_desc') return b.st.tx7 - a.st.tx7;
    if (by === 'stock_desc') return (b.st.prods - b.st.out) - (a.st.prods - a.st.out);
    if (by === 'out_desc') return b.st.out - a.st.out;
    if (by === 'low_desc') return b.st.low - a.st.low;
    if (by === 'value_desc') return b.st.stockVal - a.st.stockVal;
    if (by === 'name_asc') return a.shop.name.localeCompare(b.shop.name);
    return b.st.s7 - a.st.s7;
  });
  return list;
}
function superShopRowsHTML() {
  const list = superFilteredShops();
  if (!list.length) return '<tr><td class="td text-slate-400 text-center py-6" colspan="9">No shops match this filter. Try clearing search or filters.</td></tr>';
  return list.map(function (r) {
    const s = r.shop, st = r.st;
    const withStock = st.prods - st.out;
    return '<tr class="border-b border-slate-100 hover:bg-slate-50">' +
      '<td class="td font-semibold text-slate-800">' + esc(s.name) +
      '<div class="text-xs text-slate-400 font-normal">' + esc(s.type) + ' &middot; ' + esc(s.location) + '</div>' +
      '<div class="text-xs text-slate-400 font-normal">' + esc(s.phone || '') + '</div></td>' +
      '<td class="td">' + esc(s.owner) + '<div class="text-xs text-slate-400">' + esc(s.email) + '</div>' +
      '<div class="text-xs text-slate-400">' + esc(PLANS[s.plan] ? PLANS[s.plan].name : s.plan) + '</div></td>' +
      '<td class="td">' + statusBadge(s.status) +
      (s.status === 'trial' ? '<div class="text-xs text-slate-400 mt-1">ends ' + fmtShort(dayKey(new Date(s.trialEndsAt))) + '</div>' : '') +
      '<div class="mt-1">' + superHealthBadge(st) + '</div></td>' +
      '<td class="td text-right font-bold text-slate-800">' + fmt(st.s7) +
      '<div class="text-xs text-slate-400 font-normal">' + st.tx7 + ' sales, 7d</div>' +
      '<div class="text-xs text-slate-400 font-normal">today: ' + fmt(st.todaySales) + '</div></td>' +
      '<td class="td text-right">' + fmt(st.totalAll) + '<div class="text-xs text-slate-400">' + (st.lastDay ? 'last: ' + fmtShort(st.lastDay) : 'no sales yet') + '</div></td>' +
      '<td class="td text-center"><span class="font-bold text-slate-800">' + withStock + '</span><span class="text-slate-400 text-xs"> / ' + st.prods + '</span>' +
      '<div class="text-xs mt-0.5">' + (st.out ? '<span class="font-bold text-red-600">' + st.out + ' out</span>' : '<span class="text-slate-400">0 out</span>') +
      (st.low ? ' &middot; <span class="font-bold text-amber-600">' + st.low + ' low</span>' : '') + '</div>' +
      '<div class="text-xs text-slate-400">val: ' + fmt(st.stockVal) + '</div></td>' +
      '<td class="td text-xs text-slate-600">' + (st.topProd ? esc(st.topProd.name) + '<div class="text-slate-400">' + fmt(st.topProd.qty) + ' sold (7d)</div>' : '<span class="text-slate-400">-</span>') + '</td>' +
      '<td class="td text-right whitespace-nowrap">' +
      '<button class="btn-ghost btn-sm" data-action="super-view" data-id="' + s.id + '">' + bi('eye-fill') + ' View</button> ' +
      (s.status === 'suspended'
        ? '<button class="btn-primary btn-sm" data-action="shop-toggle" data-id="' + s.id + '">Start</button>'
        : '<button class="btn-danger btn-sm" data-action="shop-toggle" data-id="' + s.id + '">Stop</button>') +
      '</td></tr>';
  }).join('');
}
function superRankPanel(title, icon, rows, emptyMsg) {
  let h = '<div class="card p-4"><h3 class="font-bold text-slate-800 text-sm mb-3 h-ic">' + bi(icon) + ' ' + esc(title) + '</h3>';
  h += '<ul class="space-y-2">';
  if (!rows.length) h += '<li class="text-xs text-slate-400">' + esc(emptyMsg) + '</li>';
  rows.forEach(function (r, i) {
    h += '<li class="flex items-center justify-between text-sm gap-2">' +
      '<span class="truncate text-slate-700"><span class="font-bold text-slate-400 mr-1">' + (i + 1) + '.</span>' + esc(r.name) +
      '<div class="text-xs text-slate-400 truncate">' + esc(r.sub || '') + '</div></span>' +
      '<span class="text-right shrink-0"><span class="badge ' + r.badgeCls + '">' + esc(r.badge) + '</span>' +
      (r.sub2 ? '<div class="text-xs text-slate-400 mt-0.5">' + esc(r.sub2) + '</div>' : '') + '</span></li>';
  });
  h += '</ul></div>';
  return h;
}
function pageSuper() {
  const active = DB.shops.filter(s => s.status === 'active');
  const trial = DB.shops.filter(s => s.status === 'trial');
  const stopped = DB.shops.filter(s => s.status === 'suspended');
  const mrr = sum(active, s => (PLANS[s.plan] ? PLANS[s.plan].price : 0));
  const k = dayKey();
  let todaySales = 0, todayTx = 0;
  DB.sales.forEach(s => { if (s.day === k) { todaySales += s.total; todayTx += 1; } });
  const from7 = dayKey(shiftDay(-6));
  let w7 = 0;
  DB.sales.forEach(s => { if (s.day >= from7) w7 += s.total; });
  const allStats = DB.shops.map(s => ({ shop: s, st: superShopStats(s) }));
  const withStock = allStats.filter(r => r.st.prods - r.st.out > 0).length;
  const noStock = DB.shops.length - withStock;
  const needRestock = allStats.filter(r => r.st.out > 0 || r.st.low > 0).length;
  const quiet = allStats.filter(r => r.st.tx7 === 0).length;
  const m = marketAgg();
  const topShops = allStats.slice().sort((a, b) => b.st.s7 - a.st.s7).slice(0, 5).map(r => ({
    name: r.shop.name, sub: r.shop.location,
    badge: fmt(r.st.s7) + ' UGX', badgeCls: 'bg-brand-100 text-brand-800', sub2: r.st.tx7 + ' sales (7d)'
  }));
  const worstShops = allStats.slice().sort((a, b) => a.st.s7 - b.st.s7).slice(0, 5).map(r => ({
    name: r.shop.name, sub: r.shop.location,
    badge: fmt(r.st.s7) + ' UGX', badgeCls: r.st.s7 === 0 ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600', sub2: r.st.tx7 + ' sales (7d)'
  }));
  const stockLeaders = allStats.slice().sort((a, b) => (b.st.prods - b.st.out) - (a.st.prods - a.st.out)).slice(0, 5).map(r => ({
    name: r.shop.name, sub: r.shop.location,
    badge: (r.st.prods - r.st.out) + ' / ' + r.st.prods + ' in stock', badgeCls: 'bg-emerald-100 text-emerald-700', sub2: r.st.out ? r.st.out + ' out of stock' : 'all stocked'
  }));
  const stockRisk = allStats.filter(r => r.st.out > 0 || r.st.low > 0).sort((a, b) => (b.st.out + b.st.low) - (a.st.out + a.st.low)).slice(0, 5).map(r => ({
    name: r.shop.name, sub: r.shop.location,
    badge: r.st.out + ' out, ' + r.st.low + ' low', badgeCls: 'bg-red-100 text-red-700', sub2: 'stock value ' + fmt(r.st.stockVal)
  }));
  const stat = (label, value, sub) =>
    '<div class="card p-4"><div class="text-xs font-bold uppercase tracking-wide text-slate-500">' + esc(label) + '</div>' +
    '<div class="text-2xl font-black text-slate-800 mt-1">' + value + '</div>' +
    '<div class="text-xs text-slate-500 mt-0.5">' + esc(sub) + '</div></div>';
  let h = '<div class="space-y-6">';
  h += '<div><h2 class="text-lg font-black text-slate-800">Shop management</h2>' +
    '<p class="text-sm text-slate-500">See how every shop performs, who has stock, who is out, and who sells most.</p></div>';
  h += '<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">' +
    stat('Total Shops', fmt(DB.shops.length), active.length + ' active, ' + trial.length + ' trial, ' + stopped.length + ' stopped') +
    stat('Sales Today (all shops)', fmt(todaySales) + ' UGX', todayTx + ' sales today') +
    stat('Sales Last 7 Days', fmt(w7) + ' UGX', 'across all shops') +
    stat('Money from Subscriptions', fmt(mrr) + ' UGX', 'this month') +
    stat('Shops With Stock', fmt(withStock), noStock + ' with nothing in stock') +
    stat('Shops Needing Restock', fmt(needRestock), 'have out or low items') +
    stat('Shops With No Sales (7d)', fmt(quiet), 'need attention') +
    stat('Products Out (all shops)', fmt(sum(allStats, r => r.st.out)), 'items at zero stock') +
    '</div>';
  h += '<div class="grid gap-4 lg:grid-cols-4">';
  h += superRankPanel('Top selling shops (7 days)', 'trophy-fill', topShops, 'No sales yet.');
  h += superRankPanel('Lowest selling shops (7 days)', 'graph-down-arrow', worstShops, 'No shops.');
  h += superRankPanel('Best stocked shops', 'box-seam-fill', stockLeaders, 'No stock anywhere.');
  h += superRankPanel('Shops needing stock help', 'exclamation-triangle-fill', stockRisk, 'Stock levels look healthy.');
  h += '</div>';
  h += '<div class="card overflow-hidden">';
  h += '<div class="px-4 py-3 border-b border-slate-200"><div class="flex items-center justify-between flex-wrap gap-2">' +
    '<h2 class="font-bold text-slate-800">All shops — performance and stock</h2>' +
    '<span class="text-xs text-slate-500 font-semibold">' + superFilteredShops().length + ' of ' + DB.shops.length + ' shown</span></div>';
  h += '<div class="mt-3 flex flex-col xl:flex-row gap-2 xl:items-center">';
  h += '<input class="input xl:w-64" data-change="sup-search" value="' + esc(S.supQ || '') + '" placeholder="Search shop, owner, location...">';
  h += '<div class="flex gap-1.5 flex-wrap items-center"><span class="text-xs font-bold text-slate-500">Status:</span>';
  [['all', 'All'], ['active', 'Active'], ['trial', 'Trial'], ['suspended', 'Stopped']].forEach(function (o) {
    h += '<button class="btn btn-sm ' + (S.supStatus === o[0] ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600') +
      '" data-action="sup-status" data-v="' + o[0] + '">' + o[1] + '</button>';
  });
  h += '</div><div class="flex gap-1.5 flex-wrap items-center"><span class="text-xs font-bold text-slate-500">Stock:</span>';
  [['all', 'All'], ['with_stock', 'With stock'], ['no_stock', 'No stock'], ['low', 'Has low'], ['out', 'Has out'], ['selling', 'Selling'], ['quiet', 'No sales 7d']].forEach(function (o) {
    h += '<button class="btn btn-sm ' + (S.supHealth === o[0] ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600') +
      '" data-action="sup-health" data-v="' + o[0] + '">' + o[1] + '</button>';
  });
  h += '</div>';
  h += '<select class="input xl:w-56 xl:ml-auto" data-change="sup-sort">' +
    [['sales7_desc', 'Top sales (7d)'], ['sales7_asc', 'Lowest sales (7d)'], ['today_desc', 'Sales today'], ['tx_desc', 'Most sales count'], ['stock_desc', 'Most in stock'], ['out_desc', 'Most out of stock'], ['low_desc', 'Most low items'], ['value_desc', 'Stock value'], ['name_asc', 'Name A-Z']].map(function (o) {
      return '<option value="' + o[0] + '"' + (S.supSort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('') + '</select>';
  h += '</div></div>';
  h += '<div class="overflow-x-auto"><table class="w-full min-w-[980px]"><thead class="bg-slate-50"><tr>' +
    '<th class="th">Shop</th><th class="th">Owner and plan</th><th class="th">Status</th>' +
    '<th class="th text-right">Sales 7d (UGX)</th><th class="th text-right">All-time sales</th>' +
    '<th class="th text-center">Stock (in / total)</th><th class="th">Top product 7d</th><th class="th text-right">Action</th>' +
    '</tr></thead><tbody id="sup-table">' + superShopRowsHTML() + '</tbody></table></div></div>';
  h += '<div class="grid gap-4 lg:grid-cols-3">';
  h += '<div class="card p-4"><h3 class="font-bold text-slate-800 text-sm mb-3 h-ic">' + bi('trophy-fill') + ' Selling most (products)</h3><ul class="space-y-2">' +
    (m.top.length ? m.top.map((x, i) => '<li class="flex items-center justify-between text-sm gap-2"><span class="truncate text-slate-700"><span class="font-bold text-slate-400 mr-1">' + (i + 1) + '.</span>' + esc(x.name) + '</span><span class="badge bg-brand-100 text-brand-800">' + fmt(x.qty) + ' sold</span></li>').join('') : '<li class="text-xs text-slate-400">No sales yet.</li>') + '</ul></div>';
  h += '<div class="card p-4"><h3 class="font-bold text-slate-800 text-sm mb-3 h-ic">' + bi('graph-up-arrow') + ' Going up in demand</h3><ul class="space-y-2">' +
    (m.rising.length ? m.rising.map(x => '<li class="flex items-center justify-between text-sm gap-2"><span class="truncate text-slate-700">' + esc(x.name) + '</span><span class="badge bg-emerald-100 text-emerald-700">' + x.pct + '% up</span></li>').join('') : '<li class="text-xs text-slate-400">Demand is stable.</li>') + '</ul></div>';
  h += '<div class="card p-4"><h3 class="font-bold text-slate-800 text-sm mb-3 h-ic">' + bi('exclamation-triangle-fill', 'text-amber-600') + ' Finishing in shops</h3><ul class="space-y-2">' +
    (m.finishing.length ? m.finishing.map(x => '<li class="flex items-center justify-between text-sm gap-2"><span class="truncate text-slate-700">' + esc(x.name) + '</span><span class="badge bg-amber-100 text-amber-700">low in ' + x.shops + '</span></li>').join('') : '<li class="text-xs text-slate-400">Stock healthy.</li>') + '</ul></div>';
  h += '</div>';
  h += '<div class="card p-4"><h3 class="font-bold text-slate-800 text-sm mb-3">Average price — common products</h3><div class="grid gap-3 sm:grid-cols-3">' +
    m.prices.map(x => '<div class="bg-slate-50 border border-slate-200 rounded-lg p-3"><div class="text-xs font-bold uppercase text-slate-500">' + esc(x.label) + '</div><div class="text-xl font-black mt-1">' + fmt(x.v.sold) + ' <span class="text-xs text-slate-500">UGX</span></div><div class="text-xs text-slate-500">shop avg: ' + fmt(x.v.retail) + '</div></div>').join('') + '</div></div>';
  h += '<div class="card p-4"><h3 class="font-bold text-slate-800 text-sm mb-1 h-ic">' + bi('megaphone-fill') + ' Send a message to all shops</h3>' +
    '<p class="text-xs text-slate-500 mb-3">Every Business Admin will see this on their dashboard.</p>' +
    '<textarea id="broadcast-text" class="input" rows="3" placeholder="Type your message to all shops..."></textarea>' +
    '<div class="mt-3 flex justify-end"><button class="btn-primary" data-action="broadcast-send">Send to all shops</button></div>';
  if (DB.broadcasts.length) {
    h += '<div class="mt-4 space-y-2 border-t border-slate-100 pt-3">' +
      DB.broadcasts.slice(0, 4).map(b => '<div class="bg-brand-50 border border-brand-100 rounded-lg px-3 py-2"><div class="text-sm text-slate-700">' + esc(b.message) + '</div><div class="text-xs text-slate-400 mt-1">' + esc(new Date(b.date).toLocaleString('en-GB')) + '</div></div>').join('') + '</div>';
  }
  h += '</div>';
  h += '<div class="text-center text-xs text-slate-400 pb-4">ShopSmart platform view — private shop details are never shown here.</div>';
  h += '</div>';
  return h;
}

function superShopModal(id) {
  const s = shopById(id);
  if (!s) return;
  const st = superShopStats(s);
  const prods = productsOf(s.id).slice().sort((a, b) => a.stock - b.stock);
  const outList = prods.filter(p => p.stock <= 0).slice(0, 8);
  const lowList = prods.filter(p => p.stock > 0 && p.stock <= s.lowStockLevel).slice(0, 8);
  const recent = DB.sales.filter(x => x.shopId === s.id).slice(-6).reverse();
  let h = '<div class="p-5"><div class="flex items-start justify-between gap-3">' +
    '<div><h3 class="text-lg font-black text-slate-800">' + esc(s.name) + '</h3>' +
    '<p class="text-sm text-slate-500">' + esc(s.owner) + ' - ' + esc(s.location) + '</p>' +
    '<div class="mt-2 flex gap-1.5 flex-wrap">' + statusBadge(s.status) + ' ' + superHealthBadge(st) + '</div></div>' +
    '<button class="btn-ghost btn-sm" data-action="close-modal">Close</button></div>';
  h += '<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">' +
    '<div class="bg-slate-50 border rounded-lg p-3"><div class="text-xs font-bold text-slate-500 uppercase">Sales 7d</div><div class="text-lg font-black">' + fmt(st.s7) + '</div><div class="text-xs text-slate-500">' + st.tx7 + ' sales</div></div>' +
    '<div class="bg-slate-50 border rounded-lg p-3"><div class="text-xs font-bold text-slate-500 uppercase">Today</div><div class="text-lg font-black">' + fmt(st.todaySales) + '</div><div class="text-xs text-slate-500">' + st.txToday + ' sales</div></div>' +
    '<div class="bg-slate-50 border rounded-lg p-3"><div class="text-xs font-bold text-slate-500 uppercase">Stock</div><div class="text-lg font-black">' + (st.prods - st.out) + ' / ' + st.prods + '</div><div class="text-xs text-slate-500">' + st.out + ' out, ' + st.low + ' low</div></div>' +
    '<div class="bg-slate-50 border rounded-lg p-3"><div class="text-xs font-bold text-slate-500 uppercase">Stock value</div><div class="text-lg font-black">' + fmt(st.stockVal) + '</div><div class="text-xs text-slate-500">UGX buying price</div></div></div>';
  h += '<div class="grid sm:grid-cols-2 gap-3 mt-4">';
  h += '<div><div class="text-xs font-bold uppercase text-red-600 mb-1">Out of stock (' + st.out + ')</div>' +
    (outList.length ? '<ul class="text-sm space-y-1">' + outList.map(p => '<li class="flex justify-between gap-2"><span class="truncate">' + esc(p.name) + '</span><b class="text-red-600">0</b></li>').join('') + '</ul>' : '<p class="text-xs text-slate-400">Nothing fully out.</p>') + '</div>';
  h += '<div><div class="text-xs font-bold uppercase text-amber-600 mb-1">Low stock (' + st.low + ')</div>' +
    (lowList.length ? '<ul class="text-sm space-y-1">' + lowList.map(p => '<li class="flex justify-between gap-2"><span class="truncate">' + esc(p.name) + '</span><b class="text-amber-600">' + p.stock + '</b></li>').join('') + '</ul>' : '<p class="text-xs text-slate-400">No low items.</p>') + '</div>';
  h += '</div>';
  h += '<div class="mt-4"><div class="text-xs font-bold uppercase text-slate-500 mb-1">Recent sales</div>' +
    (recent.length ? '<ul class="text-sm space-y-1">' + recent.map(x => '<li class="flex justify-between gap-2 border-b border-slate-100 py-1"><span>' + esc(x.receipt) + ' - ' + fmtShort(x.day) + '</span><b>' + fmt(x.total) + '</b></li>').join('') + '</ul>' : '<p class="text-xs text-slate-400">No sales yet.</p>') + '</div>';
  h += '<div class="flex justify-end gap-2 mt-5">' +
    (s.status === 'suspended' ? '<button class="btn-primary btn-sm" data-action="shop-toggle" data-id="' + s.id + '">Start shop</button>' : '<button class="btn-danger btn-sm" data-action="shop-toggle" data-id="' + s.id + '">Stop shop</button>') +
    '<button class="btn-ghost btn-sm" data-action="close-modal">Close</button></div></div>';
  openModal(h);
}