/* ================= Reports page ================= */
const REP_TABS = [
  { id: 'sales', label: 'Sales Report' },
  { id: 'stock', label: 'Stock Report' },
  { id: 'profit', label: 'Profit Report' },
  { id: 'debt', label: 'People Who Owe Me' },
  { id: 'supplier', label: 'Supplier Report' }
];
function repRange() {
  let from = S.repFrom || dayKey(shiftDay(-29));
  let to = S.repTo || dayKey();
  if (to < from) { const t = from; from = to; to = t; }
  return { from, to };
}
function repData() {
  const sh = myShop();
  const r = repRange();
  if (S.repTab === 'sales') {
    const rows = salesBetween(sh.id, r.from, r.to).slice().sort((a, b) => (b.ts > a.ts ? 1 : -1));
    return {
      title: 'Sales Report (' + fmtDate(r.from) + ' – ' + fmtDate(r.to) + ')',
      headers: ['Date', 'Receipt', 'Cashier', 'Items', 'Method', 'Total', 'Paid', 'Balance', 'Profit'],
      rows: rows.map(s => [fmtDate(s.day), s.receipt, s.cashier, s.items.reduce((t, i) => t + i.qty, 0), s.method, fmt(s.total), fmt(s.paid || 0), fmt(s.method === 'Credit' ? (s.balance != null ? s.balance : (s.total - (s.paid || 0))) : 0), fmt(saleProfit(s))]),
      footers: ['', 'TOTAL (' + rows.length + ' sales)', '', '', '', fmt(sum(rows, s => s.total)), fmt(sum(rows, s => (s.paid || 0))), fmt(sum(rows, s => (s.method === 'Credit' ? (s.balance != null ? s.balance : (s.total - (s.paid || 0))) : 0))), fmt(sum(rows, saleProfit))],
      csvFoot: ['TOTAL', '', '', '', sum(rows, s => s.total), sum(rows, s => (s.paid || 0)), sum(rows, s => (s.method === 'Credit' ? (s.balance != null ? s.balance : (s.total - (s.paid || 0))) : 0)), sum(rows, saleProfit)]
    };
  }
  if (S.repTab === 'stock') {
    const list = productsOf(sh.id);
    return {
      title: 'Stock Report (as at ' + fmtDate(dayKey()) + ')',
      headers: ['Product', 'Type', 'Barcode', 'Stock', 'Buying', 'Retail', 'Stock value'],
      rows: list.map(p => [p.name, p.type, p.barcode, p.stock, fmt(p.buy), fmt(p.retail), fmt(p.buy * p.stock)]),
      footers: ['TOTAL', '', '', sum(list, p => p.stock), '', '', fmt(sum(list, p => p.buy * p.stock))],
      csvFoot: ['TOTAL', '', '', sum(list, p => p.stock), '', '', sum(list, p => p.buy * p.stock)]
    };
  }
  if (S.repTab === 'profit') {
    const rows = [];
    let d0 = new Date(r.from + 'T00:00:00'), d1 = new Date(r.to + 'T00:00:00');
    for (let d = new Date(d0); d <= d1; d.setDate(d.getDate() + 1)) {
      const k = dayKey(d);
      const ss = salesOn(sh.id, k);
      if (!ss.length && !expensesOn(sh.id, k).length) continue;
      const sales = sum(ss, s => s.total);
      const cogs = sum(ss, saleCost);
      const exp = sum(expensesOn(sh.id, k), e => e.amount);
      rows.push([fmtDate(k), fmt(sales), fmt(cogs), fmt(exp), fmt(sales - cogs - exp)]);
    }
    const salesT = rows.reduce((t, x) => t + Number(String(x[1]).replace(/,/g, '')), 0);
    const cogsT = rows.reduce((t, x) => t + Number(String(x[2]).replace(/,/g, '')), 0);
    const expT = rows.reduce((t, x) => t + Number(String(x[3]).replace(/,/g, '')), 0);
    return {
      title: 'Profit Report (' + fmtDate(r.from) + ' – ' + fmtDate(r.to) + ')',
      headers: ['Date', 'Sales', 'Cost of goods', 'Expenses', 'Net profit'],
      rows: rows,
      footers: ['TOTAL', fmt(salesT), fmt(cogsT), fmt(expT), fmt(salesT - cogsT - expT)],
      csvFoot: ['TOTAL', salesT, cogsT, expT, salesT - cogsT - expT]
    };
  }
  if (S.repTab === 'debt') {
    const list = customersOf(sh.id).filter(c => c.owed > 0).sort((a, b) => b.owed - a.owed);
    return {
      title: 'People Who Owe Me (as at ' + fmtDate(dayKey()) + ')',
      headers: ['Customer', 'Phone', 'Total bought', 'Owes', 'Due date'],
      rows: list.map(c => [c.name, c.phone, fmt(c.totalBought), fmt(c.owed), c.due ? fmtDate(c.due) : '—']),
      footers: ['TOTAL (' + list.length + ' people)', '', '', fmt(sum(list, c => c.owed)), ''],
      csvFoot: ['TOTAL', '', sum(list, c => c.totalBought), sum(list, c => c.owed), '']
    };
  }
  /* supplier */
  const sups = suppliersOf(sh.id);
  const purs = DB.purchases.filter(p => p.shopId === sh.id);
  return {
    title: 'Supplier Report (as at ' + fmtDate(dayKey()) + ')',
    headers: ['Supplier', 'Phone', 'Purchases', 'Total cost', 'Paid', 'Balance owed'],
    rows: sups.map(function (s) {
      const pp = purs.filter(p => p.supplierId === s.id);
      return [s.name, s.phone, pp.length, fmt(sum(pp, p => p.cost)), fmt(sum(pp, p => p.paid)), fmt(s.owed)];
    }),
    footers: ['TOTAL', '', purs.length, fmt(sum(purs, p => p.cost)), fmt(sum(purs, p => p.paid)), fmt(sum(sups, s => s.owed))],
    csvFoot: ['TOTAL', '', purs.length, sum(purs, p => p.cost), sum(purs, p => p.paid), sum(sups, s => s.owed)]
  };
}
