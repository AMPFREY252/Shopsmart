/* ================= Owner dashboard ================= */
function barChart(data) {
  const max = Math.max(1, ...data.map(d => d.total));
  let bars = '';
  data.forEach(function (d) {
    const pct = Math.round((d.total / max) * 100);
    bars += '<div class="flex flex-col items-center gap-1 flex-1 min-w-0">' +
      '<div class="text-[10px] font-bold text-slate-500 truncate w-full text-center">' + (d.total ? fmt(d.total) : '') + '</div>' +
      '<div class="w-full bg-brand-100 rounded-t-md flex items-end" style="height:90px">' +
      '<div class="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-md" style="height:' + Math.max(pct, 3) + '%"></div>' +
      '</div>' +
      '<div class="text-[10px] font-semibold text-slate-400">' + esc(d.label) + '</div></div>';
  });
  return '<div class="flex gap-2 items-end">' + bars + '</div>';
}
function pageDashboard() {
  const sh = myShop();
  const st = dashStats();
  const week = last7(sh.id);
  const from = dayKey(shiftDay(-6));
  const kpi = (label, value, sub, tone) =>
    '<div class="kpi"><div class="kpi-label">' + esc(label) + '</div>' +
    '<div class="kpi-value ' + (tone || '') + '">' + value + '</div>' +
    '<div class="kpi-sub">' + esc(sub) + '</div></div>';

  let h = '<div class="space-y-6">';
  const latestBc = DB.broadcasts.length ? DB.broadcasts[DB.broadcasts.length - 1] : null;
  h += '<div class="flex flex-wrap items-center justify-between gap-3">' +
    '<div><h2 class="text-lg font-black text-slate-800">Hello, ' + esc(S.user.name.split(' ')[0]) + '</h2>' +
    '<p class="text-sm text-slate-500">' + esc(sh.name) + ' &middot; ' +
    esc(sh.status === 'trial' ? 'Free trial ends ' + fmtShort(dayKey(new Date(sh.trialEndsAt))) : PLANS[sh.plan].name + ' plan') + '</p></div>' +
    '<button class="btn-primary" data-action="nav" data-page="pos">' + bi('cart-plus-fill') + ' New sale</button></div>';
  if (latestBc) {
    h += '<div class="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 flex gap-3 items-start">' +
      '<span class="text-lg text-brand-600">' + bi('envelope-fill') + '</span><div><div class="text-xs font-bold uppercase tracking-wide text-brand-700">Message from ShopSmart</div>' +
      '<div class="text-sm text-slate-700 mt-0.5">' + esc(latestBc.message) + '</div>' +
      '<div class="text-xs text-slate-400 mt-1">' + esc(new Date(latestBc.date).toLocaleString('en-GB')) + '</div></div></div>';
  }
  h += '<div class="grid grid-cols-2 lg:grid-cols-5 gap-4">' +
    kpi('Sales Today', fmt(st.sales), st.count + ' sales · UGX') +
    kpi('Profit Today', fmt(st.profit), 'after costs & expenses', st.profit >= 0 ? 'text-brand-700' : 'text-red-600') +
    kpi('Products Low in Stock', fmt(st.low.length), 'at or below ' + sh.lowStockLevel + ' units', st.low.length ? 'text-amber-600' : '') +
    kpi('Customers Owe Me', fmt(st.owed), 'UGX outstanding', 'text-red-600') +
    kpi('Cash in Hand', fmt(st.cash), 'UGX (opening + sales − expenses)') +
    '</div>';
  h += '<div class="grid gap-4 lg:grid-cols-3">';
  h += '<div class="card p-4 lg:col-span-2"><div class="flex items-center justify-between mb-3">' +
    '<h3 class="font-bold text-slate-800 text-sm">Sales — last 7 days</h3>' +
    '<span class="text-xs text-slate-500 font-semibold">Total: ' + fmt(sum(week, w => w.total)) + ' UGX</span></div>' +
    barChart(week) + '</div>';
  const sellWell = {};
  DB.sales.forEach(s => {
    if (s.shopId !== sh.id || s.day < from) return;
    s.items.forEach(it => {
      if (!sellWell[it.name]) sellWell[it.name] = { name: it.name, qty: 0, value: 0 };
      sellWell[it.name].qty += it.qty;
      sellWell[it.name].value += it.qty * it.price;
    });
  });
  const wellList = Object.keys(sellWell).map(n => sellWell[n]).sort((a, b) => b.qty - a.qty).slice(0, 5);
  h += '<div class="card p-4"><h3 class="font-bold text-slate-800 text-sm mb-3 h-ic">' + bi('fire') + ' Selling well in my shop</h3>' +
    '<ul class="space-y-2.5">' +
    (wellList.length ? wellList.map(x =>
      '<li class="flex items-center justify-between text-sm gap-2"><span class="truncate text-slate-700">' + esc(x.name) + '</span>' +
      '<span class="badge bg-brand-100 text-brand-800 whitespace-nowrap">' + fmt(x.qty) + ' sold</span></li>').join('')
      : '<li class="text-xs text-slate-400">No sales in the last 7 days yet.</li>') +
    '</ul></div>';
  h += '</div>';
  h += DASHBOARD_ANALYTICS_TEASER(sh);
  h += DASHBOARD_BOTTOM(sh, st);
  h += '</div>';
  return h;
}
