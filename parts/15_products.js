/* ================= Products page ================= */
function filteredProducts() {
  const sh = myShop();
  const q = S.prodQ.trim().toLowerCase();
  return productsOf(sh.id).filter(function (p) {
    if (S.prodType !== 'All' && p.type !== S.prodType) return false;
    if (S.lowOnly && p.stock > sh.lowStockLevel) return false;
    if (q && p.name.toLowerCase().indexOf(q) === -1 && String(p.barcode).toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
}
function productsTableHTML() {
  const sh = myShop();
  const list = filteredProducts();
  let h = '<table class="w-full"><thead class="bg-slate-50"><tr>' +
    '<th class="th">Name</th><th class="th">Type</th><th class="th">Barcode</th>' +
    '<th class="th text-right">Buying</th><th class="th text-right">Retail</th><th class="th text-right">Wholesale</th>' +
    '<th class="th text-right">Stock</th><th class="th">Status</th><th class="th text-right">Actions</th>' +
    '</tr></thead><tbody>';
  list.forEach(function (p) {
    h += '<tr class="border-b border-slate-100 hover:bg-slate-50">' +
      '<td class="td font-semibold text-slate-800">' + esc(p.name) + '</td>' +
      '<td class="td text-xs">' + esc(p.type) + '</td>' +
      '<td class="td font-mono text-xs">' + esc(p.barcode) + '</td>' +
      '<td class="td text-right">' + fmt(p.buy) + '</td>' +
      '<td class="td text-right font-semibold">' + fmt(p.retail) + '</td>' +
      '<td class="td text-right">' + fmt(p.wholesale) + '</td>' +
      '<td class="td text-right font-bold">' + fmt(p.stock) + '</td>' +
      '<td class="td">' + stockBadge(p, sh.lowStockLevel) + '</td>' +
      '<td class="td text-right whitespace-nowrap space-x-1">' +
      '<button class="btn-ghost btn-sm" data-action="restock" data-id="' + p.id + '">' + bi('plus-lg') + ' Stock</button>' +
      '<button class="btn-ghost btn-sm" data-action="edit-product" data-id="' + p.id + '">' + bi('pencil-fill') + ' Edit</button>' +
      '<button class="btn-danger btn-sm" data-action="delete-product" data-id="' + p.id + '">' + bi('trash-fill') + ' Delete</button>' +
      '</td></tr>';
  });
  if (!list.length) h += '<tr><td class="td text-slate-400 text-center py-6" colspan="9">No products match the filter.</td></tr>';
  h += '</tbody></table>';
  return h;
}
function pageProducts() {
  const sh = myShop();
  const all = productsOf(sh.id);
  const lowCount = all.filter(p => p.stock <= sh.lowStockLevel).length;
  const types = ['All'].concat(shopTypes());
  let h = '<div class="space-y-4">';
  h += '<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">' +
    '<div class="kpi"><div class="kpi-label">Products</div><div class="kpi-value">' + all.length + '</div></div>' +
    '<div class="kpi"><div class="kpi-label">Low stock</div><div class="kpi-value text-amber-600">' + lowCount + '</div><div class="kpi-sub">≤ ' + sh.lowStockLevel + ' units</div></div>' +
    '<div class="kpi"><div class="kpi-label">Out of stock</div><div class="kpi-value text-red-600">' + all.filter(p => p.stock <= 0).length + '</div></div>' +
    '<div class="kpi"><div class="kpi-label">Stock value (buying)</div><div class="kpi-value">' + fmt(sum(all, p => p.buy * p.stock)) + '</div><div class="kpi-sub">UGX</div></div>' +
    '</div>';
  h += '<div class="card p-3 flex flex-col lg:flex-row gap-2 lg:items-center">' +
    '<input class="input lg:w-72" id="prod-search" data-change="prod-search" value="' + esc(S.prodQ) + '" placeholder="Search name or barcode...">' +
    '<div class="flex gap-1.5 flex-wrap">' +
    types.map(t => '<button class="btn btn-sm ' + (S.prodType === t ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200') +
      '" data-action="prod-type" data-t="' + esc(t) + '">' + esc(t) + '</button>').join('') +
    '</div>' +
    '<button class="btn btn-sm ' + (S.lowOnly ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200') +
    '" data-action="toggle-low">' + bi('exclamation-triangle-fill') + ' Low stock only</button>' +
    '<div class="lg:ml-auto flex gap-2 flex-wrap"><button class="btn-ghost" data-action="manage-types">' + bi('tags-fill') + ' Manage types</button><button class="btn-primary" data-action="add-product">' + bi('plus-lg') + ' Add product</button></div>' +
    '</div>';
  h += '<div class="card overflow-hidden"><div id="prod-table">' + productsTableHTML() + '</div></div>';
  h += '</div>';
  return h;
}
