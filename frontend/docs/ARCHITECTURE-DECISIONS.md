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
