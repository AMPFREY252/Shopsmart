/* ================= Products actions ================= */
function productFormHTML(p) {
  const types = shopTypes();
  const cur = p ? normTypeName(p.type) : '';
  const inList = cur && types.some(t => t.toLowerCase() === cur.toLowerCase());
  const canon = inList ? types.find(t => t.toLowerCase() === cur.toLowerCase()) : cur;
  const opts = types.map(t => '<option' + (canon === t ? ' selected' : '') + '>' + esc(t) + '</option>').join('');
  const sel = cur && !inList ? '<option selected>' + esc(cur) + '</option>' : '';
  return '<div class="p-5"><h3 class="text-lg font-bold text-slate-800">' + (p ? 'Edit product' : 'Add product') + '</h3>' +
    '<div class="grid gap-3 sm:grid-cols-2 mt-4">' +
    '<div class="sm:col-span-2"><label class="label">Product name *</label><input id="pf-name" class="input" value="' + esc(p ? p.name : '') + '" placeholder="e.g. Sugar 50kg"></div>' +
    '<div><label class="label">Type *</label><div class="flex gap-2"><select id="pf-type" class="input flex-1">' + sel + opts + '</select>' +
    '<button type="button" class="btn-ghost btn-sm whitespace-nowrap" data-action="manage-types" title="Add a new type">' + bi('plus-lg') + ' New</button></div>' +
    '<div class="text-[11px] text-slate-400 mt-1">Pick a type, or tap New to add one.</div></div>' +
    '<div><label class="label">Barcode</label><input id="pf-barcode" class="input" value="' + esc(p ? p.barcode : '') + '" placeholder="auto if empty"></div>' +
    '<div><label class="label">Buying price *</label><input id="pf-buy" type="number" min="0" class="input" value="' + (p ? p.buy : '') + '"></div>' +
    '<div><label class="label">Retail price *</label><input id="pf-retail" type="number" min="0" class="input" value="' + (p ? p.retail : '') + '"></div>' +
    '<div><label class="label">Wholesale price * (10+ items)</label><input id="pf-ws" type="number" min="0" class="input" value="' + (p ? p.wholesale : '') + '"></div>' +
    '<div><label class="label">' + (p ? 'Stock' : 'Opening stock *') + '</label><input id="pf-stock" type="number" min="0" class="input" value="' + (p ? p.stock : '') + '"></div>' +
    '<div id="pf-error" class="sm:col-span-2 text-xs font-semibold text-red-600"></div>' +
    '</div></div>' +
    '<div class="flex justify-end gap-2 px-5 pb-5">' +
    '<button class="btn-ghost" data-action="close-modal">Cancel</button>' +
    '<button class="btn-primary" data-action="' + (p ? 'save-product' : 'create-product') + '"' + (p ? ' data-id="' + p.id + '"' : '') + '>Save product</button></div>';
}
function readProductForm() {
  const v = id => document.getElementById(id).value.trim();
  const name = v('pf-name'), buy = Number(v('pf-buy')), retail = Number(v('pf-retail')),
    ws = Number(v('pf-ws')), stock = Number(v('pf-stock') || 0), barcode = v('pf-barcode');
  const err = document.getElementById('pf-error');
  const fail = m => { if (err) err.textContent = m; return null; };
  if (!name) return fail('Product name is required.');
  const rawType = document.getElementById('pf-type').value;
  const type = normTypeName(rawType);
  if (!type) return fail('Pick a product type (or add a new one).');
  if (isNaN(buy) || buy < 0 || isNaN(retail) || retail < 0 || isNaN(ws) || ws < 0) return fail('Enter valid prices (0 or more).');
  if (isNaN(stock) || stock < 0) return fail('Stock must be 0 or more.');
  /* auto-register a brand-new typed value so filters/POS pick it up immediately */
  try {
    const sh = myShop();
    if (sh) {
      if (!Array.isArray(sh.ptypes)) sh.ptypes = shopTypes(sh.id);
      if (!sh.ptypes.some(t => String(t).toLowerCase() === type.toLowerCase())) {
        sh.ptypes.push(type);
        persist();
      }
    }
  } catch (e) { }
  return {
    name, type: type, barcode: barcode || ('SS' + Date.now().toString().slice(-8)),
    buy, retail, wholesale: ws, stock
  };
}
function saveProduct(id) {
  const d = readProductForm();
  if (!d) return;
  const p = DB.products.find(x => x.id === id);
  if (!p) return;
  Object.assign(p, d);
  persist(); closeModal(); render();
  toast('Product updated.');
}
function createProduct() {
  const d = readProductForm();
  if (!d) return;
  d.id = uid('p');
  d.shopId = myShop().id;
  DB.products.push(d);
  persist(); closeModal(); render();
  toast('Product added.');
}
function typeManagerHTML() {
  const types = shopTypes();
  const counts = {};
  productsOf(myShop().id).forEach(function (p) {
    const key = normTypeName(p.type).toLowerCase();
    if (key) counts[key] = (counts[key] || 0) + 1;
  });
  let rows = '';
  types.forEach(function (t) {
    const n = counts[t.toLowerCase()] || 0;
    rows += '<div class="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2">' +
      '<span class="font-semibold text-slate-800 text-sm flex-1 truncate">' + esc(t) + '</span>' +
      '<span class="badge bg-slate-100 text-slate-600 whitespace-nowrap">' + n + ' product' + (n === 1 ? '' : 's') + '</span>' +
      (n ? '' : '<button class="btn-danger btn-sm" data-action="delete-type" data-t="' + esc(t) + '">' + bi('trash-fill') + '</button>') +
      '</div>';
  });
  return '<div class="p-5"><h3 class="text-lg font-bold text-slate-800">Product types</h3>' +
    '<p class="text-sm text-slate-500 mt-1">These types show on the Products page, in the selling screen (POS), in reports and in the add-product form. Every shop has its own list.</p>' +
    '<div class="mt-4 space-y-2 max-h-[40vh] overflow-y-auto scroll-thin">' + (rows || '<div class="text-sm text-slate-400">No types yet.</div>') + '</div>' +
    '<label class="label mt-4">New type *</label>' +
    '<div class="flex gap-2"><input id="nt-name" class="input flex-1" maxlength="40" placeholder="e.g. Beverages">' +
    '<button class="btn-primary whitespace-nowrap" data-action="create-type">' + bi('plus-lg') + ' Add</button></div>' +
    '<div id="nt-error" class="text-xs font-semibold text-red-600 mt-2"></div>' +
    '<p class="text-[11px] text-slate-400 mt-2">A type in use by products cannot be deleted — move those products to another type first (edit the product).</p></div>' +
    '<div class="flex justify-end gap-2 px-5 pb-5">' +
    '<button class="btn-ghost" data-action="close-modal">Close</button></div>';
}
function restockModal(id) {
  const p = DB.products.find(x => x.id === id);
  if (!p) return;
  openModal(
    '<div class="p-5"><h3 class="text-lg font-bold text-slate-800">Add stock</h3>' +
    '<p class="text-sm text-slate-500 mt-1">' + esc(p.name) + ' — current stock: <b>' + p.stock + '</b></p>' +
    '<label class="label mt-4">Quantity to add *</label>' +
    '<input id="rf-qty" type="number" min="1" class="input" value="10">' +
    '<div id="rf-error" class="text-xs font-semibold text-red-600 mt-2"></div></div>' +
    '<div class="flex justify-end gap-2 px-5 pb-5">' +
    '<button class="btn-ghost" data-action="close-modal">Cancel</button>' +
    '<button class="btn-primary" data-action="save-restock" data-id="' + id + '">Add to stock</button></div>'
  );
  setTimeout(() => { const el = document.getElementById('rf-qty'); if (el) { el.focus(); el.select(); } }, 40);
}
