/* ================= Core: state, helpers, storage ================= */
const DB_KEY = 'shopsmart_db_v1';
const SESSION_KEY = 'shopsmart_session_v1';
const PLANS = {
  small: { name: 'Small Shop', price: 50000 },
  big: { name: 'Big Shop', price: 100000 },
  branches: { name: 'Many Branches', price: 150000 }
};
const DEFAULT_PTYPES = ['Food', 'Electronics', 'Household', 'Stationery'];
const PTYPES = DEFAULT_PTYPES;
const METHODS = ['Cash', 'MTN MoMo', 'Airtel Money', 'Credit'];
const EXPENSE_CATS = ['Rent', 'Transport', 'Airtime', 'Salary', 'Water', 'Electricity', 'Other'];

let DB = null;
let S = {
  page: 'home', user: null, loginRole: 'admin', regPlan: 'small', menu: false,
  posQ: '', posType: 'All', cart: [], discount: 0, method: 'Cash', paid: '', creditCust: '', creditPaid: '',
  prodQ: '', prodType: 'All', lowOnly: false,
  repTab: 'sales', repFrom: '', repTo: '', lastSale: null, regError: '', loginError: '', an: null,
  supQ: '', supStatus: 'all', supHealth: 'all', supSort: 'sales7_desc'
};

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function fmt(n) {
  n = Number(n);
  if (!isFinite(n)) n = 0;
  return Math.round(n).toLocaleString('en-US');
}
function cur() { const sh = myShop(); return (sh && sh.currency) || 'UGX'; }
function ugx(n) { return cur() + ' ' + fmt(n); }
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function pad4(n) { return String(n).padStart(4, '0'); }
function dayKey(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function shiftDay(n) { const d = new Date(); d.setDate(d.getDate() + n); return d; }
function fmtDate(k) {
  if (!k) return '';
  const p = String(k).split('-');
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtShort(k) {
  if (!k) return '';
  const p = String(k).split('-');
  const d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}
function fmtTime(iso) {
  const d = new Date(iso);
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}
function sum(arr, fn) { let t = 0; for (let i = 0; i < arr.length; i++) t += fn ? fn(arr[i]) : arr[i]; return t; }
function myShop() { return (S.user && S.user.shopId) ? DB.shops.find(s => s.id === S.user.shopId) : null; }
function shopById(id) { return DB.shops.find(s => s.id === id); }
function productsOf(id) { return DB.products.filter(p => p.shopId === id); }
function customersOf(id) { return DB.customers.filter(c => c.shopId === id); }
function suppliersOf(id) { return DB.suppliers.filter(s => s.shopId === id); }
function expensesOf(id) { return DB.expenses.filter(e => e.shopId === id); }
function salesOf(id) { return DB.sales.filter(s => s.shopId === id); }
function salesOn(id, day) { return DB.sales.filter(s => s.shopId === id && s.day === day); }
function salesBetween(id, from, to) {
  return DB.sales.filter(s => s.shopId === id && (!from || s.day >= from) && (!to || s.day <= to));
}
function expensesOn(id, day) { return DB.expenses.filter(e => e.shopId === id && e.day === day); }
function saleCost(s) { return sum(s.items, i => i.buy * i.qty); }
function saleProfit(s) { return s.total - saleCost(s); }
function normTypeName(v) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().replace(/^[\s,;]+|[\s,;]+$/g, '').slice(0, 40);
}
function shopTypes(shopId) {
  const sh = shopId ? DB.shops.find(s => s.id === shopId) : myShop();
  const raw = sh && Array.isArray(sh.ptypes) && sh.ptypes.length ? sh.ptypes : DEFAULT_PTYPES;
  const seen = {}, out = [];
  raw.forEach(function (t) {
    const name = normTypeName(t);
    if (!name) return;
    const key = name.toLowerCase();
    if (seen[key]) return;
    seen[key] = true;
    out.push(name);
  });
  /* products may carry legacy/custom types — show those too so filters never hide stock */
  try {
    const sid = sh ? sh.id : (myShop() ? myShop().id : null);
    if (sid) productsOf(sid).forEach(function (p) {
      const name = normTypeName(p.type);
      if (!name) return;
      const key = name.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      out.push(name);
    });
  } catch (e) { }
  return out.length ? out : DEFAULT_PTYPES.slice();
}
function persist() {
  try { localStorage.setItem(DB_KEY, JSON.stringify(DB)); }
  catch (e) { console.warn('persist failed', e); }
}
function demoSuperUser() {
  return {
    id: 'u_super', shopId: null, name: 'ShopSmart Owner',
    email: 'super@shopsmart.com', password: 'super123',
    role: 'super', phone: '0700000001', status: 'active'
  };
}
function mergeSeedRows(key, fresh) {
  if (!Array.isArray(DB[key])) DB[key] = [];
  const have = {};
  DB[key].forEach(function (row) { if (row && row.id) have[row.id] = true; });
  fresh[key].forEach(function (row) {
    if (row && row.id && !have[row.id]) DB[key].push(row);
  });
}
function ensureDemoData() {
  if (!DB || !Array.isArray(DB.shops) || !Array.isArray(DB.users)) {
    DB = seedDB();
    persist();
    return;
  }
  ['products', 'suppliers', 'purchases', 'customers', 'sales', 'expenses', 'debtPayments', 'broadcasts'].forEach(function (k) {
    if (!Array.isArray(DB[k])) DB[k] = [];
  });
  if (!DB.openings || typeof DB.openings !== 'object') DB.openings = {};

  let changed = false;
  /* per-shop product types: backfill for shops created before this feature */
  DB.shops.forEach(function (sh) {
    if (!Array.isArray(sh.ptypes) || !sh.ptypes.length) {
      const fromProducts = [];
      const seen = {};
      (DB.products || []).forEach(function (p) {
        if (!p || p.shopId !== sh.id) return;
        const name = normTypeName(p.type);
        if (!name) return;
        const key = name.toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        fromProducts.push(name);
      });
      const base = DEFAULT_PTYPES.concat(fromProducts.filter(function (t) {
        return DEFAULT_PTYPES.map(function (x) { return x.toLowerCase(); }).indexOf(t.toLowerCase()) === -1;
      }));
      sh.ptypes = base;
      changed = true;
    } else {
      const cleaned = [];
      const seen = {};
      sh.ptypes.forEach(function (t) {
        const name = normTypeName(t);
        if (!name) return;
        const key = name.toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        cleaned.push(name);
      });
      if (!cleaned.length) cleaned.push.apply(cleaned, DEFAULT_PTYPES);
      if (cleaned.join('|') !== sh.ptypes.join('|')) { sh.ptypes = cleaned; changed = true; }
    }
  });
  const superEmail = 'super@shopsmart.com';
  let su = DB.users.find(function (u) {
    return (u.email || '').toLowerCase() === superEmail || u.role === 'super';
  });
  if (!su) {
    DB.users.unshift(demoSuperUser());
    changed = true;
  } else {
    if (su.email !== superEmail || su.password !== 'super123' || su.role !== 'super' || su.status !== 'active' || su.shopId) {
      su.email = superEmail;
      su.password = 'super123';
      su.role = 'super';
      su.status = 'active';
      su.shopId = null;
      if (!su.name) su.name = 'ShopSmart Owner';
      changed = true;
    }
  }

  if (!DB.shops.some(function (s) { return s.id === 'sh_kabale'; })) {
    const fresh = seedDB();
    mergeSeedRows('shops', fresh);
    fresh.users.forEach(function (u) {
      const email = (u.email || '').toLowerCase();
      const dup = DB.users.some(function (x) { return x.id === u.id || (x.email || '').toLowerCase() === email; });
      if (!dup) DB.users.push(u);
    });
    ['products', 'suppliers', 'purchases', 'customers', 'sales', 'expenses', 'debtPayments', 'broadcasts'].forEach(function (k) {
      mergeSeedRows(k, fresh);
    });
    Object.keys(fresh.openings).forEach(function (k) {
      if (DB.openings[k] == null) DB.openings[k] = fresh.openings[k];
    });
    changed = true;
  }
  if (changed) persist();
}
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(DB_KEY)); } catch (e) { DB = null; }
  if (!DB || !DB.shops || !DB.shops.length) { DB = seedDB(); persist(); }
  else ensureDemoData();
}
function last7(id) {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = shiftDay(-i), k = dayKey(d);
    out.push({ day: k, label: d.toLocaleDateString('en-GB', { weekday: 'short' }), total: sum(salesOn(id, k), s => s.total) });
  }
  return out;
}
function dashStats() {
  const sh = myShop(), k = dayKey();
  const t = salesOn(sh.id, k);
  const sales = sum(t, s => s.total);
  const cost = sum(t, saleCost);
  const exp = sum(expensesOn(sh.id, k), e => e.amount);
  const opening = DB.openings[sh.id + '|' + k] || 0;
  const low = productsOf(sh.id).filter(p => p.stock <= sh.lowStockLevel);
  const owed = sum(customersOf(sh.id), c => c.owed);
  /* cash actually collected today: card/mobile/cash totals + part-payments on credit − change, plus old-debt payments */
  const collected = sum(t, s => (Number(s.paid) || 0) - (Number(s.change) || 0));
  const debtIn = sum(DB.debtPayments.filter(p => p.shopId === sh.id && p.day === k), p => p.amount);
  return { sales, cost, exp, profit: sales - cost - exp, low, owed, cash: opening + collected + debtIn - exp, cashIn: collected + debtIn, opening, count: t.length };
}
function statusBadge(st) {
  if (st === 'active') return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700">Active</span>';
  if (st === 'trial') return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700">Trial</span>';
  return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">Stopped</span>';
}
function stockBadge(p, lowLevel) {
  if (p.stock <= 0) return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">Out</span>';
  if (p.stock <= lowLevel) return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-700">Low</span>';
  return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700">In stock</span>';
}
function payBadge(m) {
  if (m === 'Cash') return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700">Cash</span>';
  if (m === 'Credit') return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">Credit</span>';
  if (m === 'MTN MoMo') return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">MTN MoMo</span>';
  return '<span class="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700">Airtel</span>';
}
