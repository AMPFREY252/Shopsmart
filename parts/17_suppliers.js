/* ================= Suppliers & Purchases page ================= */
function pageSuppliers() {
  const sh = myShop();
  const sups = suppliersOf(sh.id);
  const purs = DB.purchases.filter(p => p.shopId === sh.id)
    .sort((a, b) => (b.day > a.day ? 1 : b.day < a.day ? -1 : 0));
  const totalOwed = sum(sups, s => s.owed);

  let h = '<div class="space-y-5">';
  h += '<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">' +
    '<div class="kpi"><div class="kpi-label">Suppliers</div><div class="kpi-value">' + sups.length + '</div></div>' +
    '<div class="kpi"><div class="kpi-label">We owe suppliers</div><div class="kpi-value text-red-600">' + fmt(totalOwed) + '</div><div class="kpi-sub">UGX</div></div>' +
    '<div class="kpi"><div class="kpi-label">Purchases recorded</div><div class="kpi-value">' + purs.length + '</div></div>' +
    '</div>';

  /* suppliers */
  h += '<div class="card overflow-hidden"><div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">' +
    '<h2 class="font-bold text-slate-800">Suppliers</h2>' +
    '<button class="btn-primary btn-sm" data-action="add-supplier">' + bi('plus-lg') + ' Add supplier</button></div>' +
    '<div class="overflow-x-auto"><table class="w-full"><thead class="bg-slate-50"><tr>' +
    '<th class="th">Name</th><th class="th">Phone</th><th class="th">Location</th><th class="th text-right">We owe them</th><th class="th text-right">Actions</th>' +
    '</tr></thead><tbody>';
  sups.forEach(function (s) {
    h += '<tr class="border-b border-slate-100">' +
      '<td class="td font-semibold text-slate-800">' + esc(s.name) + '</td>' +
      '<td class="td">' + esc(s.phone) + '</td>' +
      '<td class="td">' + esc(s.location) + '</td>' +
      '<td class="td text-right font-bold ' + (s.owed > 0 ? 'text-red-600' : 'text-brand-700') + '">' + fmt(s.owed) + '</td>' +
      '<td class="td text-right whitespace-nowrap space-x-1">' +
      '<button class="btn-ghost btn-sm" data-action="pay-supplier" data-id="' + s.id + '">' + bi('cash-coin') + ' Pay</button>' +
      '<button class="btn-ghost btn-sm" data-action="edit-supplier" data-id="' + s.id + '">' + bi('pencil-fill') + ' Edit</button>' +
      '<button class="btn-danger btn-sm" data-action="delete-supplier" data-id="' + s.id + '">' + bi('trash-fill') + ' Delete</button>' +
      '</td></tr>';
  });
  if (!sups.length) h += '<tr><td class="td text-slate-400 text-center py-6" colspan="5">No suppliers yet. Add your first supplier.</td></tr>';
  h += '</tbody></table></div></div>';

  /* purchases */
  h += '<div class="card overflow-hidden"><div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">' +
    '<div><h2 class="font-bold text-slate-800">Purchases</h2>' +
    '<p class="text-xs text-slate-500">Adding a purchase increases stock automatically.</p></div>' +
    '<button class="btn-primary btn-sm" data-action="add-purchase">' + bi('plus-lg') + ' Add purchase</button></div>' +
    '<div class="overflow-x-auto"><table class="w-full"><thead class="bg-slate-50"><tr>' +
    '<th class="th">Date</th><th class="th">Supplier</th><th class="th">Product</th>' +
    '<th class="th text-right">Qty</th><th class="th text-right">Cost</th><th class="th text-right">Paid</th><th class="th text-right">Balance</th>' +
    '</tr></thead><tbody>';
  purs.forEach(function (p) {
    h += '<tr class="border-b border-slate-100">' +
      '<td class="td text-xs">' + esc(fmtDate(p.day)) + '</td>' +
      '<td class="td">' + esc(p.supplierName) + '</td>' +
      '<td class="td font-semibold text-slate-800">' + esc(p.productName) + '</td>' +
      '<td class="td text-right">' + fmt(p.qty) + '</td>' +
      '<td class="td text-right">' + fmt(p.cost) + '</td>' +
      '<td class="td text-right text-brand-700">' + fmt(p.paid) + '</td>' +
      '<td class="td text-right font-bold ' + (p.balance > 0 ? 'text-red-600' : 'text-slate-400') + '">' + fmt(p.balance) + '</td>' +
      '</tr>';
  });
  if (!purs.length) h += '<tr><td class="td text-slate-400 text-center py-6" colspan="7">No purchases yet.</td></tr>';
  h += '</tbody></table></div></div>';
  h += '</div>';
  return h;
}
