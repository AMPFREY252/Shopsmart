/* ================= Suppliers & Purchases actions ================= */
function supplierFormHTML(s) {
  return '<div class="p-5"><h3 class="text-lg font-bold text-slate-800">' + (s ? 'Edit supplier' : 'Add supplier') + '</h3>' +
    '<div class="grid gap-3 mt-4">' +
    '<div><label class="label">Supplier name *</label><input id="sf-name" class="input" value="' + esc(s ? s.name : '') + '" placeholder="e.g. Kampala Wholesale Distributors"></div>' +
    '<div class="grid sm:grid-cols-2 gap-3">' +
    '<div><label class="label">Phone *</label><input id="sf-phone" class="input" value="' + esc(s ? s.phone : '') + '" placeholder="0772 000 000"></div>' +
    '<div><label class="label">Location</label><input id="sf-loc" class="input" value="' + esc(s ? s.location : '') + '" placeholder="e.g. Kampala"></div>' +
    '</div>' +
    '<div id="sf-error" class="text-xs font-semibold text-red-600"></div>' +
    '</div></div>' +
    '<div class="flex justify-end gap-2 px-5 pb-5">' +
    '<button class="btn-ghost" data-action="close-modal">Cancel</button>' +
    '<button class="btn-primary" data-action="' + (s ? 'save-supplier' : 'create-supplier') + '"' + (s ? ' data-id="' + s.id + '"' : '') + '>Save</button></div>';
}
function readSupplierForm() {
  const v = id => document.getElementById(id).value.trim();
  const name = v('sf-name'), phone = v('sf-phone');
  if (!name || !phone) {
    const err = document.getElementById('sf-error');
    if (err) err.textContent = 'Name and phone are required.';
    return null;
  }
  return { name, phone, location: v('sf-loc') || '—' };
}
function purchaseFormHTML() {
  const sh = myShop();
  const sups = suppliersOf(sh.id);
  const prods = productsOf(sh.id);
  return '<div class="p-5"><h3 class="text-lg font-bold text-slate-800">Add purchase</h3>' +
    '<p class="text-xs text-slate-500 mt-1">Stock increases automatically when you save.</p>' +
    '<div class="grid gap-3 sm:grid-cols-2 mt-4">' +
    '<div class="sm:col-span-2"><label class="label">Supplier *</label><select id="pu-sup" class="input">' +
    sups.map(s => '<option value="' + s.id + '">' + esc(s.name) + '</option>').join('') + '</select></div>' +
    '<div class="sm:col-span-2"><label class="label">Product *</label><select id="pu-prod" class="input">' +
    prods.map(p => '<option value="' + p.id + '">' + esc(p.name) + ' (stock ' + p.stock + ')</option>').join('') + '</select></div>' +
    '<div><label class="label">Date *</label><input id="pu-date" type="date" class="input" value="' + dayKey() + '"></div>' +
    '<div><label class="label">Quantity *</label><input id="pu-qty" type="number" min="1" class="input" value="10" data-change="pu-calc"></div>' +
    '<div><label class="label">Unit cost *</label><input id="pu-unit" type="number" min="0" class="input" value="0" data-change="pu-calc"></div>' +
    '<div><label class="label">Amount paid *</label><input id="pu-paid" type="number" min="0" class="input" value="0"></div>' +
    '<div class="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm flex justify-between font-semibold">' +
    '<span class="text-slate-500">Balance after purchase</span><span id="pu-balance">0</span></div>' +
    '<div id="pu-error" class="sm:col-span-2 text-xs font-semibold text-red-600"></div>' +
    '</div></div>' +
    '<div class="flex justify-end gap-2 px-5 pb-5">' +
    '<button class="btn-ghost" data-action="close-modal">Cancel</button>' +
    '<button class="btn-primary" data-action="create-purchase">Save purchase</button></div>';
}
