/* ================= Layout / navigation ================= */
function navItems(role) {
  if (role === 'super') return [{ id: 'super', label: 'Overview', icon: 'clipboard-data-fill' }];
  if (role === 'cashier') return [{ id: 'pos', label: 'Selling (POS)', icon: 'cart-fill' }];
  return [
    { id: 'dashboard', label: 'Dashboard', icon: 'speedometer2' },
    { id: 'analytics', label: 'Analytics', icon: 'bar-chart-line-fill' },
    { id: 'pos', label: 'Selling (POS)', icon: 'cart-fill' },
    { id: 'products', label: 'Products', icon: 'box-seam-fill' },
    { id: 'suppliers', label: 'Suppliers & Purchases', icon: 'truck' },
    { id: 'customers', label: 'Customers & Credit', icon: 'people-fill' },
    { id: 'expenses', label: 'Expenses & Money', icon: 'cash-stack' },
    { id: 'reports', label: 'Reports', icon: 'file-earmark-bar-graph-fill' },
    { id: 'staff', label: 'Staff', icon: 'person-badge-fill' },
    { id: 'settings', label: 'Settings', icon: 'gear-fill' }
  ];
}
function pageTitle() {
  const m = navItems(S.user.role).find(n => n.id === S.page);
  return m ? m.label : 'ShopSmart';
}
function shell(content) {
  const u = S.user, sh = myShop();
  const nav = navItems(u.role);
  const roleLabel = u.role === 'super' ? 'Super Admin' : u.role === 'admin' ? 'Business Admin' : 'Cashier';
  let aside =
    '<aside class="fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transform transition-transform duration-200 lg:translate-x-0 ' +
    (S.menu ? 'translate-x-0' : '-translate-x-full') + '">' +
    '<div class="px-5 py-5 border-b border-slate-700 flex items-center gap-3">' +
    '<div class="w-9 h-9 rounded-xl bg-brand-600 grid place-items-center font-black text-white">S</div>' +
    '<div><div class="font-extrabold text-white leading-tight">Shop<span class="text-brand-500">Smart</span></div>' +
    '<div class="text-[11px] text-slate-400">Sell Smart. Stock Smart.</div></div></div>';
  if (sh) {
    aside += '<div class="px-5 py-3 border-b border-slate-700"><div class="text-[11px] uppercase tracking-wide text-slate-400 font-bold mb-1">Shop</div>' +
      '<div class="text-sm font-semibold text-white leading-snug">' + esc(sh.name) + '</div>' +
      '<div class="mt-1.5 text-[11px] text-slate-400">' + esc(PLANS[sh.plan].name) + ' plan &middot; ' +
      esc(sh.status === 'trial' ? 'Trial' : sh.status === 'active' ? 'Active' : 'Stopped') + '</div></div>';
  }
  aside += '<nav class="flex-1 overflow-y-auto scroll-thin px-3 py-3 space-y-1">';
  nav.forEach(function (n) {
    aside += '<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold cursor-pointer ' +
      (S.page === n.id ? 'bg-brand-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800 hover:text-white') +
      '" data-action="nav" data-page="' + n.id + '"><span class="nav-ic">' + bi(n.icon) + '</span>' + esc(n.label) + '</a>';
  });
  aside += '</nav>';
  aside += '<div class="px-4 py-4 border-t border-slate-700">' +
    '<div class="flex items-center gap-3 mb-3">' +
    '<div class="w-9 h-9 rounded-full bg-slate-700 grid place-items-center font-bold text-white text-sm">' + esc(u.name.charAt(0).toUpperCase()) + '</div>' +
    '<div class="min-w-0"><div class="text-sm font-bold text-white truncate">' + esc(u.name) + '</div>' +
    '<div class="text-[11px] text-slate-400">' + esc(roleLabel) + '</div></div></div>' +
    '<button class="w-full btn bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs" data-action="logout">' + bi('box-arrow-right') + ' Logout</button>' +
    '</div></aside>';
  if (S.menu) aside += '<div class="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" data-action="toggle-menu"></div>';

  return '<div class="min-h-screen lg:flex">' + aside +
    '<div class="flex-1 min-w-0 lg:ml-64">' +
    '<header class="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">' +
    '<button class="lg:hidden btn-ghost btn-sm px-2" data-action="toggle-menu" aria-label="Menu">' + bi('list') + '</button>' +
    '<h1 class="font-bold text-slate-800 text-base sm:text-lg">' + esc(pageTitle()) + '</h1>' +
    '<div class="ml-auto flex items-center gap-2">' +
    '<span class="hidden sm:inline text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">' + esc(roleLabel) + '</span>' +
    '<button class="btn-ghost btn-sm" data-action="logout">' + bi('box-arrow-right') + ' Logout</button>' +
    '</div></header>' +
    '<main class="p-4 lg:p-6 max-w-7xl mx-auto">' + content + '</main></div></div>';
}
