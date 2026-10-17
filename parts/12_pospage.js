function posGridHTML() {
  const sh = myShop();
  const list = posProducts();
  if (!list.length) {
    return '<div class="col-span-full p-8 text-center text-sm text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">' +
      'No products match your search.</div>';
  }
  let h = '';
  list.forEach(function (p) {
    const low = p.stock <= sh.lowStockLevel;
    h += '<button class="bg-white rounded-xl border border-slate-200 p-3 text-left hover:border-brand-500 hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed" ' +
      'data-action="add-to-cart" data-id="' + p.id + '"' + (p.stock <= 0 ? ' disabled' : '') + '>' +
      '<div class="flex items-start justify-between gap-1">' +
      '<span class="text-[10px] font-bold uppercase tracking-wide text-slate-400">' + esc(p.type) + '</span>' +
      '<span class="badge ' + (p.stock <= 0 ? 'bg-red-100 text-red-700' : low ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600') + '">' +
      (p.stock <= 0 ? 'Out' : fmt(p.stock)) + '</span></div>' +
      '<div class="mt-1 text-sm font-bold text-slate-800 leading-snug line-clamp-2">' + esc(p.name) + '</div>' +
      '<div class="mt-2 text-lg font-black text-brand-700">' + fmt(p.retail) + '</div>' +
      '<div class="text-[10px] text-slate-400 font-semibold">10+ ' + bi('arrow-right-short') + ' ' + fmt(p.wholesale) + '</div>' +
      '</button>';
  });
  return h;
}
function pagePOS() {
  const types = ['All'].concat(shopTypes());
  let h = '<div class="space-y-4">';
  if (S.user.role === 'cashier') {
    const sh = myShop();
    const todayCount = salesOn(sh.id, dayKey()).filter(s => s.cashierId === S.user.id).length;
    h += '<div class="bg-slate-900 text-white rounded-xl px-4 py-3 flex items-center justify-between gap-3">' +
      '<div class="text-sm font-semibold">' + esc(sh.name) + '</div>' +
      '<div class="text-xs text-slate-300">' + esc(S.user.name) + ' &middot; sales today: <b class="text-brand-400">' + todayCount + '</b></div>' +
      '</div>';
  }
  h += '<div class="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 items-start">';

  /* left: products */
  h += '<div class="space-y-3">';
  h += '<div class="card p-3 flex flex-col sm:flex-row gap-2">' +
    '<input class="input flex-1" id="pos-search" data-change="pos-search" value="' + esc(S.posQ) + '" placeholder="Search product or barcode...">' +
    '<div class="flex gap-1.5 flex-wrap">' +
    types.map(t => '<button class="btn btn-sm ' + (S.posType === t ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200') +
      '" data-action="pos-type" data-t="' + esc(t) + '">' + esc(t) + '</button>').join('') +
    '</div></div>';
  h += '<div id="pos-grid" class="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-4 gap-3">' + posGridHTML() + '</div>';
  h += '</div>';

  /* right: cart */
  h += '<div id="cart-panel" class="xl:sticky xl:top-20">' + cartPanelHTML() + '</div>';
  h += '</div></div>';
  return h;
}
