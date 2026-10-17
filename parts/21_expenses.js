/* ================= Expenses & Money page ================= */
function pageExpenses() {
  const sh = myShop();
  const k = dayKey();
  const st = dashStats();
  const exps = expensesOf(sh.id).filter(e => e.day === k);
  const allExps = expensesOf(sh.id).slice().sort((a, b) => (b.day > a.day ? 1 : b.day < a.day ? -1 : 0)).slice(0, 15);
  const opening = st.opening;
  const cogs = st.cost;
  const net = st.sales - cogs - st.exp;
  const debtIn = sum(DB.debtPayments.filter(p => p.shopId === sh.id && p.day === k), p => p.amount);

  let h = '<div class="space-y-5">';
  h += '<div class="grid grid-cols-2 lg:grid-cols-5 gap-3">' +
    '<div class="kpi"><div class="kpi-label">Opening Cash</div><div class="kpi-value">' + fmt(opening) + '</div><div class="kpi-sub">UGX</div></div>' +
    '<div class="kpi"><div class="kpi-label">Total Sales</div><div class="kpi-value">' + fmt(st.sales) + '</div><div class="kpi-sub">UGX today</div></div>' +
    '<div class="kpi"><div class="kpi-label">Total Expenses</div><div class="kpi-value text-red-600">' + fmt(st.exp) + '</div><div class="kpi-sub">UGX today</div></div>' +
    '<div class="kpi"><div class="kpi-label">Cash in Hand</div><div class="kpi-value">' + fmt(st.cash) + '</div><div class="kpi-sub">opening + sales − expenses</div></div>' +
    '<div class="kpi"><div class="kpi-label">Debt payments in</div><div class="kpi-value text-brand-700">' + fmt(debtIn) + '</div><div class="kpi-sub">UGX today</div></div>' +
    '</div>';

  /* profit + opening cash */
  h += '<div class="grid gap-4 lg:grid-cols-2">';
  h += '<div class="card p-4"><h3 class="font-bold text-slate-800 text-sm mb-3 h-ic">' + bi('bar-chart-line-fill') + ' Today\'s profit</h3>' +
    '<div class="space-y-2 text-sm">' +
    '<div class="flex justify-between text-slate-600"><span>Sales</span><span class="font-semibold">' + fmt(st.sales) + '</span></div>' +
    '<div class="flex justify-between text-slate-600"><span>− Cost of products sold</span><span class="font-semibold">' + fmt(cogs) + '</span></div>' +
    '<div class="flex justify-between text-slate-600"><span>− Expenses</span><span class="font-semibold">' + fmt(st.exp) + '</span></div>' +
    '<div class="flex justify-between border-t border-dashed border-slate-300 pt-2 font-black text-base ' + (net >= 0 ? 'text-brand-700' : 'text-red-600') + '">' +
    '<span>Profit</span><span>' + fmt(net) + ' ' + esc(cur()) + '</span></div>' +
    '</div></div>';
  h += '<div class="card p-4"><h3 class="font-bold text-slate-800 text-sm mb-3 h-ic">' + bi('wallet2') + ' Set opening cash for today</h3>' +
    '<p class="text-xs text-slate-500 mb-2">The money that was in the box before you started selling today (' + esc(fmtDate(k)) + ').</p>' +
    '<div class="flex gap-2">' +
    '<input id="opening-input" type="number" min="0" class="input" value="' + opening + '">' +
    '<button class="btn-dark whitespace-nowrap" data-action="save-opening">' + bi('check-lg') + ' Save</button></div>' +
    '<div class="mt-3 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">' +
    'Cash in hand = Opening cash (' + fmt(opening) + ') + Sales (' + fmt(st.sales) + ') − Expenses (' + fmt(st.exp) + ') = <b class="text-slate-800">' + fmt(st.cash) + ' ' + esc(cur()) + '</b></div>' +
    '</div>';
  h += '</div>';

  /* add expense */
  h += '<div class="card p-4"><h3 class="font-bold text-slate-800 text-sm mb-3 h-ic">' + bi('plus-circle-fill') + ' Add expense</h3>' +
    '<div class="grid gap-3 sm:grid-cols-5">' +
    '<div class="sm:col-span-2"><label class="label">Category *</label><select id="ex-cat" class="input">' +
    EXPENSE_CATS.map(c => '<option>' + c + '</option>').join('') + '</select></div>' +
    '<div><label class="label">Amount *</label><input id="ex-amount" type="number" min="1" class="input" placeholder="e.g. 10000"></div>' +
    '<div><label class="label">Date</label><input id="ex-date" type="date" class="input" value="' + k + '"></div>' +
    '<div class="flex items-end"><button class="btn-primary w-full" data-action="add-expense">' + bi('plus-lg') + ' Add expense</button></div>' +
    '<div class="sm:col-span-5"><label class="label">Note (optional)</label><input id="ex-note" class="input" placeholder="e.g. boda to market"></div>' +
    '<div id="ex-error" class="sm:col-span-5 text-xs font-semibold text-red-600"></div>' +
    '</div></div>';

  /* expenses table */
  h += '<div class="card overflow-hidden"><div class="px-4 py-3 border-b border-slate-200">' +
    '<h2 class="font-bold text-slate-800">Expenses (latest 15)</h2></div>' +
    '<div class="overflow-x-auto"><table class="w-full"><thead class="bg-slate-50"><tr>' +
    '<th class="th">Date</th><th class="th">Category</th><th class="th">Note</th><th class="th text-right">Amount</th><th class="th text-right"></th>' +
    '</tr></thead><tbody>';
  allExps.forEach(function (e) {
    h += '<tr class="border-b border-slate-100">' +
      '<td class="td text-xs">' + esc(fmtDate(e.day)) + '</td>' +
      '<td class="td font-semibold">' + esc(e.cat) + '</td>' +
      '<td class="td text-xs text-slate-500">' + esc(e.note || '') + '</td>' +
      '<td class="td text-right font-bold">' + fmt(e.amount) + '</td>' +
      '<td class="td text-right"><button class="btn-danger btn-sm" data-action="delete-expense" data-id="' + e.id + '">' + bi('trash-fill') + ' Delete</button></td>' +
      '</tr>';
  });
  if (!allExps.length) h += '<tr><td class="td text-slate-400 text-center py-6" colspan="5">No expenses recorded.</td></tr>';
  h += '</tbody></table></div></div>';
  h += '</div>';
  return h;
}
