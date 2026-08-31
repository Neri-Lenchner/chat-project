/* =========================================================
   קו — UI
   לוגיקה משותפת לכל המסכים: ולידציה, מצבי טעינה, דיאלוג,
   טוסט, פורמט תאריכים ובורר מצבי הדגמה.
   ========================================================= */

const $  = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

/* ---------- 1. משתמש מחובר (localStorage, סעיף 4 באפיון) ---------- */
const Session = {
  key: 'user',
  get() {
    try { return JSON.parse(localStorage.getItem(this.key)); }
    catch (e) { return null; }
  },
  set(user) { localStorage.setItem(this.key, JSON.stringify(user)); },
  clear() { localStorage.removeItem(this.key); },
  /* בפרוטוטייפ אין שרת — אם אין משתמש שמור מוצג משתמש הדגמה
     במקום להפנות למסך התחברות, כדי שאפשר יהיה לפתוח כל מסך ישירות. */
  ensure() {
    const saved = this.get();
    if (saved) return saved;
    return MOCK_USER;
  },
};

/* ---------- 2. פורמט תאריך ושעה (סעיף 7.2 באפיון) ---------- */
const pad = (n) => String(n).padStart(2, '0');

function formatTime(iso) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatDate(iso) {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
/* היום → שעה בלבד. אחרת → תאריך. */
function formatRoomStamp(iso) {
  const d = new Date(iso);
  return isSameDay(d, new Date()) ? formatTime(iso) : formatDate(iso);
}
function formatDayLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(d, today)) return 'היום';
  if (isSameDay(d, yesterday)) return 'אתמול';
  return formatDate(iso);
}

/* ---------- 3. מונוגרמות ---------- */
function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
}
function avatarTone(id) {
  return `avatar--${(Math.abs(Number(id) || 0) % 5) + 1}`;
}

/* ---------- 4. ולידציה ---------- */
const RULES = {
  required: {
    test: (v) => v.trim().length > 0,
    message: (label) => `יש למלא ${label}`,
  },
  name: {
    test: (v) => v.trim().length >= 2,
    message: (label) => `${label} צריך להכיל שתי אותיות לפחות`,
  },
  phone: {
    test: (v) => /^0(5\d|[2-4]|[8-9]|7\d)\d{7}$/.test(v.replace(/[\s-]/g, '')),
    message: () => 'מספר הטלפון לא תקין. הפורמט הנדרש: 0501234567',
  },
};

function setFieldError(field, message) {
  field.classList.add('is-invalid');
  const holder = $('.field__error-text', field);
  if (holder) holder.textContent = message;
  const input = $('.input', field);
  if (input) input.setAttribute('aria-invalid', 'true');
}

function clearFieldError(field) {
  field.classList.remove('is-invalid');
  const input = $('.input', field);
  if (input) input.removeAttribute('aria-invalid');
}

function validateField(field) {
  const input = $('.input', field);
  if (!input) return true;
  const label = field.dataset.label || '';
  const rules = (field.dataset.validate || '').split(/\s+/).filter(Boolean);
  for (const name of rules) {
    const rule = RULES[name];
    if (!rule) continue;
    if (!rule.test(input.value)) {
      setFieldError(field, rule.message(label));
      return false;
    }
  }
  clearFieldError(field);
  return true;
}

function validateForm(form) {
  const fields = $$('.field', form);
  let firstInvalid = null;
  fields.forEach((field) => {
    const ok = validateField(field);
    if (!ok && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) $('.input', firstInvalid)?.focus();
  return !firstInvalid;
}

/* ניקוי שגיאה תוך כדי הקלדה — אחרי שהמשתמש כבר נכשל פעם אחת */
function bindLiveValidation(form) {
  $$('.field', form).forEach((field) => {
    const input = $('.input', field);
    if (!input) return;
    input.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
    input.addEventListener('blur', () => {
      if (input.value.trim()) validateField(field);
    });
  });
}

/* ---------- 5. באנר שגיאה ---------- */
function showBanner(banner, title, text) {
  if (!banner) return;
  $('.banner__title', banner).textContent = title;
  const body = $('.banner__text', banner);
  if (body) body.textContent = text || '';
  banner.hidden = false;
}
function hideBanner(banner) { if (banner) banner.hidden = true; }

/* ---------- 6. מצב טעינה בכפתור ---------- */
function setLoading(btn, on, loadingLabel) {
  if (!btn) return;
  const label = $('.btn__label', btn);
  if (on) {
    btn.dataset.label = label ? label.textContent : '';
    if (label && loadingLabel) label.textContent = loadingLabel;
    btn.classList.add('is-loading');
    btn.setAttribute('aria-disabled', 'true');
  } else {
    if (label && btn.dataset.label) label.textContent = btn.dataset.label;
    btn.classList.remove('is-loading');
    btn.removeAttribute('aria-disabled');
  }
}

/* ---------- 7. טוסט ---------- */
function toast(message, variant) {
  let host = $('.toasts');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toasts';
    document.body.appendChild(host);
  }
  const el = document.createElement('div');
  el.className = 'toast' + (variant === 'error' ? ' toast--error' : '');
  el.innerHTML = `${iconMarkup(variant === 'error' ? 'alert' : 'check', 'icon--sm')}<span></span>`;
  $('span', el).textContent = message;
  host.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ---------- 8. דיאלוג ---------- */
let lastFocused = null;

function openDialog(scrim) {
  lastFocused = document.activeElement;
  scrim.hidden = false;
  const target = $('[data-autofocus]', scrim) || $('button, [href], input, select, textarea', scrim);
  target?.focus();
  document.addEventListener('keydown', onDialogKey);
}
function closeDialog(scrim) {
  scrim.hidden = true;
  document.removeEventListener('keydown', onDialogKey);
  lastFocused?.focus();
}
function onDialogKey(e) {
  if (e.key !== 'Escape') return;
  const open = $$('.scrim').find((s) => !s.hidden);
  if (open && open.dataset.dismissible !== 'false') closeDialog(open);
}
function bindDialogDismiss(scrim, onClose) {
  scrim.addEventListener('mousedown', (e) => {
    if (e.target === scrim) { closeDialog(scrim); onClose && onClose(); }
  });
}

/* ---------- 9. בורר מצבי הדגמה ---------- */
const Demo = {
  screen() { return document.body.dataset.screen || 'app'; },
  storeKey() { return `kav:demo:${this.screen()}`; },
  get() {
    const fromUrl = new URLSearchParams(location.search).get('state');
    if (fromUrl) sessionStorage.setItem(this.storeKey(), fromUrl);
    return sessionStorage.getItem(this.storeKey()) || 'ok';
  },
  is(value) { return this.get() === value; },
  set(value) {
    sessionStorage.setItem(this.storeKey(), value);
    const url = new URL(location.href);
    url.searchParams.delete('state');
    location.replace(url.toString());
  },
  mount(options) {
    if (!options || !options.length) return;
    const current = this.get();
    const el = document.createElement('div');
    el.className = 'demo';
    el.innerHTML = `
      <span class="demo__label">מצב</span>
      <select aria-label="בחירת מצב מסך להדגמה">
        ${options.map((o) => `<option value="${o.value}"${o.value === current ? ' selected' : ''}>${o.label}</option>`).join('')}
      </select>`;
    $('select', el).addEventListener('change', (e) => this.set(e.target.value));

    const slot = $('#demo-slot');
    if (slot) slot.appendChild(el);
    else { el.classList.add('demo--floating'); document.body.appendChild(el); }
  },
};

/* ---------- 10. סימולציית קריאת API ---------- */
/* ה-UI לא יודע שאין שרת: כל פעולה מחזירה Promise עם השהיה,
   ונכשלת כאשר בורר מצבי ההדגמה מבקש כישלון. */
function apiCall({ ms = 900, fail = false, error = 'אירעה שגיאה. נסה שוב.' } = {}) {
  return wait(ms).then(() => {
    if (fail) throw new Error(error);
    return true;
  });
}
