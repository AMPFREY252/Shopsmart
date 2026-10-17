/* products */
ACTIONS['add-product'] = () => openModal(productFormHTML(null));
ACTIONS['manage-types'] = () => openModal(typeManagerHTML());
ACTIONS['create-type'] = () => {
  const sh = myShop();
  const el = document.getElementById('nt-name');
  const err = document.getElementById('nt-error');
  const name = normTypeName(el ? el.value : '');
  const fail = m => { if (err) err.textContent = m; else toast(m, 'error'); };
  if (!name) return fail('Type a name for the new type.');
  if (!Array.isArray(sh.ptypes)) sh.ptypes = shopTypes(sh.id);
  if (sh.ptypes.some(t => String(t).toLowerCase() === name.toLowerCase())) return fail('"' + name + '" already exists.');
  sh.ptypes.push(name);
  persist();
  openModal(typeManagerHTML());
  const again = document.getElementById('nt-name');
  if (again) again.focus();
  render();
  toast('Type "' + name + '" added.');
};
ACTIONS['delete-type'] = d => {
  const sh = myShop();
  const name = normTypeName(d.t);
  if (!name) return;
  const used = productsOf(sh.id).filter(p => normTypeName(p.type).toLowerCase() === name.toLowerCase()).length;
  if (used) { toast('"' + name + '" is used by ' + used + ' product' + (used === 1 ? '' : 's') + ' — move them first.', 'error'); return; }
  confirmModal('Delete type?', 'Remove the "' + name + '" type? Products already sold keep their own record.', function () {
    sh.ptypes = shopTypes(sh.id).filter(t => t.toLowerCase() !== name.toLowerCase());
    if (S.prodType === d.t || S.prodType.toLowerCase() === name.toLowerCase()) S.prodType = 'All';
    if (S.posType === d.t || S.posType.toLowerCase() === name.toLowerCase()) S.posType = 'All';
    persist();
    openModal(typeManagerHTML());
    render();
    toast('Type "' + name + '" deleted.', 'info');
  }, 'Yes, delete');
};
ACTIONS['edit-product'] = d => openModal(productFormHTML(DB.products.find(x => x.id === d.id)));
ACTIONS['save-product'] = d => saveProduct(d.id);
ACTIONS['create-product'] = createProduct;
ACTIONS['delete-product'] = d => {
  const p = DB.products.find(x => x.id === d.id);
  if (!p) return;
  confirmModal('Delete product?', 'Delete "' + p.name + '"? Past sales keep their own record.', function () {
    DB.products = DB.products.filter(x => x.id !== d.id);
    persist(); render();
    toast('Product deleted.', 'info');
  });
};
ACTIONS['restock'] = d => restockModal(d.id);
ACTIONS['save-restock'] = d => {
  const p = DB.products.find(x => x.id === d.id);
  const qty = Number((document.getElementById('rf-qty') || {}).value);
  if (!p || isNaN(qty) || qty < 1) {
    const err = document.getElementById('rf-error');
    if (err) err.textContent = 'Enter a quantity of 1 or more.';
    return;
  }
  p.stock += qty;
  persist(); closeModal(); render();
  toast(p.name + ': stock increased by ' + qty + '.');
};
ACTIONS['prod-type'] = d => { S.prodType = d.t; render(); };
ACTIONS['toggle-low'] = () => { S.lowOnly = !S.lowOnly; render(); };

/* suppliers */
ACTIONS['add-supplier'] = () => openModal(supplierFormHTML(null));
ACTIONS['edit-supplier'] = d => openModal(supplierFormHTML(DB.suppliers.find(x => x.id === d.id)));
ACTIONS['save-supplier'] = d => {
  const v = readSupplierForm();
  if (!v) return;
  Object.assign(DB.suppliers.find(x => x.id === d.id), v);
  persist(); closeModal(); render();
  toast('Supplier updated.');
};
ACTIONS['create-supplier'] = () => {
  const v = readSupplierForm();
  if (!v) return;
  v.id = uid('su'); v.shopId = myShop().id; v.owed = 0;
  DB.suppliers.push(v);
  persist(); closeModal(); render();
  toast('Supplier added.');
};
ACTIONS['delete-supplier'] = d => {
  const s = DB.suppliers.find(x => x.id === d.id);
  if (!s) return;
  if (s.owed > 0) { toast('This supplier is owed ' + fmt(s.owed) + '. Settle it first.', 'error'); return; }
  confirmModal('Delete supplier?', 'Remove "' + s.name + '" from your suppliers?', function () {
    DB.suppliers = DB.suppliers.filter(x => x.id !== d.id);
    DB.purchases = DB.purchases.filter(x => x.supplierId !== d.id);
    persist(); render();
    toast('Supplier deleted.', 'info');
  });
};
ACTIONS['pay-supplier'] = d => {
  const s = DB.suppliers.find(x => x.id === d.id);
  if (!s) return;
  if (s.owed <= 0) { toast('Nothing is owed to this supplier.', 'info'); return; }
  openModal(
    '<div class="p-5"><h3 class="text-lg font-bold text-slate-800">Pay supplier</h3>' +
    '<p class="text-sm text-slate-500 mt-1">' + esc(s.name) + ' — owed <b class="text-red-600">' + fmt(s.owed) + '</b></p>' +
    '<label class="label mt-4">Amount paid *</label>' +
    '<input id="sup-pay" type="number" min="1" max="' + s.owed + '" class="input" value="' + s.owed + '">' +
    '<div id="sup-pay-error" class="text-xs font-semibold text-red-600 mt-2"></div></div>' +
    '<div class="flex justify-end gap-2 px-5 pb-5">' +
    '<button class="btn-ghost" data-action="close-modal">Cancel</button>' +
    '<button class="btn-primary" data-action="save-supplier-payment" data-id="' + s.id + '">Record payment</button></div>'
  );
};

ACTIONS['save-supplier-payment'] = d => {
  const s = DB.suppliers.find(x => x.id === d.id);
  if (!s) return;
  const amt = Number((document.getElementById('sup-pay') || {}).value);
  const err = document.getElementById('sup-pay-error');
  const fail = m => { if (err) err.textContent = m; else toast(m, 'error'); };
  if (isNaN(amt) || amt <= 0) return fail('Enter an amount greater than 0.');
  if (amt > s.owed) return fail('Amount is more than what you owe ' + s.name + ' (' + fmt(s.owed) + ').');
  s.owed = Math.max(0, Math.round((s.owed - amt) * 100) / 100);
  /* settle oldest unpaid purchases first so Paid/Balance columns stay correct */
  let remaining = amt;
  DB.purchases
    .filter(p => p.supplierId === s.id && p.balance > 0)
    .sort((a, b) => (a.day > b.day ? 1 : a.day < b.day ? -1 : 0))
    .forEach(function (p) {
      if (remaining <= 0) return;
      const take = Math.min(p.balance, remaining);
      p.paid += take;
      p.balance = Math.max(0, p.cost - p.paid);
      remaining -= take;
    });
  persist(); closeModal(); render();
  toast('Payment of ' + fmt(amt) + ' to ' + s.name + ' recorded. Balance: ' + fmt(s.owed) + '.');
};

/* purchases */
ACTIONS['add-purchase'] = () => {
  const sh = myShop();
  if (!suppliersOf(sh.id).length) { toast('Add a supplier first.', 'error'); return; }
  if (!productsOf(sh.id).length) { toast('Add a product first.', 'error'); return; }
  openModal(purchaseFormHTML());
  setTimeout(() => {
    const prod = document.getElementById('pu-prod');
    const unit = document.getElementById('pu-unit');
    if (prod && unit) {
      const p = DB.products.find(x => x.id === prod.value);
      if (p) unit.value = p.buy;
      updatePurchaseBalance();
    }
  }, 40);
};
ACTIONS['create-purchase'] = () => {
  const v = id => document.getElementById(id).value.trim();
  const supId = v('pu-sup'), prodId = v('pu-prod'), day = v('pu-date') || dayKey();
  const qty = Number(v('pu-qty')), unit = Number(v('pu-unit')), paid = Number(v('pu-paid'));
  const err = document.getElementById('pu-error');
  const fail = m => { if (err) err.textContent = m; };
  if (!supId || !prodId) return fail('Supplier and product are required.');
  if (isNaN(qty) || qty < 1) return fail('Quantity must be 1 or more.');
  if (isNaN(unit) || unit < 0) return fail('Unit cost must be 0 or more.');
  if (isNaN(paid) || paid < 0) return fail('Paid amount must be 0 or more.');
  const cost = qty * unit;
  if (paid > cost) return fail('Paid amount cannot be more than the cost.');
  const sup = DB.suppliers.find(x => x.id === supId);
  const prod = DB.products.find(x => x.id === prodId);
  DB.purchases.push({
    id: uid('pu'), shopId: myShop().id, day: day, supplierId: sup.id, supplierName: sup.name,
    productId: prod.id, productName: prod.name, qty: qty, cost: cost, paid: paid, balance: cost - paid
  });
  sup.owed += (cost - paid);
  prod.stock += qty;               /* stock up automatically */
  persist(); closeModal(); render();
  toast('Purchase saved — stock of ' + prod.name + ' is now ' + prod.stock + '.');
};
