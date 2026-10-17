/* ================= Global event dispatcher ================= */
const ACTIONS = {};
ACTIONS['nav'] = d => go(d.page);
ACTIONS['toggle-menu'] = () => { S.menu = !S.menu; render(); };
ACTIONS['logout'] = logout;
ACTIONS['login'] = doLogin;
ACTIONS['demo-fill'] = d => fillDemoLogin(d);
ACTIONS['set-login-role'] = d => setLoginRole(d.role);
ACTIONS['go-register'] = d => { if (d && d.plan) S.regPlan = d.plan; S.regError = ''; S.page = 'register'; render(); };
ACTIONS['go-home'] = () => { S.regError = ''; S.page = 'home'; render(); };
ACTIONS['scroll-login'] = () => {
  const el = document.getElementById('login-section');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => { const e2 = document.getElementById('login-email'); if (e2) e2.focus(); }, 350);
};
ACTIONS['register-submit'] = (d, el, ev) => { ev.preventDefault(); doRegister(); };
ACTIONS['close-modal'] = closeModal;
ACTIONS['modal-backdrop'] = (d, el, ev) => { if (ev.target === el) closeModal(); };
ACTIONS['modal-panel'] = () => { };
ACTIONS['confirm-yes'] = () => { const fn = S.confirmFn; S.confirmFn = null; closeModal(); if (fn) fn(); };

/* super admin */
ACTIONS['shop-toggle'] = d => {
  const sh = shopById(d.id);
  if (!sh) return;
  if (sh.status === 'suspended') {
    sh.status = sh.preStatus || 'active';
    sh.preStatus = null;
    persist(); render();
    toast('Shop started: ' + sh.name);
  } else {
    sh.preStatus = sh.status;
    sh.status = 'suspended';
    persist(); render();
    toast('Shop stopped: ' + sh.name, 'info');
  }
};
ACTIONS['broadcast-send'] = () => {
  const el = document.getElementById('broadcast-text');
  const msg = el ? el.value.trim() : '';
  if (!msg) { toast('Type a message first.', 'error'); return; }
  DB.broadcasts.push({ id: uid('bc'), date: new Date().toISOString(), message: msg });
  persist(); render();
  toast('Message sent to all shops.');
};

ACTIONS['super-view'] = d => superShopModal(d.id);
ACTIONS['sup-status'] = d => { S.supStatus = d.v; render(); };
ACTIONS['sup-health'] = d => { S.supHealth = d.v; render(); };

/* receipts */
ACTIONS['view-receipt'] = d => showReceipt(d.id);
ACTIONS['print-receipt'] = d => {
  const sale = DB.sales.find(s => s.id === d.id);
  if (sale) doPrint(receiptHTML(sale));
};
ACTIONS['print-sample-receipt'] = () => doPrint(receiptHTML(sampleReceipt(myShop())));

/* POS */
ACTIONS['add-to-cart'] = d => addToCart(d.id);
ACTIONS['cart-qty'] = d => changeQty(Number(d.i), Number(d.d));
ACTIONS['cart-remove'] = d => { S.cart.splice(Number(d.i), 1); refreshPOS(); };
ACTIONS['cart-clear'] = () => { S.cart = []; S.discount = 0; S.paid = ''; S.creditPaid = ''; refreshPOS(); toast('Cart cleared.', 'info'); };
ACTIONS['pos-type'] = d => { S.posType = d.t; refreshPOS(); };
ACTIONS['set-method'] = d => {
  S.method = d.m;
  if (d.m !== 'Cash') S.paid = '';
  if (d.m !== 'Credit') S.creditPaid = '';
  refreshPOS();
};
ACTIONS['complete-sale'] = completeSale;
ACTIONS['quick-customer'] = () => { openModal(customerFormHTML(null)); };
