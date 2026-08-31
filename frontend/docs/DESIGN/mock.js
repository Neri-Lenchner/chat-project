/* =========================================================
   קו — Mock Data
   מחליף את קריאות ה-API של האפיון לצורך הדגמת המסכים.
   המבנה תואם למודלים User / Room / Message.
   ========================================================= */

const MOCK_USER = {
  id: 1,
  firstName: 'עידן',
  lastName: 'אייש',
  phone: '0521234567',
};

/* רשימת אנשי קשר מקומית — סעיף 9.1 באפיון */
const MOCK_CONTACTS = [
  { id: 2, name: 'יוסי כהן' },
  { id: 3, name: 'דני לוי' },
  { id: 4, name: 'משה ישראלי' },
  { id: 5, name: 'נועה שגב' },
  { id: 6, name: 'רון אזולאי' },
  { id: 7, name: 'תמר פרידמן' },
];

function atToday(h, m) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
function atDaysAgo(days, h, m) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

const MOCK_ROOMS = [
  { id: 101, otherUserId: 2, name: 'יוסי כהן',    lastMessage: 'סגור, נדבר מחר בבוקר',            lastAt: atToday(12, 45), unread: 0 },
  { id: 102, otherUserId: 5, name: 'נועה שגב',    lastMessage: 'שלחתי לך את הקובץ, תעדכן אותי',   lastAt: atToday(9, 12),  unread: 2 },
  { id: 103, otherUserId: 3, name: 'דני לוי',     lastMessage: 'תודה!',                            lastAt: atDaysAgo(1, 18, 30), unread: 0 },
  { id: 104, otherUserId: 4, name: 'משה ישראלי',  lastMessage: 'אני בדרך, מגיע בעוד רבע שעה',      lastAt: atDaysAgo(3, 8, 5),  unread: 0 },
  { id: 105, otherUserId: 6, name: 'רון אזולאי',  lastMessage: 'נשמע טוב לי',                      lastAt: atDaysAgo(9, 21, 44), unread: 0 },
];

const MOCK_MESSAGES = {
  101: [
    { id: 1, content: 'היי יוסי, הספקת להסתכל על ההצעה?', at: atDaysAgo(1, 17, 2), mine: true },
    { id: 2, content: 'כן, עברתי עליה. נראה לי מדויק', at: atDaysAgo(1, 17, 40), mine: false },
    { id: 3, content: 'מעולה. יש משהו שהיית משנה לפני שאני שולח ללקוח?', at: atToday(9, 5), mine: true },
    { id: 4, content: 'רק את לוח הזמנים בעמוד השני, הוא קצת אופטימי', at: atToday(9, 22), mine: false },
    { id: 5, content: 'מקבל. אעדכן ואשלח שוב', at: atToday(12, 40), mine: true },
    { id: 6, content: 'סגור, נדבר מחר בבוקר', at: atToday(12, 45), mine: false },
  ],
  102: [
    { id: 1, content: 'שלחתי לך את הקובץ, תעדכן אותי', at: atToday(9, 12), mine: false },
  ],
  103: [
    { id: 1, content: 'העברתי לך את הפרטים', at: atDaysAgo(1, 18, 12), mine: true },
    { id: 2, content: 'תודה!', at: atDaysAgo(1, 18, 30), mine: false },
  ],
  104: [
    { id: 1, content: 'אני בדרך, מגיע בעוד רבע שעה', at: atDaysAgo(3, 8, 5), mine: false },
  ],
  105: [
    { id: 1, content: 'נשמע טוב לי', at: atDaysAgo(9, 21, 44), mine: false },
  ],
};
