/* =========================================================
   קו — Screens logic
   כל מסך מזוהה לפי body[data-screen] ומקבל את ההתנהגות שלו.
   השכבה הזו מדמה את מה שיהיה ב-Redux + axios במימוש האמיתי.
   ========================================================= */

/* ---------- Store מקומי (מדמה RoomStore / MessageStore) ---------- */
const Store = {
  addedKey: 'kav:rooms',
  removedKey: 'kav:removed',
  msgKey: (id) => `kav:msgs:${id}`,

  read(key, fallback) {
    try { return JSON.parse(sessionStorage.getItem(key)) || fallback; }
    catch (e) { return fallback; }
  },

  rooms() {
    const added = this.read(this.addedKey, []);
    const removed = this.read(this.removedKey, []);
    return [...added, ...MOCK_ROOMS]
      .filter((r) => !removed.includes(r.id))
      .map((r) => ({ ...r, ...this.overlay(r) }))
      .sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));
  },

  overlay(room) {
    const msgs = this.read(this.msgKey(room.id), []);
    if (!msgs.length) return {};
    const last = msgs[msgs.length - 1];
    return { lastMessage: last.content, lastAt: last.at, unread: 0 };
  },

  room(id) { return this.rooms().find((r) => r.id === Number(id)); },

  addRoom(room) {
    const added = this.read(this.addedKey, []);
    added.unshift(room);
    sessionStorage.setItem(this.addedKey, JSON.stringify(added));
  },

  removeRoom(id) {
    const removed = this.read(this.removedKey, []);
    removed.push(Number(id));
    sessionStorage.setItem(this.removedKey, JSON.stringify(removed));
    sessionStorage.removeItem(this.msgKey(id));
  },

  messages(id) {
    return [...(MOCK_MESSAGES[id] || []), ...this.read(this.msgKey(id), [])];
  },

  addMessage(id, message) {
    const list = this.read(this.msgKey(id), []);
    list.push(message);
    sessionStorage.setItem(this.msgKey(id), JSON.stringify(list));
  },
};

/* ---------- תפריט משתמש בסרגל העליון ---------- */
function initTopbar() {
  const user = Session.ensure();
  const chip = $('#user-menu-trigger');
  if (!chip) return;

  $$('[data-user-name]').forEach((el) => { el.textContent = `${user.firstName} ${user.lastName}`; });
  $$('[data-user-phone]').forEach((el) => { el.textContent = user.phone; });
  $$('[data-user-initials]').forEach((el) => { el.textContent = initials(`${user.firstName} ${user.lastName}`); });

  const panel = $('#user-menu-panel');
  const close = () => { panel.hidden = true; chip.setAttribute('aria-expanded', 'false'); };

  chip.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = panel.hidden;
    panel.hidden = !open;
    chip.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  $('#logout')?.addEventListener('click', () => {
    Session.clear();
    sessionStorage.clear();
    location.href = 'login.html';
  });
}

/* ---------- רשימת שיחות ---------- */
function roomMarkup(room, activeId) {
  const active = String(room.id) === String(activeId);
  const stamp = room.lastAt ? formatRoomStamp(room.lastAt) : '';
  const last = room.lastMessage || 'עדיין אין הודעות בשיחה';
  return `
    <li>
      <div class="room" role="button" tabindex="0" data-room="${room.id}" aria-current="${active}">
        <span class="avatar ${avatarTone(room.otherUserId)}">${initials(room.name)}</span>
        <span class="room__main">
          <span class="room__name u-truncate">${room.name}</span>
          <span class="room__last u-truncate${room.lastMessage ? '' : ' u-faint'}">${last}</span>
        </span>
        <span class="room__meta">
          <span class="room__time">${stamp}</span>
          ${room.unread ? `<span class="badge">${room.unread}</span>` :
            `<button class="btn btn--icon room__delete" data-delete="${room.id}" aria-label="מחיקת השיחה עם ${room.name}"><span data-icon="trash" data-icon-size="sm"></span></button>`}
        </span>
      </div>
    </li>`;
}

function renderRooms(listEl, rooms, activeId) {
  listEl.innerHTML = rooms.map((r) => roomMarkup(r, activeId)).join('');
  mountIcons(listEl);
}

function renderRoomSkeleton(listEl, count) {
  listEl.innerHTML = Array.from({ length: count }, () => `
    <li class="room-skeleton">
      <span class="skeleton room-skeleton__avatar"></span>
      <span>
        <span class="skeleton room-skeleton__line" style="display:block;width:70%"></span>
        <span class="skeleton room-skeleton__line" style="display:block"></span>
      </span>
    </li>`).join('');
}

/* לחיצה ארוכה על שיחה → דיאלוג מחיקה (סעיף 8 באפיון).
   בנוסף כפתור מחיקה גלוי ב-hover, כי במסך גדול אין "לחיצה ארוכה" טבעית. */
function bindRoomInteractions(listEl, { onOpen, onDeleteRequest }) {
  let timer = null;
  let longPressed = false;

  const start = (item) => {
    longPressed = false;
    item.classList.add('is-pressing');
    timer = setTimeout(() => {
      longPressed = true;
      item.classList.remove('is-pressing');
      onDeleteRequest(Number(item.dataset.room));
    }, 550);
  };
  const stop = (item) => {
    clearTimeout(timer);
    item?.classList.remove('is-pressing');
  };

  listEl.addEventListener('pointerdown', (e) => {
    const item = e.target.closest('.room');
    if (!item || e.target.closest('[data-delete]')) return;
    start(item);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => {
    listEl.addEventListener(evt, (e) => stop(e.target.closest('.room')));
  });
  listEl.addEventListener('scroll', () => stop(null), true);

  listEl.addEventListener('click', (e) => {
    const del = e.target.closest('[data-delete]');
    if (del) { onDeleteRequest(Number(del.dataset.delete)); return; }
    const item = e.target.closest('.room');
    if (!item || longPressed) { longPressed = false; return; }
    onOpen(Number(item.dataset.room));
  });

  listEl.addEventListener('contextmenu', (e) => {
    const item = e.target.closest('.room');
    if (!item) return;
    e.preventDefault();
    onDeleteRequest(Number(item.dataset.room));
  });

  listEl.addEventListener('keydown', (e) => {
    const item = e.target.closest('.room');
    if (!item) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(Number(item.dataset.room)); }
    if (e.key === 'Delete') { e.preventDefault(); onDeleteRequest(Number(item.dataset.room)); }
  });
}

/* ---------- דיאלוג מחיקה ---------- */
function initDeleteDialog(onDeleted) {
  const scrim = $('#delete-dialog');
  if (!scrim) return { open() {} };
  const nameEl = $('[data-delete-name]', scrim);
  const banner = $('.banner', scrim);
  const confirmBtn = $('#delete-confirm');
  const cancelBtn = $('#delete-cancel');
  let current = null;

  const close = () => { closeDialog(scrim); hideBanner(banner); setLoading(confirmBtn, false); };

  bindDialogDismiss(scrim, () => hideBanner(banner));
  cancelBtn.addEventListener('click', close);

  confirmBtn.addEventListener('click', async () => {
    hideBanner(banner);
    setLoading(confirmBtn, true, 'מוחק…');
    try {
      await apiCall({ ms: 800, fail: Demo.is('delete-error') });
      Store.removeRoom(current.id);
      close();
      onDeleted(current);
    } catch (err) {
      setLoading(confirmBtn, false);
      showBanner(banner, 'לא ניתן למחוק את השיחה', 'השיחה נשארה ברשימה. אפשר לנסות שוב.');
    }
  });

  return {
    open(room) {
      current = room;
      nameEl.textContent = room.name;
      hideBanner(banner);
      openDialog(scrim);
    },
  };
}

/* =========================================================
   מסך הרשמה
   ========================================================= */
function initRegister() {
  Demo.mount([
    { value: 'ok', label: 'תקין' },
    { value: 'server-error', label: 'שגיאת שרת' },
  ]);

  const form = $('#register-form');
  const banner = $('#form-banner');
  const submit = $('#register-submit');
  bindLiveValidation(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideBanner(banner);
    if (!validateForm(form)) return;

    setLoading(submit, true, 'נרשם…');
    try {
      await apiCall({ ms: 1100, fail: Demo.is('server-error') });
      Session.set({
        id: 1,
        firstName: $('#firstName').value.trim(),
        lastName: $('#lastName').value.trim(),
        phone: $('#phone').value.replace(/[\s-]/g, ''),
      });
      location.href = 'home.html';
    } catch (err) {
      setLoading(submit, false);
      showBanner(banner, 'ההרשמה לא הושלמה', 'לא הצלחנו ליצור את החשבון. בדוק את הפרטים ונסה שוב.');
    }
  });
}

/* =========================================================
   מסך התחברות
   ========================================================= */
function initLogin() {
  Demo.mount([
    { value: 'ok', label: 'תקין' },
    { value: 'server-error', label: 'מספר לא מוכר' },
  ]);

  const form = $('#login-form');
  const banner = $('#form-banner');
  const submit = $('#login-submit');
  bindLiveValidation(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideBanner(banner);
    if (!validateForm(form)) return;

    setLoading(submit, true, 'מתחבר…');
    try {
      await apiCall({ ms: 1000, fail: Demo.is('server-error') });
      Session.set({ ...MOCK_USER, phone: $('#phone').value.replace(/[\s-]/g, '') });
      location.href = 'home.html';
    } catch (err) {
      setLoading(submit, false);
      showBanner(banner, 'לא ניתן להתחבר', 'המספר הזה לא רשום אצלנו. בדוק אותו או צור חשבון חדש.');
    }
  });
}

/* =========================================================
   מסך ראשי — רשימת שיחות
   ========================================================= */
function initHome() {
  Demo.mount([
    { value: 'ok', label: 'תקין' },
    { value: 'loading', label: 'טעינה' },
    { value: 'empty', label: 'אין שיחות' },
    { value: 'load-error', label: 'שגיאת טעינה' },
    { value: 'delete-error', label: 'שגיאת מחיקה' },
  ]);

  initTopbar();
  const list = $('#room-list');
  const banner = $('#rail-banner');
  const empty = $('#rail-empty');
  const count = $('#room-count');
  const dialog = initDeleteDialog((room) => {
    toast(`השיחה עם ${room.name} נמחקה`);
    load(true);
  });

  bindRoomInteractions(list, {
    onOpen: (id) => { location.href = `chat.html?room=${id}`; },
    onDeleteRequest: (id) => {
      const room = Store.room(id);
      if (room) dialog.open(room);
    },
  });

  async function load(skipLoading) {
    hideBanner(banner);
    empty.hidden = true;

    if (Demo.is('loading')) { renderRoomSkeleton(list, 6); count.textContent = ''; return; }
    if (!skipLoading) {
      renderRoomSkeleton(list, 6);
      count.textContent = '';
      try { await apiCall({ ms: 700, fail: Demo.is('load-error') }); }
      catch (err) {
        list.innerHTML = '';
        count.textContent = '';
        showBanner(banner, 'לא ניתן לטעון את השיחות', 'בדוק את החיבור ונסה שוב.');
        return;
      }
    }

    const rooms = Demo.is('empty') ? [] : Store.rooms();
    count.textContent = rooms.length ? `${rooms.length} שיחות` : '';
    if (!rooms.length) { list.innerHTML = ''; empty.hidden = false; return; }
    renderRooms(list, rooms, null);
  }

  $('#retry-rooms')?.addEventListener('click', () => load(false));
  load(false);
}

/* =========================================================
   מסך שיחה חדשה — רשימת אנשי קשר מקומית
   ========================================================= */
function initNewChat() {
  Demo.mount([
    { value: 'ok', label: 'תקין' },
    { value: 'create-error', label: 'שגיאה ביצירה' },
  ]);

  initTopbar();
  const list = $('#room-list');
  renderRooms(list, Store.rooms(), null);
  list.addEventListener('click', (e) => {
    const item = e.target.closest('.room');
    if (item) location.href = `chat.html?room=${item.dataset.room}`;
  });

  const scrim = $('#new-chat-dialog');
  const banner = $('.banner', scrim);
  const contactsEl = $('#contacts');
  const back = () => { location.href = 'home.html'; };

  contactsEl.innerHTML = MOCK_CONTACTS.map((c) => `
    <li>
      <button class="contact" data-contact="${c.id}" data-name="${c.name}">
        <span class="avatar avatar--sm ${avatarTone(c.id)}">${initials(c.name)}</span>
        <span class="contact__name u-truncate">${c.name}</span>
        <span class="contact__hint">פתיחת שיחה</span>
      </button>
    </li>`).join('');

  contactsEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-contact]');
    if (!btn) return;
    hideBanner(banner);
    btn.classList.add('is-busy');
    const hint = $('.contact__hint', btn);
    hint.textContent = 'יוצר שיחה…';
    hint.style.opacity = 1;

    try {
      await apiCall({ ms: 900, fail: Demo.is('create-error') });
      const room = {
        id: Date.now(),
        otherUserId: Number(btn.dataset.contact),
        name: btn.dataset.name,
        lastMessage: '',
        lastAt: new Date().toISOString(),
        unread: 0,
      };
      Store.addRoom(room);
      location.href = `chat.html?room=${room.id}`;
    } catch (err) {
      btn.classList.remove('is-busy');
      hint.textContent = 'פתיחת שיחה';
      hint.style.opacity = '';
      showBanner(banner, 'לא ניתן ליצור את השיחה', 'הרשימה נשארה כמו שהיא. אפשר לנסות שוב.');
    }
  });

  $('#new-chat-cancel').addEventListener('click', back);
  bindDialogDismiss(scrim, back);
  openDialog(scrim);
}

/* =========================================================
   מסך שיחה
   ========================================================= */
function initChat() {
  Demo.mount([
    { value: 'ok', label: 'תקין' },
    { value: 'loading', label: 'טעינת הודעות' },
    { value: 'load-error', label: 'שגיאת טעינה' },
    { value: 'send-error', label: 'כישלון בשליחה' },
  ]);

  initTopbar();

  const rooms = Store.rooms();
  const requested = Number(new URLSearchParams(location.search).get('room'));
  const room = Store.room(requested) || rooms[0];

  const list = $('#room-list');
  const thread = $('#thread');
  const inner = $('#thread-inner');
  const composer = $('#composer');
  const input = $('#message-input');
  const sendBtn = $('#send');
  const banner = $('#thread-banner');

  if (!room) { location.href = 'home.html'; return; }

  /* עמודת השיחות נשארת גלויה — אותה מעטפת, שיחה פעילה מסומנת */
  renderRooms(list, rooms, room.id);
  const dialog = initDeleteDialog((deleted) => {
    toast(`השיחה עם ${deleted.name} נמחקה`);
    location.href = 'home.html';
  });
  bindRoomInteractions(list, {
    onOpen: (id) => { location.href = `chat.html?room=${id}`; },
    onDeleteRequest: (id) => { const r = Store.room(id); if (r) dialog.open(r); },
  });

  $('#room-count').textContent = rooms.length ? `${rooms.length} שיחות` : '';
  $('[data-room-name]').textContent = room.name;
  $('[data-room-initials]').textContent = initials(room.name);
  $('[data-room-avatar]').classList.add(avatarTone(room.otherUserId));
  input.placeholder = `הודעה אל ${room.name}`;
  $('#delete-current')?.addEventListener('click', () => dialog.open(room));

  let messages = [];

  function messageMarkup(msg) {
    const state = msg.state ? ` msg--${msg.state}` : '';
    const time = msg.state === 'pending' ? '···' : formatTime(msg.at);
    return `
      <div class="msg ${msg.mine ? 'msg--out' : 'msg--in'}${state}" data-msg="${msg.id}">
        <div class="msg__body">
          <div>
            <div class="bubble">${escapeHtml(msg.content)}</div>
            ${msg.state === 'failed' ? '<button class="msg__retry" data-retry="' + msg.id + '">לא נשלח · שליחה חוזרת</button>' : ''}
          </div>
        </div>
        <div class="msg__time u-num">${time}</div>
      </div>`;
  }

  function render() {
    /* השיחה נטענת במלואה, ולכן יש לה התחלה מסומנת על פס הזמן */
    let html = '<div class="day day--start"><span class="day__label">תחילת השיחה</span><span class="day__cap"></span></div>';
    let lastDay = null;
    messages.forEach((msg) => {
      const day = new Date(msg.at).toDateString();
      if (day !== lastDay) {
        lastDay = day;
        html += `<div class="day"><span class="day__label">${formatDayLabel(msg.at)}</span><span class="day__cap"></span></div>`;
      }
      html += messageMarkup(msg);
    });
    inner.innerHTML = html;
    scrollToEnd();
  }

  function updateHeadMeta() {
    const meta = $('.chat-head__meta');
    if (!meta) return;
    const last = messages[messages.length - 1];
    meta.textContent = last ? `פעילות אחרונה ${formatRoomStamp(last.at)}` : 'אין עדיין הודעות';
  }

  function scrollToEnd() {
    requestAnimationFrame(() => { thread.scrollTop = thread.scrollHeight; });
  }

  function renderSkeleton() {
    inner.innerHTML = `
      <div class="thread-skeleton">
        <span class="skeleton thread-skeleton__bubble"></span>
        <span class="skeleton thread-skeleton__bubble thread-skeleton__bubble--out"></span>
        <span class="skeleton thread-skeleton__bubble" style="width:38%"></span>
        <span class="skeleton thread-skeleton__bubble thread-skeleton__bubble--out" style="width:52%"></span>
      </div>`;
  }

  async function load() {
    hideBanner(banner);
    if (Demo.is('loading')) { renderSkeleton(); return; }
    renderSkeleton();
    try {
      await apiCall({ ms: 600, fail: Demo.is('load-error') });
      messages = Store.messages(room.id);
      updateHeadMeta();
      if (!messages.length) {
        inner.innerHTML = `
          <div class="empty">
            <span class="empty__mark">${iconMarkup('chat', 'icon--lg')}</span>
            <h2 class="empty__title">השיחה עם ${room.name} ריקה</h2>
            <p class="empty__text">ההודעה הראשונה שתשלח תופיע כאן.</p>
          </div>`;
        return;
      }
      render();
    } catch (err) {
      inner.innerHTML = '';
      showBanner(banner, 'לא ניתן לטעון את ההודעות', 'ההודעות לא נטענו. נסה שוב.');
    }
  }

  /* שליחת הודעה */
  async function send() {
    const content = input.value.trim();
    if (!content) {
      composer.classList.add('is-invalid');
      input.focus();
      return;
    }
    composer.classList.remove('is-invalid');

    const msg = {
      id: `t${Date.now()}`,
      content,
      at: new Date().toISOString(),
      mine: true,
      state: 'pending',
    };
    messages.push(msg);
    render();
    input.value = '';
    autoGrow();
    setLoading(sendBtn, true);

    try {
      await apiCall({ ms: 800, fail: Demo.is('send-error') });
      msg.state = null;
      msg.at = new Date().toISOString();
      Store.addMessage(room.id, { id: msg.id, content: msg.content, at: msg.at, mine: true });
      render();
      updateHeadMeta();
    } catch (err) {
      msg.state = 'failed';
      render();
      toast('ההודעה לא נשלחה', 'error');
    } finally {
      setLoading(sendBtn, false);
      input.focus();
    }
  }

  inner.addEventListener('click', (e) => {
    const retry = e.target.closest('[data-retry]');
    if (!retry) return;
    const msg = messages.find((m) => String(m.id) === retry.dataset.retry);
    if (!msg) return;
    messages = messages.filter((m) => m !== msg);
    input.value = msg.content;
    send();
  });

  sendBtn.addEventListener('click', send);
  $('#retry-messages')?.addEventListener('click', load);

  input.addEventListener('input', () => {
    if (input.value.trim()) composer.classList.remove('is-invalid');
    autoGrow();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  function autoGrow() {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  }

  load();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ---------- ניתוב ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const screen = document.body.dataset.screen;
  const routes = {
    register: initRegister,
    login: initLogin,
    home: initHome,
    'new-chat': initNewChat,
    chat: initChat,
  };
  routes[screen]?.();
});
