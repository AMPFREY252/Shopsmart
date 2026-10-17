/* dashboard bottom half: low stock + recent sales */
function DASHBOARD_ANALYTICS_TEASER(sh) {
  const keep = S.an;
  S.an = { preset: '30d', from: '', to: '', cat: 'All', pay: 'All', tab: 'overview', chart: 'bar', q: '', sort: 'revenue_desc', page: 1 };
  const k = anKPIs(sh.id);
  const bk = anBucketed(anDailySeries(sh.id));
  S.an = keep;
  const has = bk.rows.some(d => d.rev > 0);
  let h = '<div class="card p-4"><div class="flex flex-wrap items-center justify-between gap-2 mb-2">' +
    '<div><h3 class="font-bold text-slate-800 text-sm h-ic">' + bi('bar-chart-line-fill') + ' Business analytics — last 30 days</h3>' +
    '<p class="text-xs text-slate-500">Revenue ' + fmt(k.rev) + ' · Net ' + fmt(k.net) + ' · ' + k.orders + ' orders</p></div>' +
    '<button class="btn-primary btn-sm" data-action="nav" data-page="analytics">Open analytics</button></div>' +
    (has ? anLineSVG(bk.rows.slice(-14), [{ name: 'Revenue', color: '#16a34a', get: r => r.rev }]) : '<div class="py-6 text-center text-sm text-slate-400">No sales in the last 30 days yet.</div>') +
    '</div>';
  return h;
}
function DASHBOARD_BOTTOM(sh, st) {
  let h = '<div class="grid gap-4 lg:grid-cols-2">';
  h += '<div class="card p-4"><div class="flex items-center justify-between mb-3">' +
    '<h3 class="font-bold text-slate-800 text-sm h-ic">' + bi('exclamation-triangle-fill', 'text-amber-600') + ' Almost finished</h3>' +
    '<button class="btn-ghost btn-sm" data-action="nav" data-page="products">Manage products</button></div>' +
    '<ul class="space-y-2">' +
    (st.low.length ? st.low.slice().sort((a, b) => a.stock - b.stock).slice(0, 7).map(p =>
      '<li class="flex items-center justify-between text-sm gap-2"><span class="truncate text-slate-700">' + esc(p.name) + '</span>' +
      '<span class="badge ' + (p.stock <= 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700') + '">' +
      (p.stock <= 0 ? 'Out of stock' : fmt(p.stock) + ' left') + '</span></li>').join('')
      : '<li class="text-xs text-slate-400">All products are well stocked. ' + bi('check-circle-fill', 'text-brand-600') + '</li>') +
    '</ul></div>';

  const recent = salesOf(sh.id).slice().sort((a, b) => (b.ts > a.ts ? 1 : -1)).slice(0, 6);
  h += '<div class="card overflow-hidden"><div class="px-4 py-3 border-b border-slate-200">' +
    '<h3 class="font-bold text-slate-800 text-sm">Recent sales</h3></div>' +
    '<div class="overflow-x-auto"><table class="w-full"><thead class="bg-slate-50"><tr>' +
    '<th class="th">Receipt</th><th class="th">When</th><th class="th">Cashier</th><th class="th">Pay</th><th class="th text-right">Total</th><th class="th text-right">Paid</th><th></th>' +
    '</tr></thead><tbody>';
  recent.forEach(function (s) {
    const creditBal = (s.method === 'Credit') ? (s.balance != null ? s.balance : (s.total - (s.paid || 0))) : 0;
    h += '<tr class="border-b border-slate-100">' +
      '<td class="td font-mono text-xs">' + esc(s.receipt) + '</td>' +
      '<td class="td text-xs">' + esc(fmtShort(s.day) + ' ' + fmtTime(s.ts)) + '</td>' +
      '<td class="td text-xs">' + esc(s.cashier) + '</td>' +
      '<td class="td">' + payBadge(s.method) + (creditBal > 0 ? '<div class="text-[10px] font-bold text-red-600">owes ' + fmt(creditBal) + '</div>' : '') + '</td>' +
      '<td class="td text-right font-bold">' + fmt(s.total) + '</td>' +
      '<td class="td text-right text-brand-700 font-semibold">' + fmt(s.paid || 0) + '</td>' +
      '<td class="td text-right"><button class="btn-ghost btn-sm" data-action="view-receipt" data-id="' + s.id + '">Receipt</button></td>' +
      '</tr>';
  });
  if (!recent.length) h += '<tr><td class="td text-slate-400" colspan="7">No sales yet.</td></tr>';
  h += '</tbody></table></div></div>';
  h += '</div>';
  return h;
}
