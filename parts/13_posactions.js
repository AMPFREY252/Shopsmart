/* ================= POS actions ================= */
function refreshPOS() {
  const grid = document.getElementById('pos-grid');
  if (grid) grid.innerHTML = posGridHTML();
  const panel = document.getElementById('cart-panel');
  if (panel) panel.innerHTML = cartPanelHTML();
}
function addToCart(id) {
  const p = DB.products.find(x => x.id === id);
  if (!p) return;
  if (p.stock <= 0) { toast('"' + p.name + '" is out of stock.', 'error'); return; }
  const line = S.cart.find(l => l.pid === id);
  if (line) {
    if (line.qty + 1 > p.stock) { toast('Only ' + p.stock + ' in stock for "' + p.name + '".', 'error'); return; }
    line.qty += 1;
    line.price = linePrice(p, line.qty);
  } else {
    S.cart.push({ pid: p.id, name: p.name, qty: 1, price: linePrice(p, 1), buy: p.buy, retail: p.retail, wholesale: p.wholesale });
  }
  refreshPOS();
}
function changeQty(i, d) {
  const l = S.cart[i];
  if (!l) return;
  const p = DB.products.find(x => x.id === l.pid);
  const next = l.qty + d;
  if (next <= 0) { S.cart.splice(i, 1); }
  else {
    if (p && next > p.stock) { toast('Only ' + p.stock + ' in stock.', 'error'); return; }
    l.qty = next;
    if (p) l.price = linePrice(p, l.qty);
  }
  refreshPOS();
}
function completeSale() {
  if (!S.cart.length) { toast('Cart is empty.', 'error'); return; }
  const sh = myShop();
  const t = cartTotals();

  for (const l of S.cart) {
    const p = DB.products.find(x => x.id === l.pid);
    if (!p || p.stock < l.qty) { toast('Not enough stock for "' + l.name + '".', 'error'); return; }
  }
  if (S.method === 'Credit' && !S.creditCust) { toast('Choose the customer for credit sales.', 'error'); return; }
  let paid = t.total, change = 0, balance = 0;
  if (S.method === 'Cash') {
    paid = S.paid === '' ? t.total : Number(S.paid);
    if (isNaN(paid) || paid < t.total) { toast('Amount paid is less than the total.', 'error'); return; }
    change = paid - t.total;
  } else if (S.method === 'Credit') {
    paid = S.creditPaid === '' ? 0 : Number(S.creditPaid);
    if (isNaN(paid) || paid < 0) { toast('Enter a valid amount paid now (0 or more).', 'error'); return; }
    if (paid > t.total) { toast('Paid now cannot be more than the total (' + fmt(t.total) + ').', 'error'); return; }
    balance = t.total - paid;
  } else {
    paid = t.total;
  }

  sh.seq = (sh.seq || 0) + 1;
  const now = new Date();
  const sale = {
    id: uid('s'), shopId: sh.id, day: dayKey(now), ts: now.toISOString(),
    receipt: sh.prefix + '-' + pad4(sh.seq),
    cashierId: S.user.id, cashier: S.user.name,
    items: S.cart.map(l => ({ pid: l.pid, name: l.name, qty: l.qty, price: l.price, buy: l.buy })),
    subtotal: t.sub, discount: t.disc, total: t.total,
    method: S.method, paid: paid, change: change, balance: balance,
    customerId: S.method === 'Credit' ? S.creditCust : null
  };
  /* stock down */
  sale.items.forEach(function (it) {
    const p = DB.products.find(x => x.id === it.pid);
    if (p) p.stock = Math.max(0, p.stock - it.qty);
  });
  DB.sales.push(sale);
  if (sale.method === 'Credit' && sale.customerId) {
    const c = DB.customers.find(x => x.id === sale.customerId);
    if (c) {
      c.owed += balance;
      c.totalBought += t.total;
      if (balance > 0 && !c.due) c.due = dayKey(shiftDay(7));
    }
  }
  persist();

  S.lastSale = sale.id;
  S.cart = []; S.discount = 0; S.paid = ''; S.method = 'Cash'; S.creditCust = ''; S.creditPaid = '';
  refreshPOS();
  toast('Sale completed — stock updated.');
  showReceipt(sale.id);
}
