/* ================= Router / render ================= */
const HOME_TITLES = ['home', 'register'];
const ADMIN_PAGES = ['dashboard', 'analytics', 'pos', 'products', 'suppliers', 'customers', 'expenses', 'reports', 'staff', 'settings'];

function render() {
  const app = document.getElementById('app');
  if (!S.user) {
    app.innerHTML = S.page === 'register' ? pageRegister() : pageHome();
    afterRender();
    return;
  }
  // role guards
  if (S.user.role === 'super' && S.page !== 'super') S.page = 'super';
  if (S.user.role === 'cashier' && S.page !== 'pos') S.page = 'pos';
  if (S.user.role === 'admin' && S.page === 'super') S.page = 'dashboard';
  if (S.user.role === 'admin' && ADMIN_PAGES.indexOf(S.page) === -1) S.page = 'dashboard';

  let content = '';
  switch (S.page) {
    case 'super': content = pageSuper(); break;
    case 'dashboard': content = pageDashboard(); break;
    case 'analytics': content = pageAnalytics(); break;
    case 'pos': content = pagePOS(); break;
    case 'products': content = pageProducts(); break;
    case 'suppliers': content = pageSuppliers(); break;
    case 'customers': content = pageCustomers(); break;
    case 'expenses': content = pageExpenses(); break;
    case 'reports': content = pageReports(); break;
    case 'staff': content = pageStaff(); break;
    case 'settings': content = pageSettings(); break;
    default: content = pageDashboard();
  }
  app.innerHTML = shell(content);
  afterRender();
}
function afterRender() {
  const focusId = S.focusNext;
  S.focusNext = null;
  if (focusId) {
    const el = document.getElementById(focusId);
    if (el && el.focus) { el.focus(); if (el.setSelectionRange && el.value) el.setSelectionRange(el.value.length, el.value.length); }
  }
  const fill = S.demoFill;
  S.demoFill = null;
  if (fill) {
    const em = document.getElementById('login-email');
    const pw = document.getElementById('login-pass');
    if (em) em.value = fill.email || '';
    if (pw) pw.value = fill.pass || '';
    if (fill.auto) doLogin();
    else if (em) em.focus();
  }
}
function go(page) {
  S.page = page;
  S.menu = false;
  if (page === 'pos' && S.user && S.user.role !== 'admin') { /* keep cart */ }
  window.scrollTo(0, 0);
  render();
}
function loginAs(user) {
  S.user = user;
  try { localStorage.setItem(SESSION_KEY, user.id); } catch (e) { }
  S.page = user.role === 'super' ? 'super' : user.role === 'cashier' ? 'pos' : 'dashboard';
  S.cart = []; S.discount = 0; S.method = 'Cash'; S.paid = ''; S.creditCust = ''; S.creditPaid = '';
  render();
  toast('Welcome, ' + user.name + '!');
}
function logout() {
  S.user = null;
  try { localStorage.removeItem(SESSION_KEY); } catch (e) { }
  S.page = 'home';
  closeModal();
  render();
}
function doLogin() {
  loadDB();
  const email = (document.getElementById('login-email').value || '').trim().toLowerCase();
  const pass = document.getElementById('login-pass').value || '';
  const errEl = document.getElementById('login-error');
  const fail = function (msg) {
    S.loginError = msg;
    if (errEl) { errEl.textContent = msg; errEl.className = 'text-xs font-semibold text-red-600 mt-2'; }
    else toast(msg, 'error');
  };
  if (!email || !pass) return fail('Enter your email and password.');
  const matches = DB.users.filter(x => (x.email || '').toLowerCase() === email);
  if (!matches.length) {
    return fail('No ' + (S.loginRole === 'super' ? 'Super Admin' : S.loginRole === 'admin' ? 'Business Admin' : 'Cashier') + ' account with that email.');
  }
  let u = matches.find(x => x.password === pass && x.role === S.loginRole);
  if (!u) u = matches.find(x => x.password === pass);
  if (!u) return fail('Wrong password.');
  if (u.status !== 'active') return fail('This account has been stopped. Contact the shop owner.');
  if (u.shopId) {
    const sh = shopById(u.shopId);
    if (!sh) return fail('This account is not linked to a shop.');
    if (sh.status === 'suspended') return fail('This shop has been stopped by ShopSmart. Contact support.');
  }
  loginAs(u);
}
function fillDemoLogin(d) {
  S.loginRole = d.role || S.loginRole;
  S.loginError = '';
  S.demoFill = { email: d.email, pass: d.pass, auto: true };
  render();
}
function setLoginRole(role) {
  S.loginRole = role;
  S.loginError = '';
  if (role === 'super') S.demoFill = { email: 'super@shopsmart.com', pass: 'super123', auto: false };
  else if (role === 'admin') S.demoFill = { email: 'admin@kabalebest.com', pass: 'admin123', auto: false };
  else S.demoFill = { email: 'cashier@kabalebest.com', pass: 'cashier123', auto: false };
  render();
}
