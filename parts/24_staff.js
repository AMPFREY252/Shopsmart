/* ================= Staff page ================= */
function pageStaff() {
  const sh = myShop();
  const staff = DB.users.filter(u => u.shopId === sh.id);
  const admin = staff.filter(u => u.role === 'admin');
  const cashiers = staff.filter(u => u.role === 'cashier');

  let h = '<div class="space-y-5">';
  h += '<div class="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 flex gap-3 items-start">' +
    '<span class="text-lg text-sky-600">' + bi('info-circle-fill') + '</span>' +
    '<div class="text-sm text-slate-700"><b>Explanation:</b> Cashier can only sell. He cannot see profit or settings. He can see buying prices, expenses, reports or settings. ' +
    'You (the Business Admin) see everything in your shop.</div></div>';

  h += '<div class="grid grid-cols-3 gap-3">' +
    '<div class="kpi"><div class="kpi-label">Total staff</div><div class="kpi-value">' + staff.length + '</div></div>' +
    '<div class="kpi"><div class="kpi-label">Admins</div><div class="kpi-value">' + admin.length + '</div></div>' +
    '<div class="kpi"><div class="kpi-label">Cashiers</div><div class="kpi-value text-brand-700">' + cashiers.length + '</div></div>' +
    '</div>';

  h += '<div class="card overflow-hidden"><div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">' +
    '<h2 class="font-bold text-slate-800">Staff</h2>' +
    '<button class="btn-primary btn-sm" data-action="add-cashier">' + bi('plus-lg') + ' Add cashier</button></div>' +
    '<div class="overflow-x-auto"><table class="w-full"><thead class="bg-slate-50"><tr>' +
    '<th class="th">Name</th><th class="th">Phone</th><th class="th">Email</th><th class="th">Role</th><th class="th">Status</th><th class="th text-right">Actions</th>' +
    '</tr></thead><tbody>';
  staff.forEach(function (u) {
    const isMe = u.id === S.user.id;
    const roleBadge = u.role === 'admin'
      ? '<span class="badge bg-slate-800 text-white">Business Admin</span>'
      : '<span class="badge bg-brand-100 text-brand-800">Cashier</span>';
    const statusBadge2 = u.status === 'active'
      ? '<span class="badge bg-green-100 text-green-700">Active</span>'
      : '<span class="badge bg-red-100 text-red-700">Stopped</span>';
    h += '<tr class="border-b border-slate-100">' +
      '<td class="td font-semibold text-slate-800">' + esc(u.name) + (isMe ? ' <span class="text-xs text-slate-400">(you)</span>' : '') + '</td>' +
      '<td class="td">' + esc(u.phone) + '</td>' +
      '<td class="td text-xs">' + esc(u.email) + '</td>' +
      '<td class="td">' + roleBadge + '</td>' +
      '<td class="td">' + statusBadge2 + '</td>' +
      '<td class="td text-right whitespace-nowrap space-x-1">';
    if (u.role === 'cashier') {
      h += '<button class="btn-ghost btn-sm" data-action="edit-staff" data-id="' + u.id + '">' + bi('pencil-fill') + ' Edit</button>' +
        '<button class="btn-ghost btn-sm" data-action="staff-password" data-id="' + u.id + '">' + bi('key-fill') + ' Password</button>' +
        '<button class="btn-ghost btn-sm" data-action="staff-toggle" data-id="' + u.id + '">' + (u.status === 'active' ? 'Stop' : 'Start') + '</button>' +
        '<button class="btn-danger btn-sm" data-action="staff-delete" data-id="' + u.id + '">' + bi('trash-fill') + ' Delete</button>';
    } else if (!isMe) {
      h += '<button class="btn-ghost btn-sm" data-action="staff-toggle" data-id="' + u.id + '">' + (u.status === 'active' ? 'Stop' : 'Start') + '</button>';
    } else {
      h += '<span class="text-xs text-slate-400">Owner</span>';
    }
    h += '</td></tr>';
  });
  h += '</tbody></table></div></div>';
  h += '</div>';
  return h;
}
