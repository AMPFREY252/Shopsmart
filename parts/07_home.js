/* ================= Home / Login page ================= */
function demoLine(role, label, email, pass) {
  return '<button type="button" class="w-full flex items-center justify-between gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 hover:border-brand-500 hover:bg-brand-50 text-left" data-action="demo-fill" data-role="' + esc(role) + '" data-email="' + esc(email) + '" data-pass="' + esc(pass) + '">' +
    '<span class="font-bold text-slate-600">' + esc(label) + '</span>' +
    '<span class="text-slate-500 font-mono truncate">' + esc(email) + ' / ' + esc(pass) + '</span></button>';
}
function homePricing() {
  const priceCard = (key, features) => {
    const p = PLANS[key];
    return '<div class="card p-5 flex flex-col">' +
      '<div class="text-sm font-bold text-brand-700 uppercase tracking-wide">' + esc(p.name) + '</div>' +
      '<div class="mt-2"><span class="text-3xl font-black text-slate-800">' + fmt(p.price) + '</span>' +
      '<span class="text-sm text-slate-500 font-semibold"> UGX / month</span></div>' +
      '<ul class="mt-4 space-y-2 text-sm text-slate-600 flex-1">' +
      features.map(f => '<li class="flex gap-2">' + bi('check-lg', 'text-brand-600') + '<span>' + esc(f) + '</span></li>').join('') +
      '</ul>' +
      '<button class="btn-ghost w-full mt-5" data-action="go-register" data-plan="' + key + '">Choose ' + esc(p.name) + '</button></div>';
  };
  return '<section class="bg-slate-50 border-t border-slate-200">' +
    '<div class="max-w-6xl mx-auto px-4 py-12">' +
    '<h2 class="text-2xl font-black text-slate-800 text-center">Simple prices in UGX</h2>' +
    '<p class="text-sm text-slate-500 text-center mt-1">Every plan includes POS, stock, reports, receipts and the 14-day free trial.</p>' +
    '<div class="mt-7 grid gap-5 sm:grid-cols-3 max-w-4xl mx-auto">' +
    priceCard('small', ['1 shop, up to 2 cashiers', 'Products, sales & stock', 'Customer credit tracking']) +
    priceCard('big', ['1 shop, unlimited cashiers', 'Everything in Small Shop', 'Profit reports & suppliers']) +
    priceCard('branches', ['Many branches, one account', 'Everything in Big Shop', 'Priority support']) +
    '</div></div></section>' +
    '<footer class="bg-slate-900 text-slate-400 text-center text-xs py-6">' +
    'ShopSmart &middot; Sell Smart. Stock Smart. Grow Smart. &middot; Powered by ShopSmart</footer>' +
    '</div>';
}
function homeLoginSection() {
  const roleBtn = (role, label, sub) =>
    '<button class="flex-1 min-w-[150px] rounded-xl border-2 px-4 py-3 text-left transition-colors ' +
    (S.loginRole === role ? 'border-brand-600 bg-brand-50 shadow-sm' : 'border-slate-200 bg-white hover:border-brand-500') +
    '" data-action="set-login-role" data-role="' + role + '">' +
    '<div class="font-bold text-sm text-slate-800">' + esc(label) + '</div>' +
    '<div class="text-xs text-slate-500">' + esc(sub) + '</div></button>';
  return '<section id="login-section" class="max-w-6xl mx-auto px-4 py-10">' +
    '<h2 class="text-2xl font-black text-slate-800 text-center">Login</h2>' +
    '<p class="text-sm text-slate-500 text-center mt-1">Choose who you are, then enter your details.</p>' +
    '<div class="mt-5 flex flex-wrap gap-3 justify-center">' +
    roleBtn('super', 'Super Admin', 'Owner of ShopSmart') +
    roleBtn('admin', 'Business Admin', 'The shop owner') +
    roleBtn('cashier', 'Cashier', 'Worker in the shop') +
    '</div>' +
    '<div class="mt-5 card max-w-md mx-auto p-5">' +
    '<div id="login-error" class="text-xs font-semibold text-red-600">' + esc(S.loginError) + '</div>' +
    '<div class="mt-3"><label class="label">Email</label>' +
    '<input id="login-email" class="input" type="email" autocomplete="username" placeholder="you@example.com"></div>' +
    '<div class="mt-3"><label class="label">Password</label>' +
    '<input id="login-pass" class="input" type="password" autocomplete="current-password" placeholder="Your password"></div>' +
    '<button class="btn-primary w-full mt-4" data-action="login">Login</button>' +
    '<div class="mt-4 space-y-2">' +
    '<div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Tap a demo account to log in</div>' +
    demoLine('super', 'Super Admin', 'super@shopsmart.com', 'super123') +
    demoLine('admin', 'Business Admin', 'admin@kabalebest.com', 'admin123') +
    demoLine('cashier', 'Cashier', 'cashier@kabalebest.com', 'cashier123') +
    '</div></div></section>';
}
function pageHome() {
  return '' +
    '<div class="min-h-screen flex flex-col bg-white">' +
    '<header class="bg-slate-900 text-white">' +
    '<div class="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">' +
    '<div class="flex items-center gap-3">' +
    '<div class="w-10 h-10 rounded-xl bg-brand-600 grid place-items-center font-black text-lg">S</div>' +
    '<div><div class="font-extrabold text-lg leading-tight">Shop<span class="text-brand-500">Smart</span></div>' +
    '<div class="text-[11px] text-slate-400">Shop management system</div></div></div>' +
    '<button class="btn bg-brand-600 text-white hover:bg-brand-700 text-sm" data-action="go-register">Register Your Business</button>' +
    '</div></header>' +
    '<section class="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-800 text-white">' +
    '<div class="max-w-6xl mx-auto px-4 py-14 sm:py-20 text-center">' +
    '<div class="inline-block bg-brand-600/20 border border-brand-500/40 text-brand-100 text-xs font-bold px-3 py-1 rounded-full mb-5">FREE for 14 DAYS &middot; NO CARD NEEDED</div>' +
    '<h1 class="text-4xl sm:text-6xl font-black tracking-tight">ShopSmart</h1>' +
    '<p class="mt-4 text-lg sm:text-2xl font-semibold text-brand-100">Sell Smart. Stock Smart. Grow Smart.</p>' +
    '<p class="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">One simple system for your shop: point of sale, stock, suppliers, customers who owe you, expenses, staff and reports — works on phone and computer, even without internet.</p>' +
    '<div class="mt-7 flex flex-wrap gap-3 justify-center">' +
    '<button class="btn bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 text-base" data-action="go-register">Register Your Business - FREE for 14 Days</button>' +
    '<button class="btn bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 text-base" data-action="scroll-login">Login to your shop</button>' +
    '</div></div></section>' +
    homeLoginSection() +
    homePricing();
}
