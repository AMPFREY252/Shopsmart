/* reports page render + export */
function repTableHTML(d) {
  let h = '<table class="w-full"><thead class="bg-slate-50"><tr>';
  d.headers.forEach((x, i) => { h += '<th class="th' + (i >= d.headers.length - 2 && S.repTab !== 'debt' && S.repTab !== 'supplier' && S.repTab !== 'stock' ? ' text-right' : '') + '">' + esc(x) + '</th>'; });
  h += '</tr></thead><tbody>';
  d.rows.forEach(function (r) {
    h += '<tr class="border-b border-slate-100">';
    r.forEach((c, i) => { h += '<td class="td' + (i > 0 && /^[\d,.\s−-]+$/.test(String(c)) ? ' text-right font-mono text-xs' : '') + '">' + esc(c) + '</td>'; });
    h += '</tr>';
  });
  if (!d.rows.length) h += '<tr><td class="td text-slate-400 text-center py-6" colspan="' + d.headers.length + '">No data for this report.</td></tr>';
  h += '</tbody><tfoot><tr class="bg-slate-800 text-white">';
  d.footers.forEach(c => { h += '<td class="px-3 py-2.5 text-sm font-bold">' + esc(c) + '</td>'; });
  h += '</tr></tfoot></table>';
  return h;
}
function pageReports() {
  const d = repData();
  const r = repRange();
  const showRange = S.repTab === 'sales' || S.repTab === 'profit';
  let h = '<div class="space-y-4">';
  h += '<div class="card p-3 flex flex-col lg:flex-row gap-3 lg:items-center">' +
    '<div class="flex gap-1.5 flex-wrap">' +
    REP_TABS.map(t => '<button class="btn btn-sm ' + (S.repTab === t.id ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200') +
      '" data-action="rep-tab" data-t="' + t.id + '">' + esc(t.label) + '</button>').join('') +
    '</div>';
  if (showRange) {
    h += '<div class="flex items-center gap-2 flex-wrap lg:ml-auto">' +
      '<label class="text-xs font-bold text-slate-500">From</label>' +
      '<input type="date" class="input py-1.5 w-auto" value="' + r.from + '" data-change="rep-from">' +
      '<label class="text-xs font-bold text-slate-500">To</label>' +
      '<input type="date" class="input py-1.5 w-auto" value="' + r.to + '" data-change="rep-to">' +
      '</div>';
  }
  h += '</div>';

  h += '<div class="card overflow-hidden"><div class="px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">' +
    '<div><h2 class="font-bold text-slate-800">' + esc(d.title) + '</h2>' +
    '<p class="text-xs text-slate-500">' + d.rows.length + ' row(s) &middot; ' + esc(cur()) + '</p></div>' +
    '<div class="flex gap-2 flex-wrap no-print">' +
    '<button class="btn-dark btn-sm" data-action="rep-print">' + bi('printer-fill') + ' Print</button>' +
    '<button class="btn-dark btn-sm" data-action="rep-pdf">' + bi('file-earmark-pdf-fill') + ' Download PDF</button>' +
    '<button class="btn-primary btn-sm" data-action="rep-excel">' + bi('file-earmark-excel-fill') + ' Excel</button>' +
    '</div></div>' +
    '<div class="overflow-x-auto"><div id="rep-table">' + repTableHTML(d) + '</div></div></div>';
  h += '</div>';
  return h;
}
