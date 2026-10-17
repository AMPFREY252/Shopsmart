/* ================= Settings page ================= */
function pageSettings() {
  const sh = myShop();
  const logoPreview = sh.logo
    ? '<img src="' + sh.logo + '" class="w-16 h-16 rounded-full object-cover border-2 border-brand-600" alt="logo">'
    : '<div class="w-16 h-16 rounded-full bg-brand-600 text-white grid place-items-center font-black text-2xl border-2 border-brand-600">' +
    esc(sh.name.trim().charAt(0).toUpperCase()) + '</div>';

  let h = '<div class="space-y-5">';
  h += '<div class="card p-4 flex flex-wrap items-center gap-4">' +
    logoPreview +
    '<div class="min-w-0"><div class="font-bold text-slate-800">' + esc(sh.name) + '</div>' +
    '<div class="text-xs text-slate-500">' + esc(PLANS[sh.plan].name) + ' plan &middot; ' +
    esc(sh.status === 'trial' ? 'Free trial until ' + fmtDate(dayKey(new Date(sh.trialEndsAt))) : sh.status === 'active' ? 'Active subscription' : 'Stopped by ShopSmart') +
    '</div></div>' +
    '<div class="ml-auto text-right"><div class="text-xs font-bold uppercase tracking-wide text-slate-400">Receipt prefix</div>' +
    '<div class="font-mono font-bold text-slate-700">' + esc(sh.prefix) + '-' + pad4(sh.seq || 0) + '</div></div>' +
    '</div>';

  h += '<form class="card p-5" data-action="save-settings">' +
    '<h2 class="font-bold text-slate-800 mb-4">Shop details</h2>' +
    '<div class="grid gap-4 sm:grid-cols-2">' +
    '<div><label class="label">Shop name</label><input id="set-name" class="input" value="' + esc(sh.name) + '"></div>' +
    '<div><label class="label">Logo</label>' +
    '<input id="set-logo" type="file" accept="image/*" class="input pt-1.5 pb-1.5 text-xs" data-change="logo-file">' +
    '<div class="text-[11px] text-slate-400 mt-1">Small image works best (it prints on receipts).</div></div>' +
    '<div><label class="label">Phone</label><input id="set-phone" class="input" value="' + esc(sh.phone) + '"></div>' +
    '<div><label class="label">Location</label><input id="set-location" class="input" value="' + esc(sh.location) + '"></div>' +
    '<div><label class="label">TIN (optional, prints on receipt)</label><input id="set-tin" class="input" value="' + esc(sh.tin || '') + '" placeholder="e.g. 1008456781"></div>' +
    '<div><label class="label">Currency</label><select id="set-currency" class="input">' +
    ['UGX', 'KES', 'TZS', 'RWF', 'USD'].map(c => '<option' + (sh.currency === c ? ' selected' : '') + '>' + c + '</option>').join('') +
    '</select></div>' +
    '<div><label class="label">Low stock warning level</label>' +
    '<input id="set-low" type="number" min="1" class="input" value="' + sh.lowStockLevel + '"></div>' +
    '<div class="sm:col-span-2"><label class="label">Message on receipt (thank you)</label>' +
    '<textarea id="set-msg" class="input" rows="2">' + esc(sh.receiptMsg) + '</textarea></div>' +
    '<div class="sm:col-span-2"><label class="label">Shop type</label><select id="set-type" class="input">' +
    ['Retail', 'Wholesale', 'Both'].map(t => '<option' + (sh.type === t ? ' selected' : '') + '>' + t + '</option>').join('') +
    '</select></div>' +
    '<div id="set-error" class="sm:col-span-2 text-xs font-semibold text-red-600"></div>' +
    '</div>' +
    '<div class="flex justify-end mt-5"><button type="submit" class="btn-primary px-6">Save settings</button></div>' +
    '</form>';

  h += '<div class="card p-5"><h2 class="font-bold text-slate-800 mb-2">Receipt preview</h2>' +
    '<p class="text-xs text-slate-500 mb-3">This is how your receipt looks. Every shop prints its own name, logo and message.</p>' +
    '<div class="bg-slate-100 rounded-xl p-4 overflow-x-auto">' + receiptHTML(sampleReceipt(sh)) + '</div>' +
    '<div class="mt-3 flex justify-end"><button class="btn-dark btn-sm" data-action="print-sample-receipt">' + bi('printer-fill') + ' Print this preview</button></div>' +
    '</div>';
  h += '</div>';
  return h;
}
function sampleReceipt(sh) {
  const p = productsOf(sh.id)[0];
  return {
    id: 'sample', shopId: sh.id, receipt: sh.prefix + '-' + pad4((sh.seq || 0) + 1),
    day: dayKey(), ts: new Date().toISOString(), cashier: S.user.name,
    items: p ? [{ pid: p.id, name: p.name, qty: 2, price: p.retail, buy: p.buy }] : [],
    subtotal: p ? p.retail * 2 : 0, discount: 0, total: p ? p.retail * 2 : 0,
    method: 'Cash', paid: p ? p.retail * 2 : 0, change: 0, customerId: null
  };
}
