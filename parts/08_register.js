/* ================= Register page ================= */
function pageRegister() {
  const planOpt = key => '<option value="' + key + '"' + (S.regPlan === key ? ' selected' : '') + '>' +
    esc(PLANS[key].name) + ' — ' + fmt(PLANS[key].price) + ' UGX/month</option>';
  const typeOpt = t => '<option value="' + t + '">' + t + '</option>';
  return '' +
    '<div class="min-h-screen bg-slate-100 flex flex-col">' +
    '<header class="bg-slate-900 text-white px-4 py-4">' +
    '<div class="max-w-3xl mx-auto flex items-center justify-between">' +
    '<div class="flex items-center gap-3">' +
    '<div class="w-9 h-9 rounded-xl bg-brand-600 grid place-items-center font-black">S</div>' +
    '<div class="font-extrabold">Shop<span class="text-brand-500">Smart</span></div></div>' +
    '<button class="btn bg-slate-800 hover:bg-slate-700 text-white text-sm" data-action="go-home">' + bi('arrow-left') + ' Back to home</button>' +
    '</div></header>' +
    '<main class="flex-1 max-w-3xl w-full mx-auto px-4 py-8">' +
    '<div class="card p-5 sm:p-7">' +
    '<h1 class="text-2xl font-black text-slate-800">Register Your Business</h1>' +
    '<p class="text-sm text-slate-500 mt-1">FREE for 14 days. You become the Business Admin of your shop.</p>' +
    (S.regError ? '<div class="mt-4 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">' + esc(S.regError) + '</div>' : '') +
    '<form class="mt-5 grid gap-4 sm:grid-cols-2" data-action="register-submit">' +
    '<div><label class="label">Shop Name *</label><input id="reg-shop" class="input" required placeholder="e.g. Kabale Best Supermarket"></div>' +
    '<div><label class="label">Owner Name *</label><input id="reg-owner" class="input" required placeholder="e.g. John Mugisha"></div>' +
    '<div><label class="label">Phone Number *</label><input id="reg-phone" class="input" required placeholder="0772 000 000"></div>' +
    '<div><label class="label">Email *</label><input id="reg-email" class="input" type="email" required placeholder="you@example.com"></div>' +
    '<div><label class="label">Password * (min 6 chars)</label><input id="reg-pass" class="input" type="password" required minlength="6" placeholder="••••••"></div>' +
    '<div><label class="label">Location *</label><input id="reg-location" class="input" required placeholder="e.g. Kabale Town, Kabale"></div>' +
    '<div><label class="label">Type of Shop *</label><select id="reg-type" class="input">' +
    ['Retail', 'Wholesale', 'Both'].map(t => '<option>' + t + '</option>').join('') + '</select></div>' +
    '<div><label class="label">Plan *</label><select id="reg-plan" class="input">' +
    planOpt('small') + planOpt('big') + planOpt('branches') + '</select></div>' +
    '<div class="sm:col-span-2 bg-brand-50 border border-brand-100 rounded-lg px-4 py-3 text-sm text-brand-800">' +
    'After registering you will be logged in as the <b>Business Admin</b> of your shop. You can add cashiers from the Staff page.</div>' +
    '<div class="sm:col-span-2 flex flex-wrap gap-3">' +
    '<button type="submit" class="btn-primary px-6">Create my shop</button>' +
    '<button type="button" class="btn-ghost" data-action="go-home">Cancel</button>' +
    '</div></form></div></main>' +
    '<footer class="bg-slate-900 text-slate-400 text-center text-xs py-4">Powered by ShopSmart</footer>' +
    '</div>';
}
function doRegister() {
  const v = id => (document.getElementById(id).value || '').trim();
  const shopName = v('reg-shop'), owner = v('reg-owner'), phone = v('reg-phone');
  const email = v('reg-email').toLowerCase(), pass = v('reg-pass');
  const location = v('reg-location'), type = v('reg-type'), plan = v('reg-plan');
  const fail = m => { S.regError = m; render(); };
  if (!shopName || !owner || !phone || !email || !pass || !location) return fail('Please fill in all required fields.');
  if (email.indexOf('@') < 1) return fail('Please enter a valid email address.');
  if (pass.length < 6) return fail('Password must be at least 6 characters.');
  if (DB.users.some(u => u.email.toLowerCase() === email)) return fail('That email is already registered. Try logging in.');

  const words = shopName.split(/\s+/);
  const prefix = words.slice(0, 3).map(w => w.charAt(0).toUpperCase()).join('') || 'SHOP';
  const shop = {
    id: uid('sh'), name: shopName, owner: owner, phone: phone, email: email, password: pass,
    location: location, type: type, plan: plan, status: 'trial', preStatus: null,
    createdAt: new Date().toISOString(), trialEndsAt: new Date(Date.now() + 14 * 864e5).toISOString(),
    logo: null, tin: '', receiptMsg: 'Thank you for shopping with us. Karibu tena!',
    currency: 'UGX', lowStockLevel: 10, prefix: prefix, seq: 0, ptypes: DEFAULT_PTYPES.slice()
  };
  const admin = {
    id: uid('u'), shopId: shop.id, name: owner, email: email, password: pass,
    role: 'admin', phone: phone, status: 'active'
  };
  DB.shops.push(shop);
  DB.users.push(admin);
  persist();
  S.regError = '';
  loginAs(admin);
  toast('Shop created! Your 14-day free trial has started.');
}
