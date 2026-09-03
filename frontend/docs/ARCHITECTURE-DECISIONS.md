# החלטות ארכיטקטורה — סטיות מ-TASKS-FRONT.md

מסמך זה מתעד כל מקום שבו המימוש בפועל שונה מ-`TASKS-FRONT.md`, ולמה.
כשיש סתירה בין מסמך זה ל-`TASKS-FRONT.md` — **מסמך זה גובר**, כי הוא מאוחר יותר ואושר מפורשות.

---

## AD-1 · פיצול מערכת העיצוב לקבצי CSS צמודים לרכיבים

**תאריך:** 2026-08-27 · **שלב:** אחרי שלב 2 · **סטטוס:** מיושם

### מה השתנה

`TASKS-FRONT.md` §1.2 מגדיר שתי שכבות CSS, כשהשכבה הראשונה היא ארבעה קבצים גלובליים
(`tokens` `base` `components` `screens`) המועתקים כמו שהם ו**סגורים לעריכה**.

בפועל `components.css` ו-`screens.css` **פוצלו ל-23 קבצים צמודים לרכיבים**.
`tokens.css` ו-`base.css` נשארו גלובליים ומיובאים ב-`main.tsx`.

### למה

מדידה של כל 162 מחלקות השורש הראתה ש-**134 מהן שייכות לרכיב אחד ויחיד**,
ושהחלוקה מתחלקת נקי — אין מחלקה שנחלקת בין שני רכיבים.
כלומר החלוקה לרכיבים כבר הייתה קיימת בעיצוב, רק לא בוטאה במבנה הקבצים.

`DESIGN-SYSTEM.md` §10 ממילא מתיר את הפיצול הזה ("או פירוק ל-CSS Modules לפי רכיב, עם אותן מחלקות").
CSS Modules עצמו **לא** נבחר — שמות המחלקות נשארו גלובליים וזהים לפרוטוטייפ, אות באות.

### מפת הפיצול

| מקור | יעד |
| --- | --- |
| `.btn*` | `component/ui/button/Button.css` |
| `.field*` `.input*` | `component/ui/field/Field.css` |
| `.banner*` | `component/ui/banner/Banner.css` |
| `.avatar*` | `component/ui/avatar/Avatar.css` |
| `.badge` `.chip` | `component/ui/badge/Badge.css` |
| `.dialog*` `.scrim` | `component/ui/dialog/Dialog.css` |
| `.toast*` | `component/ui/toast/Toast.css` |
| `.spinner*` | `component/ui/spinner/Spinner.css` |
| `.skeleton` | `component/ui/skeleton/Skeleton.css` |
| `.empty*` | `component/ui/empty/Empty.css` |
| `.brand*` | `component/ui/brand/Brand.css` |
| `.app` `.main*` `.workspace` `body[data-screen]` | `component/layout/app-shell/AppShell.css` |
| `.topbar*` `.user-chip*` | `component/layout/topbar/Topbar.css` |
| `.rail*` | `component/layout/rail/Rail.css` |
| `.menu*` | `component/layout/user-menu/UserMenu.css` |
| `.auth*` `.form__*` `.preview*` | `component/auth/Auth.css` |
| `.room*` | `component/room/room-card/RoomCard.css` |
| `.room-skeleton*` | `component/room/room-list/RoomList.css` |
| `.contact*` `.dialog--wide` `.dialog__head` | `component/room/new-chat-dialog/NewChatDialog.css` |
| `.chat-head*` | `component/chat/chat-head/ChatHead.css` |
| `.thread*` `.day*` | `component/chat/thread/Thread.css` |
| `.msg*` `.bubble` | `component/chat/message-item/MessageItem.css` |
| `.composer*` | `component/chat/composer/Composer.css` |
| `.page*` `.section*` `.swatch*` `.specimen*` `.stack` `.grid` `.card*` | `dev/Styleguide.css` |
| `.icon` `.icon--sm` `.icon--lg` | `component/ui/icon/Icon.css` — **הועבר מ-`base.css` בשלב 3** |

**שני שינויים נוספים בפיצול:**

1. שני בלוקי `@media` שדורסים טוקנים גלובליים (`--size-rail`, `--size-gutter`) הועברו
   מ-`screens.css` אל **סוף `tokens.css`**. מקומם שם כי הם משנים טוקן, לא עיצוב של רכיב.
2. מחלקות `.demo*` (בורר מצבי ההדגמה של הפרוטוטייפ) **הוסרו** — אין להן תפקיד באפליקציה.

### הכללים שנשארו בתוקף

- שמות המחלקות **זהים לפרוטוטייפ, אות באות**. לא שונה שם אחד.
- אין CSS Modules, אין styled-components, אין Tailwind.
- ערכי צבע / גודל / מרווח / רדיוס — `var(--token)` בלבד. אין ערך קשיח.
- אין `!important`. אין `style={{}}` ב-TSX. תכונות לוגיות בלבד.
- קובץ CSS צמוד לרכיב נטען ע"י הרכיב עצמו: `import "./Button.css";` בראש ה-TSX,
  בדיוק כמו `CourseList.css` ב-`docs/front-example`.

### הכלל החדש שנוסף — שרשור מול סדר ייבוא

הסיכון היחיד בפיצול הוא שסדר הקסקדה תלוי בסדר טעינת הרכיבים.
לכן: **כשרכיב א' דורס מחלקה של רכיב ב', הסלקטור חייב להיות משורשר** כדי לנצח
בספציפיות ולא בסדר. חמש נקודות כאלה זוהו ותוקנו:

| הסלקטור המקורי | אחרי החיסון | דורס |
| --- | --- | --- |
| `.composer__send` | `.composer__send.btn` | `.btn` (גובה, padding) |
| `.chat-head__back` | `.chat-head__back.btn` | `.btn` (display) |
| `.chat-head__delete` | `.chat-head__delete.btn` | `.btn--icon` (color) |
| `.room-skeleton__avatar` `.room-skeleton__line` | `+.skeleton` | `.skeleton` (border-radius) |
| `.thread-skeleton__bubble` `--out` | `+.skeleton` | `.skeleton` (border-radius) |

**מקרה יחיד שנשאר תלוי-סדר במכוון:** `.u-faint` מול `.dialog__text` (שניהם `color`).
`base.css` מיובא ב-`main.tsx` לפני כל רכיב, ולכן `.dialog__text` מנצח — בדיוק כמו במקור.

### תיקון שנדרש בשלב 16 — @keyframes חוצי רכיבים

`@keyframes` הוא גלובלי, אבל הוא חייב **להיטען** — ורכיב לא טוען את ה-CSS של רכיב אחר.
הפיצול פיזר שלוש אנימציות הרחק מהרכיבים שמשתמשים בהן, ואחת מהן נשברה בפועל:

| אנימציה | הייתה ב- | בשימוש של | היעד החדש |
| --- | --- | --- | --- |
| `kav-pop` | `Dialog.css` | `UserMenu` בלבד | `UserMenu.css` — **הייתה שבורה**, כי `Dialog.css` לא נטען במסך הראשי |
| `kav-rise` | `Toast.css` | `Dialog` + `Toast` | `base.css` |
| `kav-msg-in` | `MessageItem.css` | `Auth` + `MessageItem` | `base.css` |

**הכלל שנוסף:** `@keyframes` שבשימוש של יותר מרכיב אחד יושב ב-`base.css`.
אנימציה שרכיב יחיד משתמש בה יושבת בקובץ שלו, יחד עם הכלל שקורא לה.

### אימות שבוצע

- **אפס כללים אבדו:** 263 כללים במקור → כל 263 קיימים בקבצים החדשים (השוואת שלשות
  מדיה+סלקטור+הצהרות מנורמלות).
- **אפס סלקטורים כפולים בין קבצים.**
- **בדיקת קסקדה על 3,040 אלמנטים** שנבנו מ-152 צירופי המחלקות שקיימים בפרוטוטייפ:
  אחרי החיסון לא נותרה אף התנגשות אמיתית.
- מדידות `getComputedStyle` לפני ואחרי הפיצול — זהות.

---

## AD-6 · המודלים וה-DTO הם class ולא interface

**תאריך:** 2026-08-27 · **שלב:** 5 · **סטטוס:** מיושם

### מה השתנה

`TASKS-FRONT.md` שלב 5 סעיף 1 מגדיר את ה-DTO כ-`interface`, ונספח א' מתאר את המודלים כטבלת שדות.
בפועל **כל מה שב-`src/models/` הוא `class`** — `UserDTO` `RoomDTO` `MessageDTO` `User` `Room` `Message` `RoomMeta`.

בנוסף, `models/dto.ts` **בוטל**. כל ישות יושבת בקובץ אחד עם ה-DTO שלה, כמו `models/course.ts` ב-`front-example`:

| קובץ | מכיל |
| --- | --- |
| `models/user.ts` | `UserDTO` · `User` |
| `models/room.ts` | `RoomDTO` · `RoomMeta` · `Room` |
| `models/message.ts` | `MessageDTO` · `MessageStatus` · `Message` |

לכן קריטריון הסיום של שלב 5 מנוסח מחדש: **אין שדה snake_case מחוץ למחלקות ה-DTO ול-`utils/mappers.ts`**.
בסגנון `docs/front-example`, כלומר parameter properties: `constructor(public firstName: string, ...)`.

`interface` נשאר בשימוש **רק** למה שאינו מודל: props של רכיבים (`ButtonProps`, `FieldProps`) ופעולות Redux
(`UserAction`) — בדיוק כמו ב-`front-example`.

### למה

1. זו דרישת הפרויקט: ארכיטקטורה זהה ל-`docs/front-example`, שם `Course` `User` `Credentials` הם מחלקות.
2. נספח א' דורש ש-`fullName` יהיה **getter מחושב ולא שדה**, ואותו דבר ל-`displayName`.
   `interface` לא יכול להחזיק getter. המעבר ל-class הוא מה שמאפשר את הדרישה הזו.

### שלוש הכרעות שנגזרו

| נושא | ההחלטה | למה |
| --- | --- | --- |
| `Message.mine` | **שדה**, לא getter | getter היה מחייב את המודל לקרוא מ-`userStore`. במקום זה `toMessage(dto, currentUserId)` מציב אותו |
| `User.fullName` · `Room.displayName` | **getters** | בדיוק כפי שנספח א' דורש |
| `Room.metaName` | שדה חדש שלא בנספח א' | נספח א' דורש `displayName = meta ← name ← "שיחה #{id}"`. השם מה-meta חייב מקום לשבת בו |

### מלכודת שנובעת מהמעבר — חובה לטפל בה בשלב 6

`JSON.stringify` על מופע class **לא מסדרל getters**. אומת:

```
JSON.stringify(user)  →  {"id":2001,"firstName":"עידן","lastName":"אייש","phoneNumber":"052-1234567"}
```

`fullName` נעלם. לכן `storage.ts` בשלב 6 **חייב לשחזר מופעים** בקריאה מ-`localStorage`
(`new User(o.id, o.firstName, o.lastName, o.phoneNumber)`) ולא להחזיר את התוצאה הגולמית של `JSON.parse` —
אחרת `user.fullName` יהיה `undefined`. אותו כלל חל על `Room.displayName`.

### אימות שבוצע

- `npm run build` עובר. אין `interface` ב-`src/models/`.
- **אין שדה snake_case מחוץ למחלקות ה-DTO ול-`utils/mappers.ts`** (grep על כל `src/`).
- `toUserDTO` מול השרת האמיתי: `POST /api/room/` החזיר **200**.
  אותה קריאה עם `user_list: [{id}]` בלבד החזירה **422 · "Field required @ body.user_list.0.first_name"** —
  מה שמאשר את האזהרה בסעיף 4 של השלב.
- `displayName`: חדר עם `name: ""` → `"שיחה #1001"` · עם שם מהשרת → השם · עם meta → שם איש הקשר.
- `mine`: הודעה מ-2002 כשהמחובר 2001 → `false`; הודעה מ-2001 → `true`.

---

## AD-2 · Redux קלאסי ולא Redux Toolkit

**סטטוס:** מיושם החל משלב 8

`SPECV2-FRONT.md` §2.1 ו-`DESIGN-SYSTEM.md` §10 ממליצים על Redux Toolkit.
`TASKS-FRONT.md` §1.1 אוסר אותו. **נבחר Redux קלאסי** — `createStore`, `enum ActionType`,
`interface Action`, `reducer`, וחיבור רכיבים ב-`useState` + `store.subscribe()` בתוך `useEffect`.

הסיבה: הדרישה המרכזית של הפרויקט היא ארכיטקטורה זהה ל-`docs/front-example`, ושם זה Redux קלאסי.
`@reduxjs/toolkit` ו-`react-redux` **אינם מותקנים**.

---

## AD-3 · הרצת השרת דורשת PYTHONPATH

**סטטוס:** מתועד ב-`DEMO-USERS.md`

הפקודה ב-`TASKS-FRONT.md` שלב 0 נכשלת משורת הפקודה. הפקודה העובדת, מתוך `backend/`:

```bash
PYTHONPATH=modules ./.venv/Scripts/uvicorn.exe main:app --reload --host 127.0.0.1 --port 8000
```

---

## AD-4 · StrictMode הוסר

**סטטוס:** מיושם משלב 1

`front-example` לא משתמש ב-`StrictMode`, והוא מריץ `useEffect` פעמיים ב-dev —
מה שיגרום לקריאות API כפולות ויסתור את עקרון "קריאה אחת" (`SPECV2-FRONT.md` §2.2, §27).

---

## AD-5 · דגלי TypeScript שכובו

**סטטוס:** מיושם משלב 1

תבנית Vite 8 מדליקה כברירת מחדל `erasableSyntaxOnly` ו-`verbatimModuleSyntax`.
שניהם כובו ב-`tsconfig.app.json`, כי `erasableSyntaxOnly` **אוסר parameter properties** —
כלומר `constructor(public firstName: string, ...)`, שזו הצורה של המודלים ב-`docs/front-example`.

---

## AD-7 · שגיאת יצירת חדר מוצגת כטוסט, לא כבאנר בתוך הדיאלוג

**תאריך:** 2026-08-27 · **שלב:** 18 · **סטטוס:** מיושם

### מה השתנה

`docs/DESIGN/new-chat.html` ו-`screens.js` מציגים כישלון יצירת חדר כ-`.banner--error`
בתוך גוף הדיאלוג (מעל רשימת אנשי הקשר). בפועל הכישלון מוצג כ-**טוסט**.

### למה

`TASKS-FRONT.md` שלב 18 סעיף 3 כותב במפורש: *"כישלון → הדיאלוג נשאר פתוח, **טוסט**
`לא ניתן ליצור את השיחה. נסה שוב.`, ה-Store לא משתנה"* — לא באנר. זו הוראה מפורשת
וקרובה יותר לשלב הזה מהתנהגות ה-mock הכללית בפרוטוטייפ, ונבחרה על פניה.
הטוסט גם מאפשר ניסיון חוזר בלי לגלול בתוך הדיאלוג, ומתנקה לבד אחרי 3.2 שניות.

הטקסט עצמו זהה מילה במילה לנספח ב' (`לא ניתן ליצור את השיחה. נסה שוב.`).

### תיקון שנוסף בעקבות בדיקה — מניעת כפילות

בבדיקה נמצא: בחירת איש קשר שכבר יש איתו שיחה הייתה יוצרת **חדר נוסף** עם אותו איש קשר —
תואם להתנהגות השרת (`API SPEC §3.2`: "אין בדיקת כפילות... קריאה חוזרת תיצור חדר נוסף"),
אבל חוויית משתמש גרועה: אותה שיחה מופיעה כמה פעמים ברשימה.

התיקון: לפני הקריאה ל-`roomService.createRoom`, `NewChatDialog` בודק אם כבר קיים ב-`roomStore`
חדר עם `otherUserId` השווה למזהה איש הקשר שנבחר (מה ש-`roomMeta` המקומי כבר יודע, TODO-6).
אם כן — מנווטים אליו ישירות, **בלי שום קריאת שרת**. השרת עצמו לא שונה ולא נבדק — הבדיקה
כולה מקומית וזולה.

**המגבלה, במפורש:** הבדיקה מוגבלת למה שידוע ב-`roomMeta` המקומי. חדר עם אותו איש קשר
שנוצר ממכשיר/דפדפן אחר לא יזוהה, והכפילות עדיין תיווצר — זו אותה מגבלה בדיוק כמו TODO-6
עצמו, לא כשל נוסף.

**אומת:** בחירת איש קשר עם חדר קיים → ניווט ישיר, **אפס קריאות רשת**, אין כרטיס כפול ברשימה.
בחירת איש קשר חדש → `POST /api/room/` כרגיל.

### תוספת ל-`Dialog`

`docs/DESIGN/new-chat.html` משתמש במבנה `.dialog__head` — כותרת ומשפט הסבר בצד אחד,
כפתור סגירה (X) בצד השני — שלא היה קיים ב-`Dialog` משלב 16 (שם נבנה רק עבור
`DeleteRoomDialog`, שאין לו כותרת משנה או כפתור X).

`Dialog` קיבל שני props אופציונליים חדשים: `subtitle?` ו-`showCloseButton?`.
כשהם לא מסופקים ההתנהגות זהה לגמרי למה שהיה בשלב 16 (כותרת פשוטה בלבד) —
`DeleteRoomDialog` לא שונה ועדיין עובר את כל הבדיקות של שלב 17.

### אימות שבוצע

- `POST /api/room/` אמיתי מול השרת: `200` עם `{id, name}`, ואפס `GET` נוסף אחרי היצירה.
- מצב עסוק: הכרטיס שנבחר מקבל `is-busy`, הרמז משתנה ל-`יוצר שיחה…`, שאר הכרטיסים ננעלים.
- כישלון (שרת מדומה שנופל): הדיאלוג נשאר פתוח, הכרטיס חוזר למצב רגיל, `roomStore` לא השתנה,
  טוסט השגיאה מופיע עם הנוסח המדויק.
- שלושת מסלולי הפתיחה — כפתור בסרגל העליון, פריט בתפריט המשתמש, כפתור במצב הריק —
  כולם פותחים את אותו דיאלוג.
- `Escape` ולחיצה על הרקע סוגרים; המיקוד הראשוני נופל על כפתור הסגירה (ראשון הפוקוסבילי
  בדיאלוג), שזו התנהגות ברירת המחדל הקיימת של `Dialog` ולא נדרש שינוי בשבילה.

---

## AD-8 · TODO-2 נסגר: מחיקת שיחה אמיתית, ולא הסתרה מקומית

**תאריך:** 2026-08-31 · **שלב:** לפני שלב 20 · **סטטוס:** מיושם

### מה קרה

`backend/docs/API SPEC.md` עודכן (2026-08-31) והוסיף מיון מובטח ל-`GET /api/room-user/room/{user_id}`
(`id` בסדר יורד). בדיקה מול השרת גילתה שני דברים:

1. **השרת הרץ לא טען את הקוד המעודכן.** תהליך ה-`uvicorn --reload` קלט שינוי אחד
   (`room_user_service.py`) אך פספס שינוי אחר (`room_router.py`) שנשמר באותה עת. תוקן
   בהפעלה מחדש ידנית של השרת.

2. **אחרי ההפעלה מחדש נחשף `DELETE /api/room/{room_id}` אמיתי בקוד**, ש**אינו מתועד כלל**
   ב-`API SPEC.md` — המסמך עדיין רושם בסעיף 6 שלו ש"אין `DELETE /api/room/{id}`". כלומר
   המסמך עצמו סוטה מהקוד בנקודה הזו. אומת ידנית מול השרת עם חדר חד-פעמי:

   ```
   POST /api/room/         →  נוצר חדר 1018
   DELETE /api/room/1018   →  200, {"id":1018,"name":"..."}
   ב-DB: room=0 שורות, room_user=0 שורות, message=0 שורות (לכל ה-room_id)
   ```

   המחיקה **אמיתית ובלתי הפיכה, ומוחקת עבור שני הצדדים** — לא "הסתרה למכשיר הזה" כפי
   שהניח TODO-2 המקורי. קריאה ל-`DELETE` על חדר שלא קיים מחזירה `500` (לא `404` — עקבי
   עם שאר ה-API לפי §4.3).

### מה השתנה בקוד

**הוסר לגמרי:** `HiddenRoomsStorage` (`utils/storage.ts`), `roomService.hideRoom`, וכל
אזכורי `TODO-2` בקוד. הסינון של `hiddenRooms` ב-`getRoomList` הוסר — השרת כבר לא מחזיר
את החדר בכלל אחרי מחיקה, אין מה לסנן.

**נוסף:** `roomService.deleteRoom(roomId): Promise<void>` — קורא ל-`DELETE room/{roomId}`,
ובהצלחה: מסיר מ-`roomStore` (`RemoveRoom`, אותה פעולה שהייתה קיימת), מנקה את `roomMeta`
המקומי של החדר, ומנקה את הודעותיו מ-`messageStore` (`messageService.clearRoom`, ללא שינוי).

**`DeleteRoomDialog`** — הפך אסינכרוני: `onConfirm` מחזיר `Promise<void>`, כפתור המחיקה
מקבל `loading` בזמן הבקשה, והדיאלוג לא ניתן לסגירה (`isDismissible={false}`) בזמן שהיא
בטיסה. כישלון משאיר את הדיאלוג פתוח ומאפס את הכפתור לניסיון חוזר — אותו דפוס שנעשה
ב-`Register` וב-`NewChatDialog`.

**הטקסט** השתנה משורש, כי הסמנטיקה התהפכה:

| | לפני (TODO-2 — הסתרה מקומית) | אחרי (מחיקה אמיתית) |
| --- | --- | --- |
| טקסט הדיאלוג | "תוסתר מהמכשיר הזה... השרת לא תומך במחיקה" | "יימחקו לצמיתות, גם עבור הצד השני. אי אפשר לבטל" |
| טוסט הצלחה | "השיחה הוסתרה" | "השיחה נמחקה" |
| טוסט כישלון | (לא היה — הפעולה הייתה מקומית ותמיד הצליחה) | "לא ניתן למחוק את השיחה. נסה שוב." — ממשיך את התבנית המאושרת בנספח ב' |

**מיון הרשימה** — `RoomList.tsx` הפסיק למיין לפי `lastAt` בצד הלקוח. השרת מבטיח עכשיו
מיון לפי `id` יורד (`backend/docs/API SPEC.md §3.3`), ו-`roomService.getRoomList` מציג
את הרשימה שהתקבלה כמות שהיא. אומת: `GET room-user/room/2001` מחזיר `1015,1004,1003,1002,1001`,
והרשימה במסך מוצגת באותו סדר בדיוק, ללא מיון לקוח.

### אימות שבוצע

- מחיקה אמיתית מה-UI: `DELETE /api/room/1003` נשלח, החדר נעלם מהרשימה ומהמונה מיד,
  טוסט "השיחה נמחקה", **ואומת ב-DB ישירות** — `room`, `room_user` ו-`message` לחדר הזה
  התרוקנו לגמרי.
- ההסרה שורדת רענון מלא (כי היא כבר לא תלויה ב-`localStorage` — היא אמיתית בשרת).
- `roomMeta` המקומי של החדר שנמחק מתנקה.
- כישלון (בדיקה עם `http.delete` מדומה שנכשל, בפיקוח טיימינג מדויק): הדיאלוג **נשאר פתוח**,
  הכפתור חוזר למצב רגיל, הכרטיס **לא** נעלם מהרשימה, טוסט שגיאה מוצג.
- מחיקת החדר הפתוח כרגע מנווטת אוטומטית ל-`/`.

### הערה לתיעוד השרת

`backend/docs/API SPEC.md` נשאר **בפועל לא מעודכן** ביחס לקוד בשתי נקודות: אינו מזכיר את
`DELETE /api/room/{room_id}` כלל (סעיף 6 עדיין מציג DELETE כ-❌), ואינו מזכיר את
`date_time`/`is_read` כפתורים חסרים באותו אופן. אין בכוונת הפרונט לערוך את מסמכי ה-backend —
זו הערה לתיעוד עתידי בצד השרת בלבד.

---

## AD-9 · TODO-6 נסגר: השרת מחזיר את משתתפי החדר, ו-roomMeta הוסר

**תאריך:** 2026-08-31 · **שלב:** לפני שלב 20 · **סטטוס:** מיושם

### מה קרה

`RoomDTO` (וממילא `GET /api/room-user/room/{user_id}`, `POST /api/room/`, `DELETE /api/room/{room_id}`)
מחזיר עכשיו `user_list: User[]` מלא לכל חדר. זה לא מתועד ב-`backend/docs/API SPEC.md` — אותה
תופעה כמו ב-AD-8.

כמו ב-AD-8, השרת הרץ לא טען את השינוי בהפעלה ראשונה — `room_user_service.py` ניסה לשים
`user_list` ישירות על מופעי `Room` (מודל טבלה, `table=True`), ששדה כזה לא מוגדר עליו:

```
ValueError: "Room" object has no field "user_list"
```

זה קרס על **כל** קריאה ל-`GET /api/room-user/room/{user_id}`. דיווחתי לפני שנגעתי בקוד —
לא תיקנתי backend בעצמי, כי לאורך כל הפרויקט השרת מוגדר כ"מוכן ולא ישונה". התיקון (בניית
`RoomReadDTO` ישירות במקום למתוח שדה על `Room`) בוצע בצד השרת; אחרי הפעלה מחדש מלאה אומת:

```
GET /api/room-user/room/2001
→ [{"id":1004,"name":"נועה שגב","user_list":[{id:2001,...},{id:2003,...}]}, ...]
```

### מה השתנה בקוד

**הוסר לגמרי:** `RoomMeta` (`models/room.ts`), `RoomMetaStorage` ו-`roomMeta` (`utils/storage.ts`),
וכל אזכורי `TODO-6` בקוד.

**`Room`** קיבל מבנה חדש:
- `userList: User[]` — כל המשתתפים, ישירות מהשרת.
- `other?: User` — נגזר במיפוי (`toRoom(dto, currentUserId)`), לא ב-getter, **באותו עיקרון
  כמו `Message.mine` ב-AD-6**: המודל לא תלוי ב-store, ה-`currentUserId` מגיע כפרמטר.
- **חדר קבוצתי (יותר מ-2 משתתפים):** `other` נשאר `undefined` — אין "האחר" יחיד לבחור.
  `displayName` נופל אז ל-`name` של השרת. אין קריסה, אין ניחוש. אומת על חדר seed עם
  7 משתתפים (`Night Owls 232`): `other: undefined`, `displayName` = שם השרת.

**`toRoom`** — חתימה חדשה: `toRoom(roomDto: RoomDTO, currentUserId: number): Room`
(היה `toRoom(roomDto, meta?: RoomMeta)`).

**`room-service.ts`** — `getRoomList` ו-`createRoom` פשוטים משמעותית: אין יותר שלב "העשרה
מ-roomMeta מקומי", `toRoom` מקבל את `user.id` ישירות. `findRoomByContact` בודק `room.other?.id`
במקום `room.otherUserId`. `deleteRoom` לא צריך יותר `roomMeta.remove`.

### אימות שבוצע

- `roomStore` אחרי טעינה: כל `Room` הוא מופע אמיתי, `other` הוא מופע אמיתי של `User`
  (ה-getter `fullName` עובד), `displayName` נכון — **בלי אף שורה ב-`roomMeta`ב-`localStorage`**
  (`localStorage.getItem("roomMeta") === null` לאורך כל התהליך).
- `findRoomByContact` / `getOrCreateRoom` (דה-דופ' משלב 18, AD-7): עדיין עובד — חדר קיים
  מוחזר באפס קריאות רשת, מבוסס על `room.other?.id` שמגיע מהשרת ולא מ-`localStorage`.
- חדר חדש (`POST /api/room/`): `other` ו-`userList` מגיעים ישירות מתגובת השרת, בלי בנייה
  ידנית של meta.
- `deleteRoom`: ללא שינוי בהתנהגות (ראה AD-8), רק בלי קריאת ניקוי ל-`roomMeta`.
- חדר קבוצתי מה-seed: `other: undefined`, `displayName` נופל ל-`name` של השרת — בלי קריסה.

---

## AD-10 · הודעות pending/failed חיות ב-MessageStore, לא ב-state מקומי

**תאריך:** 2026-08-31 · **שלב:** 21 · **סטטוס:** מיושם

### ההחלטה

`TASKS-FRONT.md` §21 מפרט את זרימת השליחה (הצגת pending → קריאת שרת → הצלחה/כישלון) אבל
לא קובע איפה חיה ההודעה הזמנית. `Composer` ו-`Thread` הם רכיבי אחים תחת `ChatRoute` —
ל-`Composer` אין דרך "להזריק" בועה לרשימת ההודעות של `Thread` בלי Redux או prop-drilling
דרך ההורה המשותף.

נבחר Redux: `messageService` מקבל שתי פעולות חדשות ב-`MessageActionType`
(`state/message-state.ts`) —

- **`AddMessage`** (קיימת) — עכשיו משמשת גם להוספת ההודעה הזמנית מיד עם השליחה, עם `id`
  שלילי זמני (`nextTempId--`, מונה בתוך `MessageService` כדי שלא יתנגש עם id-ים אמיתיים
  מהשרת) ו-`status: "pending"`.
- **`ReplaceMessage`** (חדשה) — `{roomId, messageId, message}`: מחליפה הודעה קיימת (לפי id)
  באובייקט חדש. משמשת לשלושת המעברים: pending → מאושרת (הצלחה), pending → failed (כישלון),
  failed → pending (לחיצה על `.msg__retry`, לפני ניסיון חוזר).

התוצאה: `MessageItem` בכלל לא יודע להבחין בין הודעה "אמיתית" לזמנית — `.msg--pending`/
`.msg--failed` נגזרים ישירות מ-`message.status`, ו-`Thread` מרנדר הכל (כולל קיבוץ לפי יום,
גלילה לתחתית) בלי קוד מיוחד להודעות pending. גם `UpdateRoomPreview` ל-`RoomStore` עבר
לגור בתוך `messageService` (ב-`deliver`, בדיוק אחרי הצלחה) — סימטרי ל-`Thread.tsx` שכבר
עושה את אותו הדבר בעת טעינת חדר (TODO-3).

**חתימת `sendMessage` השתנתה:** `Promise<Message>` → `Promise<void>` (זורקת בכישלון).
`Composer` לא צריך את ההודעה בחזרה — היא כבר ב-Store ריאקטיבית.

**שחזור אחרי כישלון (retry) שומר על אותו id** — בניגוד ל-`docs/DESIGN/chat.html` שבו
`retry` מוחק את ההודעה הכושלת ומכניס מחדש את התוכן לשדה הקלט (`send()` מחדש עם `id` חדש).
זה לא תואם את קריטריון הבדיקה בסעיף 21 ("הטקסט נשמר... הפעלת השרת + נסה שוב → ההודעה
נשלחת" — לא "השדה מתמלא מחדש"), ומבטיח שהבועה לא "קופצת" למקום אחר ברשימה.

### אימות שבוצע

- שליחה מוצלחת: בועה pending (`···`) מופיעה מיידית → מוחלפת בבועה עם `id`/`at` אמיתיים
  מהשרת, `RoomStore` מתעדכן, אין `GET` נוסף (`read_network_requests` הראה `GET` יחיד
  בטעינת החדר + `POST`ים בלבד לאורך כל הבדיקה).
- כישלון אמיתי: השרת הופסק בפועל (לא מוק) → בועה אדומה עם "לא נשלח · שליחה חוזרת",
  התוכן נשמר, טוסט הופיע. השרת הופעל מחדש → לחיצה על "שליחה חוזרת" הפכה את אותה בועה
  בדיוק לירוקה/מאושרת עם זמן אמיתי, בלי לזוז ברשימה.
- רענון דף אחרי הצלחה/retry: כל ההודעות עדיין שם (נשמרו בשרת), כולל ההודעה ששוחזרה.
- שדה ריק + Enter → לא קורה כלום, אין קריאה. Shift+Enter → שורה חדשה, `preventDefault`
  לא נקרא, אין שליחה.
- חדר קבוצתי (`other === undefined`): `.composer` מקבל `is-invalid`, השדה והכפתור
  מושבתים (`disabled`), `.composer__error` מציג "לא ניתן לזהות את הנמען בשיחה הזו".

---

## AD-11 · הודעות בקוד עוברות מעברית לאנגלית + רשימת שיחות ממוינת לפי פעילות אחרונה

**תאריך:** 2026-08-31 · **שלב:** לפני שלב 22 · **סטטוס:** מיושם

### מה קרה

הנחיה מפורשת של המשתמש, לא נגזרת מ-`TASKS-FRONT.md`:

1. כל ההערות בקוד המקור (`//`, `/* */`) עברו תרגום מעברית לאנגלית — לא נגעתי בשום מחרוזת
   פונה-למשתמש (JSX, `aria-label`, placeholder, טוסטים, הודעות ולידציה) שנשארה בעברית
   כמו שהיא. הכלל תועד ב-`TASKS-FRONT.md` §1.5 כחוק ברזל קבוע להמשך הפרויקט.
2. רשימת השיחות (`RoomList`) עברה מ"סדר יצירה מהשרת בלבד" (AD-8: הוסר המיון המקומי הישן,
   כי השרת מבטיח `id` יורד) ל-**MRU** — Most Recently Active first: שיחה שנשלחה בה הודעה
   קופצת לראש הרשימה.

### מה השתנה בקוד

**`room-state.ts`** — פעולה חדשה, `PromoteRoom` (payload: `roomId`): מוציאה חדר מהמערך
(`splice`) ומכניסה אותו בראש (`unshift`). `UpdateRoomPreview` **לא** משתנה — היא ממשיכה
לעדכן את תוכן התצוגה המקדימה במקומה, בלי להזיז כלום ברשימה (התנהגות מקורית, כמו לפני
AD-11). `PromoteRoom` נשלחת **רק** מ-`message-service.ts#deliver` אחרי שליחה/retry מוצלחים —
`Thread.tsx` (כניסה לחדר, TODO-3) שולחת `UpdateRoomPreview` בלבד, בלי promote.

זה לא סותר את AD-8 — AD-8 הסיר מיון-לפי-`lastAt` גורף (שלא היה אפשרי בלי לגעת בכל שיחה),
לא קידום נקודתי שמופעל רק בשליחה בפועל.

> **תיקון (אותו יום):** הגרסה הראשונה של AD-11 הזיזה חדר לראש גם ב-`UpdateRoomPreview` —
> כלומר גם כניסה לחדר (בלי לשלוח) הזיזה אותו לראש. המשתמש דיווח שזו לא ההתנהגות הרצויה
> ("היא אמורה לעלות למעלה רק אחרי ששלחתי הודעה"). הפרדתי את שתי הפעולות: `UpdateRoomPreview`
> (עדכון תוכן, לא מזיז) ו-`PromoteRoom` (הזזה, רק בשליחה מוצלחת).

### אימות שבוצע

- שליחת הודעה בשיחה שלא הייתה ראשונה ברשימה → קפצה לראש מיד, בלי `GET` נוסף.
- כניסה לשיחה קיימת **בלי** לשלוח → **לא** קופצת לראש (רק תצוגה מקדימה מתעדכנת אם יש הודעות).
- `npm run build` — 0 שגיאות. גרפ ל-Hebrew regex על `src/` אחרי המעבר — אפס תוצאות
  מחוץ למחרוזות פונות-למשתמש.

---

## AD-12 · TODO-4 נסגר: `date_time` על Message בשרת, `messageTimes` הוסר

**תאריך:** 2026-09-03 · **שלב:** אחרי שלב 22 · **סטטוס:** מיושם

### מה קרה

הנחיה מפורשת של המשתמש: זמן ההודעה יעבור מ-mechanism מקומי (`utils/storage.ts` —
`messageTimes`, מפתח `messageId → ISO string`, נשמר רק במכשיר ששלח) לשדה אמיתי בשרת.

### מה השתנה — שרת

`backend/modules/message/message.py`: הוסר ה-comment שחסם את `date_time`, ונוסף בפועל —
`datetime | None`, עם `default_factory` שמייצר UTC נאיבי (`datetime.now(timezone.utc)` עם
`tzinfo` מוסר — ל-MySQL `DATETIME` אין tz משלו, וה-driver מוריד `tzinfo` בכל מקרה בדרך חזרה).
`Nullable` — כי לטבלה כבר יש שורות ישנות בלי העמודה. `MessageReadDTO` קיבל את השדה, ו-
`_broadcast_new_message` שולח אותו ב-payload של ה-WebSocket (`model_dump(mode="json")`
ולא הרירת המחדל `model_dump()` — אחרת `datetime` גולמי לא ניתן לסריאליזציה ל-JSON וה-push
היה קורס).

**מיגרציה ידנית:** `ALTER TABLE message ADD COLUMN date_time DATETIME NULL;` — הורצה ישירות
מול `chat_db`. `create_db_and_tables()` (`SQLModel.metadata.create_all`) לא משנה טבלה קיימת,
אז בלי השורה הזו כל שאילתה על `message` הייתה נכשלת. שורות ישנות נשארות `NULL` — הצד לקוח
כבר יודע להתמודד עם `at` חסר (מוצג "··").

### מה השתנה — לקוח

- `models/message.ts` — `MessageDTO.date_time: string | null`.
- `utils/mappers.ts#toMessage` — הפרמטר החיצוני `at?` הוסר; `at` נגזר עכשיו מ-`date_time`.
  מכיוון שהערך מהשרת חסר סימון אזור זמן, `toUtcIso` מוסיפה `Z` אם חסר, כדי ש-`new Date(...)`
  יפרש אותו כ-UTC ולא כשעון מקומי.
- `services/message-service.ts` — הוסרו כל הקריאות ל-`messageTimes` (גם ב-`getMessagesByRoom`
  וגם ב-`deliver`); `toMessage` נקרא עכשיו בלי הפרמטר `at`.
- `utils/storage.ts` — `MessageTimesStorage` והייצוא `messageTimes` הוסרו לגמרי.
- הערות `TODO-4` שהתייחסו ל-"אין `date_time` בשרת" עודכנו במקומות שנגעתי בהם
  (`models/message.ts`, `models/room.ts`, `MessageItem.tsx`, `RoomCard.tsx`).

### אימות שבוצע

מול שרת אמיתי (לא סימולציה), בין שני משתמשי בדיקה:
- הודעה שנשלחה **לפני** המיגרציה (ב-DB בלי `date_time`) ממשיכה להציג "··" — לא נשברה.
- הודעה חדשה שנשלחה **אחרי** המיגרציה מציגה שעה אמיתית (`20:19`), תואמת לשעון המקומי
  (IDT, UTC+3) מול השעה שנבדקה ב-`date` על השרת — כלומר נורמליזציית ה-UTC עובדת נכון.
- `Object.keys(localStorage)` אחרי הכל — `["user", "token"]` בלבד. אין `messageTimes`.
- `npx tsc -b --force` — 0 שגיאות, גם בשרת (ריסטארט `--reload` נקלט, `openapi.json` מציג
  `date_time` על `MessageReadDTO`) וגם בלקוח.
