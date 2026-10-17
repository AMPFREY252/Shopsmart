/* ================= UI helpers: toast, modal, print ================= */
function toast(msg, kind) {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = 'rounded-lg px-4 py-3 text-sm font-semibold shadow-lg ' +
    (kind === 'error' ? 'bg-red-600 text-white' : kind === 'info' ? 'bg-slate-800 text-white' : 'bg-brand-600 text-white');
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
function openModal(html) {
  document.getElementById('modal-root').innerHTML =
    '<div class="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60" data-action="modal-backdrop">' +
    '<div class="w-full max-w-lg bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto scroll-thin" data-action="modal-panel">' +
    html + '</div></div>';
}
function closeModal() { document.getElementById('modal-root').innerHTML = ''; }
function confirmModal(title, msg, onYes, yesLabel) {
  S.confirmFn = onYes;
  openModal(
    '<div class="p-5"><h3 class="text-lg font-bold text-slate-800">' + esc(title) + '</h3>' +
    '<p class="text-sm text-slate-600 mt-2">' + esc(msg) + '</p></div>' +
    '<div class="flex justify-end gap-2 px-5 pb-5">' +
    '<button class="btn-ghost" data-action="close-modal">Cancel</button>' +
    '<button class="btn-danger" data-action="confirm-yes">' + esc(yesLabel || 'Yes, delete') + '</button></div>'
  );
}
function doPrint(html) {
  const pa = document.getElementById('print-area');
  pa.innerHTML = html;
  pa.style.display = 'block';
  window.print();
  setTimeout(function () { pa.style.display = 'none'; pa.innerHTML = ''; }, 400);
}
function downloadFile(name, content, mime) {
  const blob = new Blob(['\ufeff' + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function tableToCSV(headers, rows) {
  const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  return [headers.map(q).join(',')]
    .concat(rows.map(r => r.map(q).join(',')))
    .join('\r\n');
}
function reportPrintHTML(title, shop, headers, rows, footers) {
  let h = '<div style="font-family:Arial,sans-serif;color:#000;padding:16px">' +
    '<div style="text-align:center;border-bottom:2px solid #333;padding-bottom:8px;margin-bottom:12px">' +
    '<div style="font-size:20px;font-weight:bold">' + esc(shop ? shop.name : 'ShopSmart') + '</div>' +
    '<div style="font-size:12px">' + esc(shop ? (shop.location + (shop.phone ? ' | ' + shop.phone : '')) : 'Platform report') + '</div>' +
    '<div style="font-size:16px;font-weight:bold;margin-top:6px">' + esc(title) + '</div>' +
    '<div style="font-size:11px">Generated: ' + esc(new Date().toLocaleString('en-GB')) + '</div></div>' +
    '<table class="print-table"><thead><tr>';
  headers.forEach(hd => { h += '<th>' + esc(hd) + '</th>'; });
  h += '</tr></thead><tbody>';
  rows.forEach(r => {
    h += '<tr>';
    r.forEach(c => { h += '<td>' + esc(c) + '</td>'; });
    h += '</tr>';
  });
  h += '</tbody>';
  if (footers && footers.length) {
    h += '<tfoot><tr>';
    footers.forEach(f => { h += '<td style="font-weight:bold">' + esc(f) + '</td>'; });
    h += '</tr></tfoot>';
  }
  h += '</table><div style="text-align:center;font-size:10px;color:#666;margin-top:14px">Powered by ShopSmart</div></div>';
  return h;
}
