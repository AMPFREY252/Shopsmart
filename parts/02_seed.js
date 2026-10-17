/* ================= Seed data (3 demo shops, users, products) ================= */
function mkRnd(seed) {
  let s = seed >>> 0;
  return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const CATALOG = [
  { n: 'Sugar 50kg', t: 'Food', b: 85000, r: 95000, w: 90000 },
  { n: 'Rice 25kg', t: 'Food', b: 78000, r: 88000, w: 83000 },
  { n: 'Cooking Oil 5L', t: 'Food', b: 42000, r: 48000, w: 45000 },
  { n: 'Maize Flour 10kg', t: 'Food', b: 17000, r: 21000, w: 19500 },
  { n: 'Beans 5kg', t: 'Food', b: 14000, r: 17000, w: 16000 },
  { n: 'Sugar 1kg', t: 'Food', b: 3500, r: 4500, w: 4000 },
  { n: 'Salt 1kg', t: 'Food', b: 1500, r: 2000, w: 1800 },
  { n: 'Milk Powder 500g', t: 'Food', b: 9500, r: 12000, w: 11000 },
  { n: 'Cooking Fat 1kg', t: 'Food', b: 7800, r: 9500, w: 8800 },
  { n: 'Tea Leaves 500g', t: 'Food', b: 6500, r: 8500, w: 7800 },
  { n: 'Bar Soap 2kg', t: 'Household', b: 12000, r: 15000, w: 14000 },
  { n: 'Washing Powder 1kg', t: 'Household', b: 6000, r: 8000, w: 7500 },
  { n: 'Toilet Paper (10 rolls)', t: 'Household', b: 12000, r: 15500, w: 14500 },
  { n: 'Paraffin 5L', t: 'Household', b: 15000, r: 18500, w: 17000 },
  { n: 'Phone Charger Type-C', t: 'Electronics', b: 6000, r: 10000, w: 8500 },
  { n: 'Flash Disk 16GB', t: 'Electronics', b: 13000, r: 18000, w: 16000 },
  { n: 'Bluetooth Speaker', t: 'Electronics', b: 35000, r: 50000, w: 45000 },
  { n: 'LED Bulb 9W', t: 'Electronics', b: 4000, r: 6500, w: 5500 },
  { n: 'Exercise Book', t: 'Stationery', b: 2500, r: 4000, w: 3500 },
  { n: 'A4 Paper (ream)', t: 'Stationery', b: 18000, r: 24000, w: 22000 }
];

function seedDB() {
  const rnd = mkRnd(884422);
  const now = new Date();
  const db = {
    shops: [], users: [], products: [], suppliers: [], purchases: [], customers: [],
    sales: [], expenses: [], debtPayments: [], broadcasts: [], openings: {}
  };
  db.users.push({ id: 'u_super', shopId: null, name: 'ShopSmart Owner', email: 'super@shopsmart.com', password: 'super123', role: 'super', phone: '0700000001', status: 'active' });

  const defs = [
    {
      id: 'sh_kabale', name: 'Kabale Best Supermarket', owner: 'John Mugisha', phone: '0772456781',
      email: 'admin@kabalebest.com', password: 'admin123', location: 'Kabale Town, Kabale', type: 'Both',
      plan: 'big', status: 'active', tin: '1008456781', prefix: 'KBS',
      msg: 'Thank you for shopping with Kabale Best Supermarket. Karibu tena!',
      cashiers: [['Alice Kamugisha', 'cashier@kabalebest.com'], ['Brian Tumusiime', 'brian@kabalebest.com']]
    },
    {
      id: 'sh_rushoroza', name: 'Rushoroza General Store', owner: 'Sarah Atuhaire', phone: '0772456782',
      email: 'admin@rushoroza.com', password: 'admin123', location: 'Rushoroza, Kabale', type: 'Retail',
      plan: 'small', status: 'trial', tin: '', prefix: 'RGS',
      msg: 'Thank you for shopping with Rushoroza General Store!',
      cashiers: [['Joan Ainebyona', 'cashier1@rushoroza.com'], ['David Okello', 'cashier2@rushoroza.com']]
    },
    {
      id: 'sh_kigezi', name: 'Kigezi Wholesale Centre', owner: 'Peter Twinomujuni', phone: '0772456783',
      email: 'admin@kigeziwholesale.com', password: 'admin123', location: 'Kigezi Ave, Mbarara', type: 'Wholesale',
      plan: 'branches', status: 'active', tin: '1008459999', prefix: 'KWC',
      msg: 'Asante for buying wholesale at Kigezi Wholesale Centre. Karibu tena!',
      cashiers: [['Peace Namutebi', 'cashier1@kigeziwholesale.com'], ['Samuel Mwesige', 'cashier2@kigeziwholesale.com']]
    }
  ];

  defs.forEach(function (sh, si) {
    const createdAt = new Date(now);
    createdAt.setDate(createdAt.getDate() - (sh.status === 'trial' ? 5 : 75));
    const shop = {
      id: sh.id, name: sh.name, owner: sh.owner, phone: sh.phone, email: sh.email, password: sh.password,
      location: sh.location, type: sh.type, plan: sh.plan, status: sh.status, preStatus: null,
      createdAt: createdAt.toISOString(), trialEndsAt: new Date(createdAt.getTime() + 14 * 864e5).toISOString(),
      logo: null, tin: sh.tin, receiptMsg: sh.msg, currency: 'UGX', lowStockLevel: 10,
      prefix: sh.prefix, seq: 60 + si * 17, ptypes: DEFAULT_PTYPES.slice()
    };
    db.shops.push(shop);
    db.users.push({ id: 'u_' + sh.id, shopId: sh.id, name: sh.owner, email: sh.email, password: sh.password, role: 'admin', phone: sh.phone, status: 'active' });
    sh.cashiers.forEach(function (c, ci) {
      db.users.push({
        id: 'u_' + sh.id + '_c' + ci, shopId: sh.id, name: c[0], email: c[1], password: 'cashier123',
        role: 'cashier', phone: '0772' + (2000000 + si * 100 + ci), status: 'active'
      });
    });

    CATALOG.forEach(function (p, i) {
      let stock = 5 + Math.floor(rnd() * 95);
      if (i % 6 === 2) stock = 3;
      if (i % 9 === 4) stock = 0;
      db.products.push({
        id: 'p_' + sh.id + '_' + i, shopId: sh.id, name: p.n, type: p.t,
        barcode: 'UG' + (8800000000000 + i * 137 + si * 7), buy: p.b, retail: p.r, wholesale: p.w, stock: stock
      });
    });
  });
  seedRest(db, defs, rnd, now);
  return db;
}
