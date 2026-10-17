/* ================= Seed continuation: sales, suppliers, customers, expenses ================= */
function seedRest(db, defs, rnd, now) {
  // --- suppliers + purchases + customers per shop ---
  const supTpl = [
    ['Kampala Wholesale Distributors', '0772111222', 'Kampala'],
    ['Mbarara Farm Supplies', '0752333444', 'Mbarara'],
    ['Rwenzori Electronics Ltd', '0702555666', 'Fort Portal']
  ];
  const cusTpl = [
    ['Agnes Nabukwasi', '0772555001'],
    ['Robert Baguma', '0772555002'],
    ['Cynthia Akiiki', '0772555003'],
    ['Francis Byaruhanga', '0772555004'],
    ['Diana Nabaasa', '0772555005']
  ];

  defs.forEach(function (sh, si) {
    const prods = db.products.filter(p => p.shopId === sh.id);

    supTpl.slice(0, 2 + (si % 2)).forEach(function (t, ui) {
      const sup = { id: 'su_' + sh.id + '_' + ui, shopId: sh.id, name: t[0], phone: t[1], location: t[2], owed: 0 };
      db.suppliers.push(sup);
      for (let k = 0; k < 2; k++) {
        const p = prods[(ui * 7 + k * 3) % prods.length];
        const qty = 10 + Math.floor(rnd() * 30);
        const unit = Math.round(p.buy * (0.95 + rnd() * 0.1));
        const cost = qty * unit;
        const paid = Math.min(k === 0 ? cost : Math.round(cost * (0.4 + rnd() * 0.4) / 500) * 500, cost);
        const d = new Date(now); d.setDate(d.getDate() - (3 + ui * 5 + k * 4));
        db.purchases.push({
          id: uid('pu'), shopId: sh.id, day: dayKey(d), supplierId: sup.id, supplierName: sup.name,
          productId: p.id, productName: p.name, qty: qty, cost: cost, paid: paid, balance: cost - paid
        });
        sup.owed += cost - paid;
      }
    });

    const custs = [];
    cusTpl.slice(0, 4 + (si % 2)).forEach(function (t, ci) {
      const c = { id: 'cu_' + sh.id + '_' + ci, shopId: sh.id, name: t[0], phone: t[1], totalBought: 0, owed: 0, due: '' };
      const bought = 80000 + Math.floor(rnd() * 900000);
      c.totalBought = bought;
      db.customers.push(c);
      custs.push(c);
    });

    // --- expenses over last week ---
    const exps = [['Rent', -6, 150000 + si * 50000], ['Transport', -5, 20000], ['Airtime', -4, 5000],
      ['Salary', -3, 250000], ['Water', -2, 15000], ['Transport', -1, 10000], ['Airtime', 0, 3000]];
    exps.forEach(function (e) {
      const d = shiftDay(e[1]);
      db.expenses.push({ id: uid('ex'), shopId: sh.id, day: dayKey(d), cat: e[0], amount: e[2], note: '' });
    });
    db.openings[sh.id + '|' + dayKey(now)] = [200000, 100000, 300000][si];

    // --- 7 days of sales ---
    const shop = db.shops.find(s => s.id === sh.id);
    const cashiers = db.users.filter(u => u.shopId === sh.id && u.role === 'cashier');
    for (let d = 6; d >= 0; d--) {
      const base = shiftDay(-d);
      const n = 4 + Math.floor(rnd() * 6);
      for (let i = 0; i < n; i++) {
        const dt = new Date(base);
        dt.setHours(8 + Math.floor(rnd() * 11), Math.floor(rnd() * 60), 0, 0);
        if (dt.getTime() > now.getTime()) dt.setTime(now.getTime() - Math.floor(rnd() * 1800000));
        const nItems = 1 + Math.floor(rnd() * 3);
        const seen = {}, items = [];
        for (let j = 0; j < nItems; j++) {
          const p = prods[Math.floor(rnd() * prods.length)];
          if (seen[p.id]) continue;
          seen[p.id] = 1;
          let qty = 1 + Math.floor(rnd() * 5);
          if (rnd() < 0.09) qty = 10 + Math.floor(rnd() * 6);
          items.push({ pid: p.id, name: p.name, qty: qty, price: qty >= 10 ? p.wholesale : p.retail, buy: p.buy });
        }
        if (!items.length) continue;
        const subtotal = sum(items, it => it.price * it.qty);
        const discount = rnd() < 0.18 ? Math.floor(rnd() * 4) * 500 : 0;
        const total = Math.max(0, subtotal - discount);
        const mr = rnd();
        const method = mr < 0.5 ? 'Cash' : mr < 0.75 ? 'MTN MoMo' : mr < 0.88 ? 'Airtel Money' : 'Credit';
        let paid = total, change = 0, custId = null;
        if (method === 'Cash') { paid = Math.ceil(total / 1000) * 1000; change = paid - total; }
        if (method === 'Credit') {
          paid = 0;
          const c = custs[Math.floor(rnd() * custs.length)];
          custId = c.id;
          c.owed += total;
          c.due = dayKey(new Date(dt.getTime() + 7 * 864e5));
        }
        const cidx = Math.floor(rnd() * cashiers.length);
        shop.seq += 1;
        db.sales.push({
          id: uid('s'), shopId: sh.id, day: dayKey(dt), ts: dt.toISOString(),
          receipt: shop.prefix + '-' + pad4(shop.seq),
          cashierId: cashiers.length ? cashiers[cidx].id : null,
          cashier: cashiers.length ? cashiers[cidx].name : shop.owner,
          items: items, subtotal: subtotal, discount: discount, total: total,
          method: method, paid: paid, change: change, customerId: custId
        });
      }
    }

    // guarantee customers who owe money (one overdue, one upcoming)
    custs.slice(0, 2).forEach(function (c, i) {
      if (c.owed <= 0) {
        const extra = 90000 + i * 60000;
        c.owed = extra;
        c.totalBought += extra;
      }
      if (!c.due) c.due = dayKey(shiftDay(i === 0 ? -3 : 5));
    });
    if (custs[0]) {
      const paidAmt = Math.min(25000, custs[0].owed);
      custs[0].owed -= paidAmt;
      db.debtPayments.push({ id: uid('dp'), shopId: sh.id, customerId: custs[0].id, day: dayKey(shiftDay(-2)), amount: paidAmt });
    }
  });

  db.broadcasts.push({
    id: uid('bc'), date: new Date(now.getTime() - 2 * 864e5).toISOString(),
    message: 'Welcome to ShopSmart! Wholesale prices now apply automatically when a customer buys 10 or more of an item. Karibu sana!'
  });
}
