/* ================= Event wiring ================= */
function updatePurchaseBalance() {
  const el = document.getElementById('pu-balance');
  if (!el) return;
  const qty = Number((document.getElementById('pu-qty') || {}).value || 0);
  const unit = Number((document.getElementById('pu-unit') || {}).value || 0);
  const paid = Number((document.getElementById('pu-paid') || {}).value || 0);
  const bal = Math.max(0, (isNaN(qty) ? 0 : qty) * (isNaN(unit) ? 0 : unit) - (isNaN(paid) ? 0 : paid));
  el.textContent = fmt(bal) + ' ' + (myShop() ? myShop().currency : 'UGX');
}
function handleLogoFile(file) {
  if (!file) return;
  if (file.size > 700 * 1024) { toast('Image too big — please choose a smaller logo (under 700KB).', 'error'); return; }
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      /* downscale to 160px so LocalStorage stays small */
      const size = 160;
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      const ratio = Math.min(size / img.width, size / img.height);
      const w = img.width * ratio, h = img.height * ratio;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      myShop().logo = canvas.toDataURL('image/png');
      persist(); render();
      toast('Logo updated — it will print on your receipts.');
    };
    img.onerror = function () { toast('Could not read that image.', 'error'); };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

document.addEventListener('click', function (ev) {
  const target = ev.target;
  const el = target.closest('[data-action]');
  if (!el) return;
  // Ignore clicks on form controls (input/textarea/select) so typing in forms isn't hijacked by submit actions
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const name = el.getAttribute('data-action');
  const fn = ACTIONS[name];
  if (!fn) return;
  if (el.tagName === 'A') ev.preventDefault();
  const d = {};
  for (const a of el.attributes) {
    if (a.name.indexOf('data-') === 0 && a.name !== 'data-action') {
      d[a.name.slice(5).replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = a.value;
    }
  }
  fn(d, el, ev);
});

document.addEventListener('change', function (ev) {
  const el = ev.target;
  const name = el.getAttribute && el.getAttribute('data-change');
  if (!name) return;
  if (name === 'pos-search') { S.posQ = el.value; refreshPOS(); focusBack(el); }
  else if (name === 'prod-search') { S.prodQ = el.value; const t = document.getElementById('prod-table'); if (t) t.innerHTML = productsTableHTML(); focusBack(el); }
  else if (name === 'discount') { S.discount = Math.max(0, Number(el.value) || 0); refreshPOSKeepFocus('discount-input'); }
  else if (name === 'paid') { S.paid = el.value; refreshPOSKeepFocus('paid-input'); }
  else if (name === 'credit-paid') { S.creditPaid = el.value; refreshPOSKeepFocus('credit-paid-input'); }
  else if (name === 'credit-cust') { S.creditCust = el.value; refreshPOS(); }
  else if (name === 'pu-calc') { updatePurchaseBalance(); }
  else if (name === 'rep-from') { S.repFrom = el.value; render(); }
  else if (name === 'rep-to') { S.repTo = el.value; render(); }
  else if (name === 'an-from') { anState().from = el.value; anState().preset = 'custom'; anState().page = 1; render(); }
  else if (name === 'an-to') { anState().to = el.value; anState().preset = 'custom'; anState().page = 1; render(); }
  else if (name === 'an-cat') { anState().cat = el.value; anState().page = 1; render(); }
  else if (name === 'an-pay') { anState().pay = el.value; anState().page = 1; render(); }
  else if (name === 'an-sort') { anState().sort = el.value; anState().page = 1; render(); }
  else if (name === 'sup-sort') { S.supSort = el.value; render(); }
  else if (name === 'sup-search') { S.supQ = el.value; render(); }
  else if (name === 'logo-file') { handleLogoFile(el.files && el.files[0]); }
});
/* live search as you type (input event, keeps focus) */
document.addEventListener('input', function (ev) {
  const el = ev.target;
  const name = el.getAttribute && el.getAttribute('data-change');
  if (name === 'pos-search') { S.posQ = el.value; const g = document.getElementById('pos-grid'); if (g) g.innerHTML = posGridHTML(); }
  else if (name === 'prod-search') { S.prodQ = el.value; const t = document.getElementById('prod-table'); if (t) t.innerHTML = productsTableHTML(); }
  else if (name === 'sup-search') { S.supQ = el.value; const t2 = document.getElementById('sup-table'); if (t2) { render(); const again = document.querySelector('[data-change="sup-search"]'); if (again) { again.focus(); try { const v = again.value; again.setSelectionRange(v.length, v.length); } catch (e) { } } } }
  else if (name === 'an-q') { anState().q = el.value; anState().page = 1; const ae = document.activeElement; const pos = el.selectionStart; render(); const again = document.querySelector('[data-change="an-q"]'); if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) { } } }
  else if (name === 'pu-calc') { updatePurchaseBalance(); }
  else if (name === 'discount') {
    S.discount = Math.max(0, Number(el.value) || 0);
    const panel = document.getElementById('cart-panel');
    if (panel) {
      const pos = el.selectionStart;
      panel.innerHTML = cartPanelHTML();
      const again = document.getElementById('discount-input');
      if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) { } }
    }
  } else if (name === 'paid') {
    S.paid = el.value;
    const panel = document.getElementById('cart-panel');
    if (panel) {
      const pos = el.selectionStart;
      panel.innerHTML = cartPanelHTML();
      const again = document.getElementById('paid-input');
      if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) { } }
    }
  } else if (name === 'credit-paid') {
    S.creditPaid = el.value;
    const panel = document.getElementById('cart-panel');
    if (panel) {
      const pos = el.selectionStart;
      panel.innerHTML = cartPanelHTML();
      const again = document.getElementById('credit-paid-input');
      if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) { } }
    }
  }
});
function focusBack(el) {
  const id = el.id;
  setTimeout(function () {
    const again = document.getElementById(id);
    if (again) { again.focus(); const v = again.value; try { again.setSelectionRange(v.length, v.length); } catch (e) { } }
  }, 0);
}
function refreshPOSKeepFocus(inputId) {
  const panel = document.getElementById('cart-panel');
  if (!panel) return;
  const el = document.getElementById(inputId);
  const pos = el && el.selectionStart;
  panel.innerHTML = cartPanelHTML();
  const again = document.getElementById(inputId);
  if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (e) { } }
}
document.addEventListener('keydown', function (ev) {
  if (ev.key === 'Escape') closeModal();
  if (ev.key === 'Enter' && ev.target && ev.target.id === 'login-email') {
    ev.preventDefault();
    doLogin();
  }
});

/* ================= Boot ================= */
(function boot() {
  loadDB();
  try {
    const sid = localStorage.getItem(SESSION_KEY);
    if (sid) {
      const u = DB.users.find(x => x.id === sid);
      if (u && u.status === 'active') {
        S.user = u;
        S.page = u.role === 'super' ? 'super' : u.role === 'cashier' ? 'pos' : 'dashboard';
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  } catch (e) { }
  render();
})();
</script>
</body>
</html>
