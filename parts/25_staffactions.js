/* ================= Staff actions ================= */
function cashierFormHTML(u) {
  return '<div class="p-5"><h3 class="text-lg font-bold text-slate-800">' + (u ? 'Edit cashier' : 'Add cashier') + '</h3>' +
    '<div class="grid gap-3 sm:grid-cols-2 mt-4">' +
    '<div class="sm:col-span-2"><label class="label">Full name *</label><input id="stf-name" class="input" value="' + esc(u ? u.name : '') + '" placeholder="e.g. Alice Kamugisha"></div>' +
    '<div><label class="label">Phone *</label><input id="stf-phone" class="input" value="' + esc(u ? u.phone : '') + '" placeholder="0772 000 000"></div>' +
    '<div><label class="label">Email *</label><input id="stf-email" type="email" class="input" value="' + esc(u ? u.email : '') + '" placeholder="worker@shop.com"></div>' +
    (u ? '' : '<div class="sm:col-span-2"><label class="label">Password * (min 6)</label><input id="stf-pass" type="text" class="input" placeholder="At least 6 characters"></div>') +
    '<div class="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600">' +
    'Cashier can only sell. He cannot see profit or settings.</div>' +
    '<div id="stf-error" class="sm:col-span-2 text-xs font-semibold text-red-600"></div>' +
    '</div></div>' +
    '<div class="flex justify-end gap-2 px-5 pb-5">' +
    '<button class="btn-ghost" data-action="close-modal">Cancel</button>' +
    '<button class="btn-primary" data-action="' + (u ? 'save-staff' : 'create-staff') + '"' + (u ? ' data-id="' + u.id + '"' : '') + '>Save</button></div>';
}
function readStaffForm(isNew) {
  const v = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const name = v('stf-name'), phone = v('stf-phone'), email = v('stf-email').toLowerCase();
  const pass = isNew ? v('stf-pass') : null;
  const err = document.getElementById('stf-error');
  const fail = m => { if (err) err.textContent = m; return null; };
  if (!name || !phone || !email) return fail('Name, phone and email are required.');
  if (email.indexOf('@') < 1) return fail('Enter a valid email address.');
  if (isNew && pass.length < 6) return fail('Password must be at least 6 characters.');
  return { name, phone, email, pass };
}
function passwordModal(uid2) {
  const u = DB.users.find(x => x.id === uid2);
  if (!u) return;
  openModal(
    '<div class="p-5"><h3 class="text-lg font-bold text-slate-800">Change password</h3>' +
    '<p class="text-sm text-slate-500 mt-1">' + esc(u.name) + ' (' + esc(u.email) + ')</p>' +
    '<label class="label mt-4">New password * (min 6)</label>' +
    '<input id="pw-new" type="text" class="input" placeholder="New password">' +
    '<div id="pw-error" class="text-xs font-semibold text-red-600 mt-2"></div></div>' +
    '<div class="flex justify-end gap-2 px-5 pb-5">' +
    '<button class="btn-ghost" data-action="close-modal">Cancel</button>' +
    '<button class="btn-primary" data-action="save-password" data-id="' + u.id + '">Change password</button></div>'
  );
}
