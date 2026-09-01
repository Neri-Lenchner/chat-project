# TODO — פערים מול האפיון שממתינים לשרת

מקור: `docs/TASKS-FRONT.md` §4. אלה הדברים שהאפיון דורש והשרת (נכון לעכשיו) לא מספק.
לכל אחד יש התנהגות מוגדרת ומתועדת בפרונט — **אין לנסות לממש אותם מול השרת** לפני
שה-endpoint הרלוונטי נכתב. כש-endpoint נכתב, אפשר לעקוב אחרי הרשימה כאן כדי למצוא
כל מקום שנוגע בפער ולסגור אותו (בדפוס שכבר נעשה ל-TODO-2 ו-TODO-6, ראה
`docs/ARCHITECTURE-DECISIONS.md` §AD-8 ו-§AD-9).

---

## TODO-1 — אין `POST /api/user/login`

מסך ההתחברות בנוי במלואו ויזואלית. בשליחה מוצג `.banner--error` עם הסבר וקישור
להרשמה — אין קריאת שרת בכלל.

**מיקומים בקוד:**
- `src/component/auth/login/Login.tsx:28` — הלוגיקה עצמה (`onLogin` לא קוראת לשרת)
- `src/services/user-service.ts:5` — הערה שמסבירה את הפער
- `src/models/user.ts:33` — אין `LoginDTO` כי אין endpoint תואם

---

## TODO-3 — ל-`Room` אין הודעה אחרונה מהשרת

הודעה אחרונה מוצגת **רק** לחדר שהודעותיו כבר נטענו ל-`MessageStore` (בכניסה לחדר,
או אחרי שליחה מוצלחת). אחרת מוצג "עדיין אין תצוגה מקדימה" במחלקה `u-faint`. **אסור**
לבצע `GET` הודעות לכל החדרים במסך הראשי.

**מיקומים בקוד:**
- `src/models/room.ts:35,37,49` — השדות `lastMessage`/`lastAt` על `Room`
- `src/component/room/room-card/RoomCard.tsx:34` — התצוגה בכרטיס
- `src/component/chat/thread/Thread.tsx:75` — `UpdateRoomPreview` בכניסה לחדר (המקור היחיד למידע)
- `src/services/message-service.ts:105` — `UpdateRoomPreview` אחרי שליחה מוצלחת
- `src/state/room-state.ts:66` — סדר הרשימה (MRU) מבוסס על אותו עדכון

---

## TODO-4 — ל-`Message` אין `date_time` מהשרת

זמן נשמר מקומית ב-`localStorage` (`messageTimes`) רק להודעות שנשלחו/שוחזרו מהדפדפן
הזה. להודעה היסטורית בלי רשומה מקומית מוצג `··` בעמודת השעות, עם
`title="השרת אינו מחזיר זמן הודעה"`. הודעה pending מוצגת עם `···`.

**מיקומים בקוד:**
- `src/models/message.ts:36` — השדה `at` על `Message`
- `src/models/room.ts:37` — `lastAt` על `Room` (אותו פער, נגזר)
- `src/utils/storage.ts:68` — `messageTimes` — האחסון המקומי עצמו
- `src/utils/mappers.ts:36` — `toMessage` מקבל `at` כפרמטר חיצוני, לא מה-DTO
- `src/services/message-service.ts:33,95` — קריאה/כתיבה ל-`messageTimes` בטעינה ובשליחה
- `src/component/room/room-card/RoomCard.tsx:39` — עמודת הזמן בכרטיס
- `src/component/chat/message-item/MessageItem.tsx:24` — `··`/`···` בעמודת השעות
- `src/component/chat/thread/Thread.tsx:31` — קיבוץ לפי יום (מפריד נפתח רק כששני הצדדים ידועים)
- `src/component/chat/chat-head/ChatHead.tsx:10` — הסיבה ש-`chat-head__meta` לא נבנה (שלב 20)

---

## TODO-5 — אין ספירת "לא נקרא" מהשרת

`unread` על `Room` הוא תמיד `0`. רכיב ה-`.badge` נבנה בקוד ונשאר לא מוצג בפועל.

**מיקומים בקוד:**
- `src/models/room.ts:28` — השדה `unread` על `Room`, קבוע `0`
- `src/utils/mappers.ts:30` — `toRoom` ממפה `unread: 0`
- `src/component/room/room-card/RoomCard.tsx:101` — ה-badge, בתנאי `unread > 0` שאף פעם לא מתקיים

---

## TODO-7 — אין `GET /api/user` לרשימת אנשי קשר

רשימת אנשי הקשר היא Mock מקומי — זו דרישת האפיון עצמו (סעיף 9.1), לא פשרה. ה-IDs
במוק חייבים להיות של משתמשים אמיתיים ב-DB, אחרת יצירת חדר נופלת ב-500.

**מיקומים בקוד:**
- `src/data/contacts.ts` — רשימת המוק עצמה, עם ה-IDs האמיתיים מ-`docs/DEMO-USERS.md`
- `src/component/room/new-chat-dialog/NewChatDialog.tsx` — משתמש ב-`CONTACTS` לרשימת "שיחה חדשה"

---

## נסגרו במהלך הפיתוח

| מזהה | מה נסגר | היכן |
| --- | --- | --- |
| **TODO-2** | `DELETE /api/room/{room_id}` קיים בפועל בשרת — מחיקה אמיתית ובלתי הפיכה | `docs/ARCHITECTURE-DECISIONS.md` §AD-8 |
| **TODO-6** | כל `Room` מהשרת כולל `user_list` מלא — אין יותר `roomMeta` מקומי | `docs/ARCHITECTURE-DECISIONS.md` §AD-9 |
