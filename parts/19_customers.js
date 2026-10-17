/* ================= Customers & Credit page ================= */
function pageCustomers() {
  const sh = myShop();
  const custs = customersOf(sh.id).slice().sort((a, b) => b.owed - a.owed);
  const pays = DB.debtPayments.filter(p => p.shopId === sh.id);
  const totalOwed = sum(custs, c => c.owed);
  const totalBought = sum(custs, c => c.totalBought);
  const today = dayKey();

  let h = '<div class="space-y-5">';
  h += '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">' +
    '<div class="kpi"><div class="kpi-label">Customers</div><div class="kpi-value">' + custs.length + '</div></div>' +
    '<div class="kpi"><div class="kpi-label">Total bought</div><div class="kpi-value">' + fmt(totalBought) + '</div><div class="kpi-sub">UGX</div></div>' +
    '<div class="kpi"><div class="kpi-label">Owed to me</div><div class="kpi-value text-red-600">' + fmt(totalOwed) + '</div><div class="kpi-sub">UGX</div></div>' +
    '<div class="kpi"><div class="kpi-label">Owing now</div><div class="kpi-value text-amber-600">' + custs.filter(c => c.owed > 0).length + '</div></div>' +
    '</div>';

  h += '<div class="card overflow-hidden"><div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">' +
    '<h2 class="font-bold text-slate-800">Customers</h2>' +
    '<button class="btn-primary btn-sm" data-action="add-customer">' + bi('plus-lg') + ' Add customer</button></div>' +
    '<div class="overflow-x-auto"><table class="w-full"><thead class="bg-slate-50"><tr>' +
    '<th class="th">Name</th><th class="th">Phone</th><th class="th text-right">Total bought</th>' +
    '<th class="th text-right">Owes</th><th class="th">When to pay</th><th class="th text-right">Actions</th>' +
    '</tr></thead><tbody>';
  custs.forEach(function (c) {
    let dueCell = '<span class="text-xs text-slate-400">—</span>';
    if (c.owed > 0 && c.due) {
      const overdue = c.due < today;
      dueCell = '<span class="badge ' + (overdue ? 'bg-red-100 text-red-700' : c.due === today ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600') + '">' +
        esc(fmtDate(c.due)) + (overdue ? ' · overdue' : c.due === today ? ' · today' : '') + '</span>';
    }
    h += '<tr class="border-b border-slate-100 ' + (c.owed > 0 ? 'bg-red-50/40' : '') + '">' +
      '<td class="td font-semibold text-slate-800">' + esc(c.name) + '</td>' +
      '<td class="td">' + esc(c.phone) + '</td>' +
      '<td class="td text-right">' + fmt(c.totalBought) + '</td>' +
      '<td class="td text-right font-bold ' + (c.owed > 0 ? 'text-red-600' : 'text-brand-700') + '">' + fmt(c.owed) + '</td>' +
      '<td class="td">' + dueCell + '</td>' +
      '<td class="td text-right whitespace-nowrap space-x-1">' +
      (c.owed > 0 ? '<button class="btn-primary btn-sm" data-action="record-payment" data-id="' + c.id + '">' + bi('cash-coin') + ' Record payment</button>' : '') +
      '<button class="btn-ghost btn-sm" data-action="edit-customer" data-id="' + c.id + '">' + bi('pencil-fill') + ' Edit</button>' +
      '<button class="btn-danger btn-sm" data-action="delete-customer" data-id="' + c.id + '">' + bi('trash-fill') + ' Delete</button>' +
      '</td></tr>';
  });
  if (!custs.length) h += '<tr><td class="td text-slate-400 text-center py-6" colspan="6">No customers yet. Add customers to track credit.</td></tr>';
  h += '</tbody></table></div></div>';

  /* debt summary + payment history */
  const debtors = custs.filter(c => c.owed > 0);
  h += '<div class="grid gap-4 lg:grid-cols-2">';
  h += '<div class="card p-4"><h3 class="font-bold text-slate-800 text-sm mb-3 h-ic">' + bi('exclamation-circle-fill', 'text-red-600') + ' Who owes money</h3>' +
    '<ul class="space-y-2">' +
    (debtors.length ? debtors.map(c =>
      '<li class="flex items-center justify-between text-sm gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">' +
      '<span class="min-w-0"><span class="font-semibold text-slate-800">' + esc(c.name) + '</span>' +
      '<span class="block text-xs text-slate-500">' + esc(c.phone) + ' · due ' + esc(c.due ? fmtDate(c.due) : '—') + '</span></span>' +
      '<span class="font-black text-red-600 whitespace-nowrap">' + fmt(c.owed) + '</span></li>').join('')
      : '<li class="text-xs text-slate-400">Nobody owes you money. ' + bi('check-circle-fill', 'text-brand-600') + '</li>') +
    '</ul></div>';
  h += '<div class="card p-4"><h3 class="font-bold text-slate-800 text-sm mb-3 h-ic">' + bi('cash-coin') + ' Payments received on debts</h3>' +
    '<ul class="space-y-2">' +
    (pays.length ? pays.slice().sort((a, b) => (b.day > a.day ? 1 : -1)).slice(0, 8).map(p => {
      const c = DB.customers.find(x => x.id === p.customerId);
      return '<li class="flex items-center justify-between text-sm gap-2 border-b border-slate-100 pb-1.5">' +
        '<span class="text-slate-600">' + esc(c ? c.name : '—') + '<span class="block text-xs text-slate-400">' + esc(fmtDate(p.day)) + '</span></span>' +
        '<span class="font-bold text-brand-700">' + fmt(p.amount) + '</span></li>';
    }).join('') : '<li class="text-xs text-slate-400">No debt payments recorded yet.</li>') +
    '</ul></div>';
  h += '</div></div>';
  return h;
}
