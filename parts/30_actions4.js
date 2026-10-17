/* staff */
ACTIONS['add-cashier'] = () => openModal(cashierFormHTML(null));
ACTIONS['edit-staff'] = d => openModal(cashierFormHTML(DB.users.find(x => x.id === d.id)));
ACTIONS['create-staff'] = () => {
  const v = readStaffForm(true);
  if (!v) return;
  const sh = myShop();
  if (DB.users.some(u => u.email.toLowerCase() === v.email)) {
    document.getElementById('stf-error').textContent = 'That email is already used.';
    return;
  }
  DB.users.push({
    id: uid('u'), shopId: sh.id, name: v.name, phone: v.phone, email: v.email,
    password: v.pass, role: 'cashier', status: 'active'
  });
  persist(); closeModal(); render();
  toast('Cashier added. They can now login and sell.');
};
ACTIONS['save-staff'] = d => {
  const v = readStaffForm(false);
  if (!v) return;
  const u = DB.users.find(x => x.id === d.id);
  if (DB.users.some(x => x.id !== d.id && x.email.toLowerCase() === v.email)) {
    document.getElementById('stf-error').textContent = 'That email is already used.';
    return;
  }
  u.name = v.name; u.phone = v.phone; u.email = v.email;
  persist(); closeModal(); render();
  toast('Cashier updated.');
};
ACTIONS['staff-password'] = d => passwordModal(d.id);
ACTIONS['save-password'] = d => {
  const val = (document.getElementById('pw-new') || {}).value || '';
  const err = document.getElementById('pw-error');
  if (val.length < 6) { if (err) err.textContent = 'Password must be at least 6 characters.'; return; }
  const u = DB.users.find(x => x.id === d.id);
  u.password = val;
  persist(); closeModal();
  toast('Password changed for ' + u.name + '.');
};
ACTIONS['staff-toggle'] = d => {
  const u = DB.users.find(x => x.id === d.id);
  if (!u) return;
  if (u.id === S.user.id) { toast('You cannot stop your own account.', 'error'); return; }
  u.status = u.status === 'active' ? 'stopped' : 'active';
  persist(); render();
  toast(u.name + ' is now ' + u.status + '.', 'info');
};
ACTIONS['staff-delete'] = d => {
  const u = DB.users.find(x => x.id === d.id);
  if (!u) return;
  if (u.id === S.user.id) { toast('You cannot delete your own account.', 'error'); return; }
  confirmModal('Delete staff member?', 'Delete "' + u.name + '"? Their past sales stay in reports.', function () {
    DB.users = DB.users.filter(x => x.id !== d.id);
    persist(); render();
    toast('Staff member deleted.', 'info');
  });
};

/* settings */
ACTIONS['save-settings'] = (d, el, ev) => {
  ev.preventDefault();
  const sh = myShop();
  const v = id => document.getElementById(id).value.trim();
  const name = v('set-name');
  if (!name) { document.getElementById('set-error').textContent = 'Shop name is required.'; return; }
  sh.name = name;
  sh.phone = v('set-phone');
  sh.location = v('set-location');
  sh.tin = v('set-tin');
  sh.currency = document.getElementById('set-currency').value;
  sh.lowStockLevel = Math.max(1, Number(v('set-low')) || 10);
  sh.receiptMsg = document.getElementById('set-msg').value.trim() || 'Thank you for shopping with us!';
  sh.type = document.getElementById('set-type').value;
  persist(); render();
  toast('Settings saved.');
};
