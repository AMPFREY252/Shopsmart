/* ================= Receipts (per-shop, printable) ================= */
function receiptHTML(sale, opts) {
  opts = opts || {};
  const sh = shopById(sale.shopId);
  const cust = sale.customerId ? DB.customers.find(c => c.id === sale.customerId) : null;
  let logo = '';
  if (sh.logo) {
    logo = '<img class="rc-logo" src="' + sh.logo + '" alt="logo">';
  } else {
    logo = '<div class="rc-logo">' + esc(sh.name.trim().charAt(0).toUpperCase()) + '</div>';
  }
  let h = '<div class="receipt-sheet">';
  h += logo;
  h += '<div class="rc-shop">' + esc(sh.name) + '</div>';
  h += '<div class="rc-meta">' + (sh.phone ? 'Tel: ' + esc(sh.phone) + '<br>' : '') +
    (sh.location ? esc(sh.location) + '<br>' : '') +
    (sh.tin ? 'TIN: ' + esc(sh.tin) : '') + '</div>';
  h += '<hr>';
  h += '<div style="text-align:center;font-weight:700;letter-spacing:1px">SALES RECEIPT</div>';
  h += '<table><tbody>' +
    '<tr><td>Receipt No:</td><td class="rc-right rc-bold">' + esc(sale.receipt) + '</td></tr>' +
    '<tr><td>Date:</td><td class="rc-right">' + esc(fmtDate(sale.day)) + '</td></tr>' +
    '<tr><td>Time:</td><td class="rc-right">' + esc(fmtTime(sale.ts)) + '</td></tr>' +
    '<tr><td>Cashier:</td><td class="rc-right">' + esc(sale.cashier) + '</td></tr>' +
    (cust ? '<tr><td>Customer:</td><td class="rc-right">' + esc(cust.name) + '</td></tr>' : '') +
    '</tbody></table>';
  h += '<hr>';
  h += '<table><thead><tr><th>Item</th><th class="rc-right">Qty</th><th class="rc-right">Price</th><th class="rc-right">Amount</th></tr></thead><tbody>';
  sale.items.forEach(function (it) {
    h += '<tr><td>' + esc(it.name) + '</td>' +
      '<td class="rc-right">' + it.qty + '</td>' +
      '<td class="rc-right">' + fmt(it.price) + '</td>' +
      '<td class="rc-right">' + fmt(it.price * it.qty) + '</td></tr>';
  });
  h += '</tbody></table>';
  h += '<hr>';
  h += '<table><tbody>' +
    '<tr><td>Subtotal</td><td class="rc-right">' + fmt(sale.subtotal) + '</td></tr>';
  if (sale.discount) {
    h += '<tr><td>Discount</td><td class="rc-right">−' + fmt(sale.discount) + '</td></tr>';
  }
  h += '<tr class="rc-bold"><td style="font-size:15px">TOTAL</td><td class="rc-right" style="font-size:15px">' + fmt(sale.total) + ' ' + esc(sh.currency) + '</td></tr>' +
    '<tr><td>Payment</td><td class="rc-right">' + esc(sale.method) + '</td></tr>' +
    '<tr><td>Amount paid</td><td class="rc-right">' + fmt(sale.paid) + '</td></tr>' +
    '<tr><td>Change</td><td class="rc-right">' + fmt(sale.change) + '</td></tr>' +
    (sale.method === 'Credit' ? '<tr class="rc-bold"><td>Balance (credit)</td><td class="rc-right">' + fmt(sale.balance != null ? sale.balance : (sale.total - (sale.paid || 0))) + '</td></tr>' : '') +
    '</tbody></table>';
  h += '<hr>';
  h += '<div class="rc-center" style="font-size:12px;padding:4px 0">' + esc(sh.receiptMsg || 'Thank you for shopping with us!') + '</div>';
  h += '<div class="rc-powered">Powered by ShopSmart</div>';
  h += '</div>';
  return h;
}
function showReceipt(saleId) {
  const sale = DB.sales.find(s => s.id === saleId);
  if (!sale) return;
  openModal(
    '<div class="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">' +
    '<div><h3 class="font-bold text-slate-800">Receipt ' + esc(sale.receipt) + '</h3>' +
    '<p class="text-xs text-slate-500">' + esc(fmtDate(sale.day) + ' ' + fmtTime(sale.ts)) + ' &middot; ' + esc(sale.cashier) + '</p></div>' +
    '<button class="text-slate-400 hover:text-slate-700 text-xl" data-action="close-modal" aria-label="Close">' + bi('x-lg') + '</button></div>' +
    '<div id="receipt-popup" class="p-4 bg-slate-100">' + receiptHTML(sale) + '</div>' +
    '<div class="flex flex-wrap justify-end gap-2 p-4 border-t border-slate-200 bg-white">' +
    '<button class="btn-ghost" data-action="close-modal">Close</button>' +
    '<button class="btn-dark" data-action="print-receipt" data-id="' + sale.id + '">' + bi('printer-fill') + ' Print receipt</button>' +
    '<button class="btn-primary" data-action="close-modal" id="receipt-done">Done</button>' +
    '</div>'
  );
}
