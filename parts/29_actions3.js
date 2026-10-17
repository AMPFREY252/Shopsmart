/* customers */
ACTIONS['add-customer'] = () => openModal(customerFormHTML(null));
ACTIONS['edit-customer'] = d => openModal(customerFormHTML(DB.customers.find(x => x.id === d.id)));
ACTIONS['save-customer'] = d => {
  const v = readCustomerForm();
  if (!v) return;
  const c = DB.customers.find(x => x.id === d.id);
  const wasOwed = c.owed;
  Object.assign(c, v);
  if (wasOwed <= 0) c.owed = c.owed || 0;
  persist(); closeModal(); render();
  toast('Customer updated.');
};
ACTIONS['create-customer'] = () => {
  const v = readCustomerForm();
  if (!v) return;
  v.id = uid('cu'); v.shopId = myShop().id; v.totalBought = 0; v.owed = 0;
  DB.customers.push(v);
  persist(); closeModal(); render();
  toast('Customer added.');
};
ACTIONS['delete-customer'] = d => {
  const c = DB.customers.find(x => x.id === d.id);
  if (!c) return;
  if (c.owed > 0) { toast(c.name + ' still owes ' + fmt(c.owed) + '. Record the payment first.', 'error'); return; }
  confirmModal('Delete customer?', 'Remove "' + c.name + '"?', function () {
    DB.customers = DB.customers.filter(x => x.id !== d.id);
    persist(); render();
    toast('Customer deleted.', 'info');
  });
};
ACTIONS['record-payment'] = d => paymentModal(d.id);
ACTIONS['save-payment'] = d => {
  const c = DB.customers.find(x => x.id === d.id);
  const amt = Number((document.getElementById('pay-amount') || {}).value);
  const day = (document.getElementById('pay-date') || {}).value || dayKey();
  const err = document.getElementById('pay-error');
  if (!c) return;
  if (isNaN(amt) || amt <= 0) { if (err) err.textContent = 'Enter an amount greater than 0.'; return; }
  if (amt > c.owed) { if (err) err.textContent = 'Amount is more than what ' + c.name + ' owes (' + fmt(c.owed) + ').'; return; }
  c.owed -= amt;
  DB.debtPayments.push({ id: uid('dp'), shopId: c.shopId, customerId: c.id, day: day, amount: amt });
  persist(); closeModal(); render();
  toast('Payment of ' + fmt(amt) + ' recorded. Balance: ' + fmt(c.owed) + '.');
};

/* expenses */
ACTIONS['add-expense'] = () => {
  const cat = document.getElementById('ex-cat').value;
  const amount = Number(document.getElementById('ex-amount').value);
  const day = document.getElementById('ex-date').value || dayKey();
  const note = document.getElementById('ex-note').value.trim();
  const err = document.getElementById('ex-error');
  if (isNaN(amount) || amount <= 0) { if (err) err.textContent = 'Enter an amount greater than 0.'; return; }
  DB.expenses.push({ id: uid('ex'), shopId: myShop().id, day: day, cat: cat, amount: amount, note: note });
  persist(); render();
  toast(cat + ' expense of ' + fmt(amount) + ' added.');
};
ACTIONS['delete-expense'] = d => {
  confirmModal('Delete expense?', 'Remove this expense?', function () {
    DB.expenses = DB.expenses.filter(x => x.id !== d.id);
    persist(); render();
    toast('Expense deleted.', 'info');
  });
};
ACTIONS['save-opening'] = () => {
  const v = Number(document.getElementById('opening-input').value);
  if (isNaN(v) || v < 0) { toast('Enter a valid amount.', 'error'); return; }
  DB.openings[myShop().id + '|' + dayKey()] = v;
  persist(); render();
  toast('Opening cash saved.');
};

/* reports */
ACTIONS['rep-tab'] = d => { S.repTab = d.t; render(); };
ACTIONS['rep-print'] = () => {
  const d = repData();
  doPrint(reportPrintHTML(d.title, myShop(), d.headers, d.rows, d.footers));
};
ACTIONS['rep-pdf'] = () => {
  const d = repData();
  toast('Choose "Save as PDF" in the print dialog.', 'info');
  doPrint(reportPrintHTML(d.title, myShop(), d.headers, d.rows, d.footers));
};
ACTIONS['rep-excel'] = () => {
  const d = repData();
  const rows = d.rows.slice();
  if (d.csvFoot) rows.push(d.csvFoot);
  const csv = tableToCSV(d.headers, rows);
  const sh = myShop();
  const name = (sh ? sh.name.replace(/[^a-z0-9]+/gi, '_') : 'ShopSmart') + '_' + S.repTab + '_' + dayKey() + '.csv';
  downloadFile(name, csv, 'text/csv;charset=utf-8');
  toast('Excel file downloaded (CSV opens in Excel).');
};
