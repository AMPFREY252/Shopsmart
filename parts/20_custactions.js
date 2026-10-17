/* ================= Customers actions ================= */
function customerFormHTML(c) {
  return '<div class="p-5"><h3 class="text-lg font-bold text-slate-800">' + (c ? 'Edit customer' : 'Add customer') + '</h3>' +
    '<div class="grid gap-3 mt-4">' +
    '<div><label class="label">Customer name *</label><input id="cf-name" class="input" value="' + esc(c ? c.name : '') + '" placeholder="e.g. Alice Kobusingye"></div>' +
    '<div class="grid sm:grid-cols-2 gap-3">' +
    '<div><label class="label">Phone *</label><input id="cf-phone" class="input" value="' + esc(c ? c.phone : '') + '" placeholder="0772 000 000"></div>' +
    '<div><label class="label">Payment due date (for credit)</label><input id="cf-due" type="date" class="input" value="' + esc(c && c.due ? c.due : '') + '"></div>' +
    '</div>' +
    '<div id="cf-error" class="text-xs font-semibold text-red-600"></div>' +
    '</div></div>' +
    '<div class="flex justify-end gap-2 px-5 pb-5">' +
    '<button class="btn-ghost" data-action="close-modal">Cancel</button>' +
    '<button class="btn-primary" data-action="' + (c ? 'save-customer' : 'create-customer') + '"' + (c ? ' data-id="' + c.id + '"' : '') + '>Save</button></div>';
}
function readCustomerForm() {
  const v = id => document.getElementById(id).value.trim();
  const name = v('cf-name'), phone = v('cf-phone');
  if (!name || !phone) {
    const err = document.getElementById('cf-error');
    if (err) err.textContent = 'Name and phone are required.';
    return null;
  }
  return { name, phone, due: v('cf-due') };
}
function paymentModal(cid) {
  const c = DB.customers.find(x => x.id === cid);
  if (!c) return;
  openModal(
    '<div class="p-5"><h3 class="text-lg font-bold text-slate-800">Record debt payment</h3>' +
    '<p class="text-sm text-slate-500 mt-1">' + esc(c.name) + ' — owes <b class="text-red-600">' + fmt(c.owed) + ' ' + esc(cur()) + '</b></p>' +
    '<label class="label mt-4">Amount received *</label>' +
    '<input id="pay-amount" type="number" min="1" max="' + c.owed + '" class="input" value="' + c.owed + '">' +
    '<label class="label mt-3">Date</label>' +
    '<input id="pay-date" type="date" class="input" value="' + dayKey() + '">' +
    '<div id="pay-error" class="text-xs font-semibold text-red-600 mt-2"></div>' +
    '<p class="text-xs text-slate-400 mt-2">The remaining balance updates immediately.</p></div>' +
    '<div class="flex justify-end gap-2 px-5 pb-5">' +
    '<button class="btn-ghost" data-action="close-modal">Cancel</button>' +
    '<button class="btn-primary" data-action="save-payment" data-id="' + c.id + '">Record payment</button></div>'
  );
  setTimeout(() => { const el = document.getElementById('pay-amount'); if (el) { el.focus(); el.select(); } }, 40);
}
