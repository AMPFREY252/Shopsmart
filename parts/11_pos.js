/* ================= POS / Selling page ================= */
function posProducts() {
  const sh = myShop();
  const q = S.posQ.trim().toLowerCase();
  return productsOf(sh.id).filter(function (p) {
    if (S.posType !== 'All' && p.type !== S.posType) return false;
    if (q && p.name.toLowerCase().indexOf(q) === -1 && String(p.barcode).toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
}
function linePrice(p, qty) { return qty >= 10 ? p.wholesale : p.retail; }
function cartTotals() {
  const sub = sum(S.cart, l => l.price * l.qty);
  const disc = Math.min(S.discount || 0, sub);
  return { sub, disc, total: sub - disc };
}
function cartPanelHTML() {
  const sh = myShop();
  const custs = customersOf(sh.id);
  const t = cartTotals();
  let h = '<div class="card flex flex-col">';

  h += '<div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">' +
    '<h3 class="font-bold text-slate-800 h-ic">' + bi('cart-fill') + ' Current sale</h3>' +
    (S.cart.length ? '<button class="btn-danger btn-sm" data-action="cart-clear">Clear</button>' : '') +
    '</div>';

  if (!S.cart.length) {
    h += '<div class="p-6 text-center text-sm text-slate-400">Cart is empty.<br>Tap a product on the left to add it.</div>';
  } else {
    h += '<div class="divide-y divide-slate-100 max-h-[38vh] overflow-y-auto scroll-thin">';
    S.cart.forEach(function (l, i) {
      const wh = l.qty >= 10;
      h += '<div class="px-4 py-3 flex items-center gap-2">' +
        '<div class="min-w-0 flex-1">' +
        '<div class="text-sm font-semibold text-slate-800 truncate">' + esc(l.name) + '</div>' +
        '<div class="text-xs text-slate-500">' + fmt(l.price) + ' each' +
        (wh ? ' <span class="badge bg-brand-100 text-brand-800">wholesale</span>' : '') + '</div></div>' +
        '<div class="flex items-center gap-1">' +
        '<button class="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-slate-700" data-action="cart-qty" data-i="' + i + '" data-d="-1">' + bi('dash-lg') + '</button>' +
        '<span class="w-8 text-center text-sm font-bold">' + l.qty + '</span>' +
        '<button class="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-slate-700" data-action="cart-qty" data-i="' + i + '" data-d="1">' + bi('plus-lg') + '</button>' +
        '</div>' +
        '<div class="w-20 text-right text-sm font-bold text-slate-800">' + fmt(l.price * l.qty) + '</div>' +
        '<button class="text-slate-400 hover:text-red-600 text-lg leading-none" data-action="cart-remove" data-i="' + i + '" aria-label="Remove">' + bi('x-lg') + '</button>' +
        '</div>';
    });
    h += '</div>';
  }

  h += '<div class="px-4 py-3 border-t border-slate-200 space-y-3">';
  h += '<div class="flex items-center gap-2">' +
    '<label class="text-xs font-bold text-slate-600 whitespace-nowrap">Discount</label>' +
    '<input class="input py-1.5" type="number" min="0" id="discount-input" data-change="discount" value="' + (S.discount || 0) + '">' +
    '</div>';
  h += '<div><div class="text-xs font-bold text-slate-600 mb-1.5">Payment method</div>' +
    '<div class="grid grid-cols-2 gap-1.5">' +
    METHODS.map(m => '<button class="btn btn-sm ' + (S.method === m ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200') +
      ' px-1" data-action="set-method" data-m="' + esc(m) + '">' + esc(m) + '</button>').join('') +
    '</div></div>';

  if (S.method === 'Cash') {
    const paid = Number(S.paid || 0);
    h += '<div class="flex items-center gap-2">' +
      '<label class="text-xs font-bold text-slate-600 whitespace-nowrap">Amount paid</label>' +
      '<input class="input py-1.5" type="number" min="0" id="paid-input" data-change="paid" value="' + esc(S.paid) + '" placeholder="' + t.total + '">' +
      '</div>' +
      '<div class="flex items-center justify-between text-xs font-semibold ' + (paid >= t.total && S.paid !== '' ? 'text-brand-700' : 'text-slate-500') + '">' +
      '<span>Change</span><span>' + fmt(Math.max(0, paid - t.total)) + ' UGX</span></div>';
  }
  if (S.method === 'Credit') {
    const cp = S.creditPaid === '' ? 0 : Number(S.creditPaid);
    h += '<div><label class="text-xs font-bold text-slate-600">Customer (who will pay later) *</label>' +
      '<select class="input py-1.5 mt-1" data-change="credit-cust">' +
      '<option value="">— choose customer —</option>' +
      custs.map(c => '<option value="' + c.id + '"' + (S.creditCust === c.id ? ' selected' : '') + '>' +
        esc(c.name) + ' — owes ' + fmt(c.owed) + '</option>').join('') +
      '</select>' +
      '<button class="text-xs text-brand-700 font-bold mt-1" data-action="quick-customer">' + bi('plus-lg') + ' New customer</button></div>';
    h += '<div class="flex items-center gap-2">' +
      '<label class="text-xs font-bold text-slate-600 whitespace-nowrap">Paid now</label>' +
      '<input class="input py-1.5" type="number" min="0" max="' + t.total + '" id="credit-paid-input" data-change="credit-paid" value="' + esc(S.creditPaid) + '" placeholder="0">' +
      '</div>' +
      '<div class="flex items-center justify-between text-xs font-semibold ' + (cp > 0 ? 'text-brand-700' : 'text-slate-500') + '">' +
      '<span>Balance (stays on credit)</span><span>' + fmt(Math.max(0, t.total - (isNaN(cp) ? 0 : cp))) + ' UGX</span></div>' +
      '<p class="text-[11px] text-slate-400">Leave 0 for full credit, or enter part-payment received now.</p>';
  }

  h += '<div class="border-t border-dashed border-slate-300 pt-2 space-y-1 text-sm">' +
    '<div class="flex justify-between text-slate-500"><span>Subtotal</span><span>' + fmt(t.sub) + '</span></div>' +
    (t.disc ? '<div class="flex justify-between text-brand-700"><span>Discount</span><span>−' + fmt(t.disc) + '</span></div>' : '') +
    '<div class="flex justify-between font-black text-lg text-slate-800"><span>Total</span><span>' + fmt(t.total) + ' ' + esc(cur()) + '</span></div>' +
    '</div>';
  h += '<button class="btn-primary w-full py-3 text-base" data-action="complete-sale"' + (S.cart.length ? '' : ' disabled') + '>' + bi('check-lg') + ' Complete Sale</button>';
  h += '</div></div>';
  return h;
}
