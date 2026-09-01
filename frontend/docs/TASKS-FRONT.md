# תוכנית מימוש — פרונט "קו" (Kav Chat)

**סטאק:** React 19 + TypeScript + Vite + axios + React Router + React Hook Form + Redux קלאסי (`createStore`)
**מצב השרת:** מוכן ולא ישונה. הפרונט נבנה **מול מה שקיים בפועל בשרת בלבד**.
**גרסה:** 1.0

---

## 0. איך להשתמש במסמך הזה

המסמך מחולק ל-22 שלבים. כל שלב הוא יחידת עבודה אחת סגורה:

- **מטרה** — מה השלב משיג.
- **קבצים** — בדיוק אילו קבצים נוצרים או משתנים.
- **משימות** — מה לעשות.
- **בדיקה** — איך אני בודק שהשלב עבד, רובן ויזואליות בדפדפן.
- **קריטריון סיום** — מתי מותר לעבור לשלב הבא.

**כללי עבודה:**

1. שלב אחד בכל פעם. אין לפתוח שלב לפני שהקודם עבר את הבדיקה.
2. אין לכתוב קוד של שלב עתידי "בהזדמנות". אם קובץ נדרש מוקדם — הוא מופיע בשלב שבו הוא נדרש.
3. שלבים המסומנים `[ללא בדיקה ויזואלית]` נבדקים בקונסול / Network / React DevTools בלבד — זה תקין.
4. כל שלב מסתיים בעץ שמתקמפל (`npm run build` עובר) ובאפליקציה שרצה.

---

## 1. חוקי ברזל

חוקים אלו חלים על כל שלב במסמך. הפרה שלהם היא באג גם אם הקוד עובד.

### 1.1 טכנולוגיה

| נושא | כלל |
| --- | --- |
| שפה | TypeScript בלבד. אין `.js` / `.jsx` בקוד המקור. אין `any` למעט בקאץ' של axios |
| State | **Redux קלאסי בלבד** — `createStore`, `enum ActionType`, `interface Action`, `reducer`. **אין Redux Toolkit, אין `createSlice`, אין `configureStore`, אין `react-redux`** |
| חיבור רכיב ל-Store | `useState` + `store.subscribe()` בתוך `useEffect`, עם `return () => subscription()` לניקוי — בדיוק כמו ב-`docs/front-example` |
| HTTP | axios בלבד. `fetch` אסור |
| Routing | `react-router-dom` v7, `BrowserRouter` |
| טפסים | `react-hook-form` בלבד. אין ולידציה ידנית ב-`onSubmit` |
| בנייה | Vite |

### 1.2 עיצוב

ה-CSS בפרויקט מחולק לשתי שכבות. **ההפרדה ביניהן היא הכלל החשוב ביותר בסעיף הזה.**

#### שכבה 1 — מערכת העיצוב (גלובלית, סגורה)

1. ארבעת קבצי ה-CSS מהפרוטוטייפ מועתקים **כמו שהם** ל-`src/styles/` ומיובאים פעם אחת ב-`main.tsx`. **אין CSS Modules, אין styled-components, אין Tailwind.**
2. השכבה הזו **סגורה לעריכה**. אין לשנות בה שורה, ואין להגדיר מחדש מחלקה שלה בשום קובץ אחר.
3. שמות המחלקות זהים לפרוטוטייפ, אות באות: `.room`, `.bubble`, `.msg--out`, `.composer__send` וכו'. אין להמציא שמות חדשים לדברים שכבר מוגדרים.

#### שכבה 2 — קובץ CSS צמוד לקומפוננטה

4. **לכל קומפוננטה מותר — ובמידת הצורך צריך — קובץ CSS צמוד**, באותה תיקייה ובאותו שם: `RoomCard.tsx` ↔ `RoomCard.css`, מיובא בראש ה-TSX (`import "./RoomCard.css";`). זו הקונבנציה מ-`docs/front-example`.
5. **מה מותר לשים שם:** פריסה פנימית של הקומפוננטה בלבד — grid/flex, סדר, רוחב, ריווח פנימי, `overflow` — כל מה שהוא מבנה של הרכיב הזה ולא חלק משפת העיצוב.
6. **מה אסור לשים שם:**
   - הגדרה מחדש או דריסה של מחלקה מהשכבה הראשונה (`.room`, `.btn`, `.field`…). אם משהו נראה שגוי — הבעיה היא בשם המחלקה או ב-DOM, לא בסטייל החסר.
   - ערך צבע / גודל פונט / מרווח / רדיוס / צל **קשיח**. רק `var(--token)`. `padding: 12px` פסול, `padding: var(--sp-3)` תקין.
   - `!important`.
7. **מניעת התנגשויות:** הקבצים גלובליים, ולכן כל הכללים בקובץ צמוד חייבים להיות מקוננים תחת מחלקת שורש בשם הקומפוננטה ב-PascalCase — בדיוק כמו `.CourseList` ב-`front-example`:
   ```css
   /* RoomList.css */
   .RoomList { display: flex; flex-direction: column; gap: var(--sp-3); }
   .RoomList__footer { padding-block: var(--sp-4); }
   ```
   ה-TSX: `<div className="RoomList">`. שם השורש הזה הוא **נוסף** על מחלקות מערכת העיצוב, לא במקומן.
8. **קובץ ריק לא נוצר.** לרוב הקומפוננטות ב-`component/ui/` לא יהיה קובץ צמוד כלל, כי `components.css` כבר מכסה אותן במלואן. קובץ נוצר רק כשיש מה לכתוב בו.

#### כללים החלים על שתי השכבות

9. אסור לכתוב `left` / `right` / `margin-left` / `padding-right`. רק תכונות לוגיות: `inset-inline-start`, `padding-inline`, `margin-block`. ראה נספח ג'.
10. אסור `style={{ }}` inline ב-TSX, למעט ערך דינמי אמיתי שאין לו טוקן (למשל אחוז התקדמות מחושב).
11. `<html lang="he" dir="rtl">`.
12. פונט Rubik בלבד. כל מספר שנסרק אנכית מקבל `.u-num`.

### 1.3 API

1. הכתובות המדויקות מסעיף 3 בלבד. **אין להמציא endpoint שלא מופיע שם.**
2. `POST /api/user/` ו-`POST /api/room/` — **עם `/` בסוף**. בלעדיו מתקבל 307 מיותר.
3. השרת מחזיר **200 בכל הצלחה**, כולל POST. אין 201, אין 204, אין 404.
4. השרת מחזיר **snake_case**. המרה ל-camelCase מתבצעת אך ורק בשכבת ה-API (נספח א'). מחוץ לשכבה הזו אין `first_name` בקוד.
5. **אין אימות.** אין טוקן, אין `Authorization` header. `userId` מגיע מ-`localStorage` ונשלח כ-path parameter.
6. **חוק ה-Redux (סעיף 27 באפיון):** `API → Redux → UI`. אחרי טעינה ראשונה של אזור מידע, כל עבודה שוטפת מול Redux בלבד. פעולת שינוי מוצלחת מעדכנת את ה-Store ישירות — **לעולם לא `GET` נוסף לרענון.**

### 1.4 סימון TODO

לכל פער מול השרת (סעיף 4) יש מזהה קבוע. בכל מקום בקוד שנוגע בפער יש לכתוב הערה בפורמט:

```ts
// TODO-3: אין ב-Room הודעה אחרונה מהשרת. ראה TASKS-FRONT.md §4
```

### 1.5 שפת הערות בקוד

**כל הערה בקוד המקור (`//`, `/* */`, JSDoc) נכתבת באנגלית בלבד.** מזהי TODO-N/AD-N,
מספרי סעיפים (`§3.2`) ושמות קבצים/רכיבים נשארים כמו שהם. הכלל הזה נקבע באמצע הפרויקט
(לפני שלב 22) — ראה ARCHITECTURE-DECISIONS.md §AD-11. **טקסט פונה למשתמש** (JSX, `aria-label`,
placeholder, הודעות טוסט/שגיאה) **ממשיך להיות בעברית** — הכלל הזה חל רק על הערות, לא על תוכן.

---

## 2. מקורות אמת

| מסמך | תפקיד | מתי לקרוא |
| --- | --- | --- |
| `backend/docs/API SPEC.md` | **מקור אמת יחיד ל-API.** אומת מול הקוד | לפני כל שלב שנוגע בשרת |
| `frontend/docs/DESIGN/DESIGN-SYSTEM.md` | מקור אמת לעיצוב, רכיבים, מצבים וטקסטים | לפני כל שלב UI |
| `frontend/docs/SPECV2-FRONT.md` | אפיון פונקציונלי | לוגיקה, זרימות, מצבים |
| `frontend/docs/DESIGN/*.html` | הפרוטוטייפ — **מקור אמת ל-DOM ולשמות מחלקות** | לפני בניית כל מסך |
| `frontend/docs/DESIGN/ui.js` `screens.js` `icons.js` | הלוגיקה להמרה ל-TS | שלבים 3, 6, 12, 17 |
| `docs/front-example/` | **מקור אמת לסגנון הקוד** — Redux, services, subscribe | שלבים 5, 6, 8, 11 |

**כשיש סתירה:** `API SPEC.md` גובר על `SPECV2-FRONT.md` בכל מה שנוגע לשרת. `DESIGN-SYSTEM.md` גובר על הפרוטוטייפ בכל מה שנוגע לכללים.

---

## 3. מפת ה-API האמיתי

**Base (dev):** `/api` דרך proxy של Vite אל `http://127.0.0.1:8000` — ראה שלב 1.

| # | פעולה | Method | Path | Body | Response |
| --- | --- | --- | --- | --- | --- |
| 1 | הרשמה | POST | `/api/user/` | `{first_name, last_name, phone_number}` | `User` |
| 2 | יצירת חדר | POST | `/api/room/` | `{name, user_list: User[]}` | `{id, name}` |
| 3 | חדרים של משתמש | GET | `/api/room-user/room/{user_id}` | — | `Room[]` |
| 4 | הודעות בחדר | GET | `/api/message/room/{room_id}` | — | `Message[]` |
| 5 | שליחת הודעה | POST | `/api/message/user/{user_id}/other/{other_user_id}` | `{content, room_id?}` | `Message` |

**אזהרות מחייבות:**

- **#2:** כל אובייקט ב-`user_list` חייב את **ארבעת** השדות (`id`, `first_name`, `last_name`, `phone_number`) אחרת 422. המשתמש המחובר **לא** מתווסף אוטומטית — יש לכלול אותו ברשימה. התשובה מכילה רק `id` ו-`name`, **לא** את המשתתפים.
- **#3:** משתמש ללא חדרים מחזיר `[]` עם 200. אין מיון מובטח. אין הודעה אחרונה, אין זמן, אין unread, אין משתתפים.
- **#5:** אם נשלח `room_id` — ההודעה נכנסת לחדר הקיים ו-`other_user_id` **מתעלמים ממנו**. אם `room_id` הוא `null` — **נוצר חדר חדש בכל קריאה**, ללא חיפוש חדר קיים. **כלל: תמיד לשלוח `room_id`.** ראה שלב 15.
- `GET /api/roomuser/{user_id}` **שבור** בשרת. אין להשתמש בו לעולם.

---

## 4. פערים מול האפיון — רשימת TODO סגורה

אלה הדברים שהאפיון דורש והשרת לא מספק. **אין לנסות לממש אותם מול השרת.** לכל אחד יש התנהגות מוגדרת בפרונט.

| מזהה | הפער | ההתנהגות בפרונט |
| --- | --- | --- |
| **TODO-1** | אין `POST /api/user/login` | מסך ההתחברות נבנה במלואו ויזואלית. בשליחה מוצג `.banner--error` עם הסבר וקישור להרשמה. אין קריאת שרת |
| **TODO-2** | אין `DELETE /api/room/{id}` | דיאלוג המחיקה נבנה במלואו. באישור החדר מוסר מ-`RoomStore` ומתווסף לרשימת `hiddenRooms` ב-`localStorage`. טקסט הדיאלוג אומר במפורש שההסתרה היא מקומית |

> **עודכן (AD-8):** `DELETE /api/room/{room_id}` **קיים בפועל** בשרת (לא מתועד ב-`API SPEC.md`, אומת ידנית). TODO-2 נסגר — ראה `ARCHITECTURE-DECISIONS.md` §AD-8. אין יותר `hiddenRooms`; המחיקה אמיתית, בלתי הפיכה ומשותפת לשני הצדדים.
| **TODO-3** | ל-`Room` אין הודעה אחרונה ואין זמן | הודעה אחרונה מוצגת **רק** לחדר שהודעותיו כבר נטענו ל-`MessageStore`. אחרת מוצג `עדיין אין תצוגה מקדימה` במחלקה `u-faint`. **אסור** לבצע `GET` הודעות לכל החדרים במסך הראשי |
| **TODO-4** | ל-`Message` אין `date_time` | זמן נשמר מקומית ב-`localStorage` להודעות שנשלחו מהדפדפן הזה. להודעה היסטורית ללא זמן מוצג `··` בעמודת השעות |
| **TODO-5** | אין ספירת "לא נקרא" | `unread` תמיד `0`. רכיב ה-`.badge` נבנה ונשאר לא מוצג |
| **TODO-6** | אין endpoint שמחזיר משתתפי חדר | מיפוי `roomId → otherUserId` נשמר מקומית בעת יצירת חדר. לחדר שהגיע מהשרת בלי מיפוי מקומי מוצג שם החדר, ואם הוא ריק — `שיחה #{id}` |

> **עודכן (AD-9):** ה-endpoint **קיים בפועל** — כל תגובת `Room` מהשרת כוללת `user_list` מלא
> (לא מתועד ב-`API SPEC.md`, אומת ידנית). TODO-6 נסגר, `roomMeta` הוסר לגמרי. ראה `ARCHITECTURE-DECISIONS.md` §AD-9.
| **TODO-7** | אין `GET /api/user` לרשימת אנשי קשר | רשימת אנשי הקשר היא Mock מקומי — **זו דרישת האפיון עצמו (סעיף 9.1)**, לא פשרה. אך ה-IDs חייבים להיות של משתמשים אמיתיים ב-DB, אחרת יצירת חדר תיפול ב-500. ראה שלב 0 |

---

## 5. מבנה תיקיות יעד

```text
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── styles/
    │   ├── tokens.css
    │   ├── base.css
    │   ├── components.css
    │   └── screens.css
    ├── models/
    │   ├── user.ts
    │   ├── room.ts
    │   ├── message.ts
    │   └── dto.ts
    ├── state/
    │   ├── user-state.ts
    │   ├── room-state.ts
    │   └── message-state.ts
    ├── services/
    │   ├── user-service.ts
    │   ├── room-service.ts
    │   └── message-service.ts
    ├── utils/
    │   ├── app-config.ts
    │   ├── http.ts
    │   ├── mappers.ts
    │   ├── storage.ts
    │   ├── date.ts
    │   ├── avatar.ts
    │   └── Routing.tsx
    ├── data/
    │   └── contacts.ts
    ├── component/
    │   ├── ui/                      ← ברובן ללא CSS צמוד: components.css מכסה אותן
    │   │   ├── icon/Icon.tsx
    │   │   ├── button/Button.tsx
    │   │   ├── field/Field.tsx
    │   │   ├── banner/Banner.tsx
    │   │   ├── avatar/Avatar.tsx
    │   │   ├── dialog/Dialog.tsx
    │   │   ├── toast/Toast.tsx
    │   │   ├── spinner/Spinner.tsx
    │   │   ├── skeleton/Skeleton.tsx
    │   │   └── empty/Empty.tsx
    │   ├── layout/
    │   │   ├── app-shell/  AppShell.tsx  + AppShell.css
    │   │   ├── topbar/     Topbar.tsx
    │   │   ├── user-menu/  UserMenu.tsx
    │   │   └── rail/       Rail.tsx      + Rail.css
    │   ├── auth/
    │   │   ├── register/   Register.tsx
    │   │   └── login/      Login.tsx
    │   ├── room/
    │   │   ├── room-card/         RoomCard.tsx
    │   │   ├── room-list/         RoomList.tsx  + RoomList.css
    │   │   ├── delete-room-dialog/DeleteRoomDialog.tsx
    │   │   └── new-chat-dialog/   NewChatDialog.tsx
    │   ├── chat/
    │   │   ├── chat-route/  ChatRoute.tsx  + ChatRoute.css
    │   │   ├── chat-head/   ChatHead.tsx
    │   │   ├── thread/      Thread.tsx
    │   │   ├── message-item/MessageItem.tsx
    │   │   └── composer/    Composer.tsx
    │   ├── home/HomeRoute.tsx
    │   └── private-route/PrivateRoute.tsx
    └── dev/
        └── Styleguide.tsx      ← נמחק בשלב 22
```

**קבצי ה-CSS הצמודים שמסומנים לעיל הם הערכה מראש, לא רשימה סגורה.** קובץ נוצר רק אם נדרשה פריסה שאין ל-`screens.css` מענה עליה, ולא נוצר קובץ ריק. ההחלטה מתקבלת בשלב עצמו, לפי כלל 8 בסעיף 1.2.

---

## 6. מפת השלבים

| שלב | שם | ויזואלי | תלוי ב- |
| --- | --- | --- | --- |
| 0 | הכנת השרת ומשתמשי הדמו | Swagger | — |
| 1 | תשתית Vite + TS + הרצה ראשונה | ✅ | 0 |
| 2 | הזרקת מערכת העיצוב | ✅ | 1 |
| 3 | רכיב Icon | ✅ | 2 |
| 4 | רכיבי UI בסיסיים | ✅ | 3 |
| 5 | מודלים, DTO ומיפוי | ❌ | 1 |
| 6 | Utils: storage, date, avatar | ❌ | 5 |
| 7 | שכבת HTTP + user-service | ❌ | 5, 6 |
| 8 | `userStore` | ❌ | 5, 6 |
| 9 | Router, PrivateRoute, שלד מסכים | ✅ | 4, 8 |
| 10 | מסך הרשמה — UI | ✅ | 4, 9 |
| 11 | מסך הרשמה — לוגיקה | ✅ | 7, 8, 10 |
| 12 | מסך התחברות | ✅ | 10, 11 |
| 13 | מעטפת האפליקציה: Topbar + Rail | ✅ | 9 |
| 14 | `roomStore` + `roomService` | ❌ | 8 |
| 15 | רשימת שיחות: כרטיס, שלד, ריק, שגיאה | ✅ | 13, 14 |
| 16 | Dialog + Toast | ✅ | 4 |
| 17 | מחיקת שיחה (לחיצה ארוכה) | ✅ | 15, 16 |
| 18 | שיחה חדשה + יצירת חדר | ✅ | 16, 17 |
| 19 | `messageStore` + `messageService` | ❌ | 14 |
| 20 | מסך שיחה: כותרת, thread, פס הזמן | ✅ | 18, 19 |
| 21 | שורת כתיבה ושליחת הודעה | ✅ | 20 |
| 22 | רספונסיביות, נגישות, ניקוי | ✅ | הכל |

---

# שלב 0 — הכנת השרת ומשתמשי הדמו

**מטרה:** שרת עובד + שישה משתמשים אמיתיים ב-DB שישמשו כאנשי הקשר של הפרונט.

**למה זה השלב הראשון:** `POST /api/room/` נופל ב-500 (הפרת Foreign Key) אם נשלח `id` של משתמש שלא קיים. בלי השלב הזה כל מסך "שיחה חדשה" יישבר.

**משימות:**

1. להריץ MySQL ולוודא שקיים סכימה `chat_db`. פרטי החיבור נמצאים ב-`backend/modules/app_config/database.py`.
2. להריץ את השרת מתוך `backend/`:
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
3. לפתוח `http://127.0.0.1:8000/docs` ולוודא שחמשת ה-endpoints מסעיף 3 מופיעים.
4. **אופציונלי:** להריץ `python modules/seed.py` למילוי נתוני בדיקה (1000 משתמשים, 500 חדרים). שים לב שהסקריפט **מוחק את כל הטבלאות** לפני המילוי.
5. ליצור שישה משתמשים דרך `POST /api/user/` — אחד "אני" וחמישה אנשי קשר:

   | תפקיד | first_name | last_name | phone_number |
   | --- | --- | --- | --- |
   | אני | עידן | אייש | 052-1234567 |
   | קשר | יוסי | כהן | 050-1000001 |
   | קשר | נועה | שגב | 050-1000002 |
   | קשר | דני | לוי | 050-1000003 |
   | קשר | משה | ישראלי | 050-1000004 |
   | קשר | רון | אזולאי | 050-1000005 |

6. **לרשום את ששת ה-IDs שהתקבלו.** הם נכנסים ל-`src/data/contacts.ts` בשלב 18.

**בדיקה:**

```bash
curl http://127.0.0.1:8000/api/room-user/room/1
```

מחזיר `[]` או רשימת חדרים, עם קוד 200.

**קריטריון סיום:** השרת עונה, ששת ה-IDs רשומים.

---

# שלב 1 — תשתית Vite + TypeScript + הרצה ראשונה

**מטרה:** אפליקציית React ריקה שרצה על `localhost`, בעברית, RTL, עם Rubik ועם proxy עובד לשרת.

**קבצים:** `frontend/package.json` · `vite.config.ts` · `tsconfig.json` · `index.html` · `src/main.tsx` · `src/App.tsx`

**משימות:**

1. ליצור פרויקט Vite בתיקיית `frontend/` (התיקייה כבר קיימת ומכילה את `docs/` — יש לשמור עליה):
   ```bash
   npm create vite@latest . -- --template react-ts
   ```
2. להתקין תלויות:
   ```bash
   npm i axios react-router-dom react-hook-form redux
   ```
   **לא להתקין:** `@reduxjs/toolkit`, `react-redux`.
3. `index.html`:
   - `<html lang="he" dir="rtl">`
   - `<title>קו</title>`
   - שלושת תגי הפונט של Rubik מ-Google Fonts, בדיוק כפי שמופיעים ב-`docs/DESIGN/chat.html` שורות 7–9.
4. `vite.config.ts` — proxy שעוקף את בעיית ה-CORS (השרת **אינו** מגדיר CORS middleware):
   ```ts
   server: {
     port: 5173,
     proxy: {
       "/api": {
         target: "http://127.0.0.1:8000",
         changeOrigin: true,
       },
     },
   }
   ```
5. `src/App.tsx` — עמוד זמני: `<h1>קו</h1>` + פסקה בעברית.
6. למחוק את `App.css` ואת תוכן `index.css` שנוצרו ע"י התבנית. **אין להשאיר CSS של Vite.**

**בדיקה [ויזואלית]:**

1. `npm run dev` → פתיחת `http://localhost:5173`.
2. הכותרת "קו" מופיעה **בצד ימין** של המסך (RTL עובד).
3. ב-DevTools → Elements → `<html>` יש `dir="rtl"` ו-`lang="he"`.
4. ב-DevTools → Network → Font: נטען קובץ Rubik.
5. בקונסול של הדפדפן:
   ```js
   fetch("/api/room-user/room/1").then(r => r.json()).then(console.log)
   ```
   מחזיר מערך **ללא שגיאת CORS**. זו הבדיקה החשובה בשלב.

**קריטריון סיום:** האפליקציה רצה, RTL עובד, ה-proxy מחזיר נתונים אמיתיים מהשרת.

---

# שלב 2 — הזרקת מערכת העיצוב

**מטרה:** כל ה-CSS של הפרוטוטייפ פעיל באפליקציה, ואפשר לראות את זה.

**קבצים:** `src/styles/tokens.css` `base.css` `components.css` `screens.css` · `src/main.tsx` · `src/dev/Styleguide.tsx`

**משימות:**

1. להעתיק **ללא שינוי** מ-`frontend/docs/DESIGN/` אל `src/styles/`:
   `tokens.css` · `base.css` · `components.css` · `screens.css`
2. לייבא ב-`main.tsx` **בסדר הזה בדיוק** (הסדר מהותי — טוקנים ראשונים):
   ```ts
   import "./styles/tokens.css";
   import "./styles/base.css";
   import "./styles/components.css";
   import "./styles/screens.css";
   ```
3. ליצור `src/dev/Styleguide.tsx` — עמוד בדיקה זמני שמרנדר HTML גולמי (עדיין לא רכיבים):
   - כפתורים: `.btn--primary`, `--secondary`, `--ghost`, `--danger`, `--sm`, `--block`
   - שדה `.field` במצב תקין ובמצב `is-invalid`
   - `.banner--error`
   - `.avatar` בחמשת הגוונים `avatar--1` עד `avatar--5`
   - `.badge`, `.chip`, `.spinner`, `.skeleton`
   - בועות: `.msg--in` ו-`.msg--out` עם `.bubble`
   - כרטיס `.room` במצב מנוחה, `hover`, ו-`aria-current="true"`

   את ה-DOM המדויק להעתיק מ-`docs/DESIGN/styleguide.html`.
4. `App.tsx` מרנדר את `<Styleguide />`.

**בדיקה [ויזואלית]:**

1. הרקע אפור-קריר `#EEF0F5`, לא לבן.
2. הכפתור הראשי כחול קובלט `#22399E`, גובה 48px.
3. השדה במצב `is-invalid` — מסגרת אדומה ורקע ורדרד.
4. הבועה היוצאת (`msg--out`) כחולה ובצד **שמאל**; הנכנסת אפורה בהירה ובצד **ימין**.
5. חמשת האווטארים בחמישה גוונים שונים.
6. ב-DevTools → Elements → `:root` → מופיעים כל טוקני ה-`--color-*`.

**קריטריון סיום:** הסטייל-גייד נראה זהה ל-`docs/DESIGN/styleguide.html` שנפתח ישירות בדפדפן.

---

# שלב 3 — רכיב Icon

**מטרה:** ערכת האייקונים זמינה כרכיב React מוקלד.

**קבצים:** `src/component/ui/icon/Icon.tsx`

**משימות:**

1. להמיר את `docs/DESIGN/icons.js` ל-TS: אובייקט `ICONS` עם **אותם מפתחות ואותם path-ים בדיוק**.
2. `export type IconName = keyof typeof ICONS;`
3. הרכיב:
   ```ts
   type Props = { name: IconName; size?: "sm" | "md" | "lg"; className?: string };
   ```
   מרנדר `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">` עם `dangerouslySetInnerHTML` על ה-path.
   הפרמטרים המדויקים של ה-`<svg>` נלקחים מפונקציית `mountIcons` ב-`docs/DESIGN/ui.js`.
4. **חשוב:** אייקון `send` מסובב ב-`transform: scaleX(-1)`; אייקון `back` מצביע **ימינה**. שני אלה מוגדרים ב-CSS הקיים — אין לגעת בהם ב-TSX.

**בדיקה [ויזואלית]:** להוסיף לסטייל-גייד גלריה של כל האייקונים עם שמותיהם. כולם נראים, אף אחד לא ריק, האייקון `kav` (סימן המותג) מציג קו אנכי עם שתי נקודות.

**קריטריון סיום:** `Object.keys(ICONS).map(...)` מרנדר את כל האייקונים ללא שגיאות טיפוס.

---

# שלב 4 — רכיבי UI בסיסיים

**מטרה:** ספריית הרכיבים הקטנים, לפני שנוגעים בנתונים.

**קבצים:** `src/component/ui/` — `button/Button.tsx` · `field/Field.tsx` · `banner/Banner.tsx` · `avatar/Avatar.tsx` · `spinner/Spinner.tsx` · `skeleton/Skeleton.tsx` · `empty/Empty.tsx`

**משימות:**

1. **`Button`** — המבנה מחייב (סעיף 4.1 ב-DESIGN-SYSTEM):
   ```tsx
   <button className="btn btn--primary">
     <span className="btn__spinner spinner" />
     <span className="btn__label">כניסה</span>
   </button>
   ```
   Props: `variant`, `size`, `block`, `round`, `loading`, `icon`, `disabled`.
   ב-`loading` — `className` מקבל `is-loading`, ה-`disabled` נדלק, `aria-disabled="true"`. **זה המנגנון שמונע שליחה כפולה.**

2. **`Field`** — מבנה: `.field` → `.field__label` → `.field__wrap` (`.input` + `.field__icon`) → `.field__hint` → `.field__error`.
   Props: `label`, `error?`, `hint?`, `icon?`, ו-props של input ב-spread כדי ש-`register()` של RHF יעבוד ישירות.
   כשיש `error`: מוסיף `is-invalid` ל-`.field` ו-`aria-invalid="true"` לקלט.
   **הרכיב חייב לתמוך ב-`forwardRef`** — אחרת RHF לא יוכל לחבר את הקלט.

3. **`Banner`** — `role="alert"`, וריאנטים `--error` / `--warn`, מכיל `.banner__title`, `.banner__text` וכפתור פעולה אופציונלי.

4. **`Avatar`** — ריבוע מעוגל עם ראשי תיבות. הגוון נגזר מהמזהה:
   ```ts
   const tone = `avatar--${(Math.abs(Number(id) || 0) % 5) + 1}`;
   ```
   גדלים: `--sm` · ברירת מחדל · `--lg`.

5. **`Spinner`**, **`Skeleton`** — עטיפות דקות סביב `.spinner` / `.skeleton`.

6. **`Empty`** — `.empty` עם `.empty__mark` (אייקון), `.empty__title`, `.empty__text` וכפתור פעולה אחד.

**בדיקה [ויזואלית]:** לבנות את הסטייל-גייד מחדש — הפעם מהרכיבים ולא מ-HTML גולמי. התוצאה חייבת להיראות **זהה לחלוטין** לשלב 2. אם משהו זז — יש שם מחלקה שגוי.

**קריטריון סיום:** לחיצה על כפתור עם `loading` מציגה ספינר וחוסמת לחיצה נוספת.

---

# שלב 5 — מודלים, DTO ומיפוי [ללא בדיקה ויזואלית]

**מטרה:** גבול ברור בין מה שהשרת מדבר (snake_case) למה שהאפליקציה מדברת (camelCase).

**קבצים:** `src/models/dto.ts` · `user.ts` · `room.ts` · `message.ts` · `src/utils/mappers.ts`

**משימות:**

> **עודכן (AD-6):** ה-DTO והמודלים מומשו כ-`class` ולא כ-`interface`, בסגנון `docs/front-example`,
> ו-`dto.ts` בוטל — כל DTO יושב בקובץ הישות שלו (`user.ts` `room.ts` `message.ts`).
> השדות והשמות בסעיפים 1–4 ובנספח א' תקפים כלשונם. ראה `ARCHITECTURE-DECISIONS.md` §AD-6.

1. `dto.ts` — הטיפוסים **בדיוק כפי שהשרת מחזיר**:
   ```ts
   export interface UserDTO    { id: number; first_name: string; last_name: string; phone_number: string; }
   export interface RoomDTO    { id: number; name: string; }
   export interface MessageDTO { id: number; content: string; room_id: number; user_id: number; is_read: boolean; }
   ```
2. מודלי האפליקציה — ראה נספח א' למיפוי המלא. שדות שאינם מגיעים מהשרת מסומנים אופציונליים ומקבלים הערת TODO.
3. `mappers.ts` — `toUser`, `toRoom`, `toMessage`, וכיוון הפוך `toUserDTO` (נדרש ל-`user_list` ביצירת חדר).
4. **`toUserDTO` חייב להחזיר את ארבעת השדות.** אחרת `POST /api/room/` מחזיר 422.

**בדיקה:** לכתוב בסטייל-גייד קריאה זמנית שממפה אובייקט דמה ומדפיסה לקונסול. הטיפוסים מתקמפלים, אין `first_name` במודל האפליקציה.

**קריטריון סיום:** `npm run build` עובר. אין שדה snake_case מחוץ ל-`dto.ts` ול-`mappers.ts`.

---

# שלב 6 — Utils: storage, date, avatar [ללא בדיקה ויזואלית]

**מטרה:** הפונקציות המשותפות, מומרות מ-`ui.js`.

**קבצים:** `src/utils/storage.ts` · `date.ts` · `avatar.ts` · `app-config.ts`

**משימות:**

1. **`app-config.ts`** — בתבנית של `docs/front-example/src/utils/app-config.ts`:
   ```ts
   class DevAppConfig  { apiAddress = "/api/"; }   // דרך ה-proxy
   class ProdAppConfig { apiAddress = "http://127.0.0.1:8000/api/"; }
   ```

2. **`storage.ts`** — עטיפה מוקלדת ל-`localStorage` עם `try/catch` על `JSON.parse`:
   - `session` — המשתמש המחובר תחת המפתח `"user"`.
   - `hiddenRooms` — `number[]` (TODO-2).
   - `roomMeta` — `Record<roomId, { otherUserId: number; name: string }>` (TODO-6).
   - `messageTimes` — `Record<messageId, string /* ISO */>` (TODO-4).

3. **`date.ts`** — המרה מדויקת של `ui.js`, אותה התנהגות מילה במילה:
   - `formatTime(iso)` → `HH:mm`
   - `formatDate(iso)` → `DD/MM/YYYY`
   - `isSameDay(a, b)`
   - `formatRoomStamp(iso)` → היום ⇒ שעה בלבד, אחרת ⇒ תאריך (סעיף 7.2 באפיון)
   - `formatDayLabel(iso)` → `"היום"` / `"אתמול"` / תאריך

4. **`avatar.ts`** — `initials(name)` ו-`avatarTone(id)`, זהות ל-`ui.js`.

**בדיקה:** בסטייל-גייד להציג טבלה: `formatRoomStamp` על תאריך מהיום → שעה; על אתמול → תאריך. `formatDayLabel` על אתמול → "אתמול".

**קריטריון סיום:** התוצאות זהות למה שהפרוטוטייפ מציג באותם קלטים.

---

# שלב 7 — שכבת HTTP ו-user-service [ללא בדיקה ויזואלית]

**מטרה:** קריאה אמיתית אחת לשרת, מהאפליקציה.

**קבצים:** `src/utils/http.ts` · `src/services/user-service.ts`

**משימות:**

1. `http.ts` — instance של axios:
   ```ts
   export const http = axios.create({
     baseURL: appConfig.apiAddress,
     headers: { "Content-Type": "application/json" },
   });
   ```
   **אין interceptor של Authorization.** אין אימות בשרת.

2. `user-service.ts` — מחלקה עם export של instance יחיד (`export const userService = new UserService()`), בדיוק כמו `docs/front-example/src/services/course-service.ts`:
   ```ts
   public async register(user: NewUser): Promise<User>
   ```
   קורא ל-`POST "user/"` — **עם ה-`/` בסוף**, ממפה DTO→Model ומחזיר.

3. הערה בראש הקובץ: `// TODO-1: אין endpoint להתחברות בשרת. ראה TASKS-FRONT.md §4`

**בדיקה:** כפתור זמני בסטייל-גייד שקורא ל-`register` עם נתוני דמה. ב-Network: קריאת `POST /api/user/` שמחזירה **200** (לא 307!) ובגוף התשובה משתמש עם `id`.

**קריטריון סיום:** משתמש חדש נוצר ב-DB דרך האפליקציה.

---

# שלב 8 — `userStore` [ללא בדיקה ויזואלית]

**מטרה:** ניהול המשתמש המחובר ב-Redux קלאסי + `localStorage`.

**קבצים:** `src/state/user-state.ts`

**משימות (בתבנית `docs/front-example/src/state/auth-state.ts`):**

1. `export class UserState { user: User | null = null; }` — **הקונסטרקטור טוען את המשתמש מ-`localStorage`.** זה מה שמממש את סעיף 4 באפיון: משתמש שמור נטען אוטומטית בפתיחת האפליקציה.
2. `export enum UserActionType { Register = "Register", Login = "Login", Logout = "Logout" }`
3. `export interface UserAction { type: UserActionType; payload: any; }`
4. `export function userReducer(state = new UserState(), action): UserState`
   - `Register` / `Login` → שמירה ב-state **וב-`localStorage`**
   - `Logout` → `localStorage.removeItem("user")` + איפוס
5. `export const userStore = createStore(userReducer);`

**חשוב:** ב-`Logout` יש לאפס גם את `roomStore` ואת `messageStore` ואת דגלי ה-`isFetched` של השירותים (סעיף 21 באפיון). כרגע לרשום `// TODO: להשלים בשלב 14` ולהשלים אז.

**בדיקה:** בקונסול:
```js
userStore.getState()
```
מחזיר את המשתמש. רענון הדף → המשתמש עדיין שם. `localStorage` מכיל מפתח `user` עם JSON תקין.

**קריטריון סיום:** רענון דף שומר על המשתמש.

---

# שלב 9 — Router, PrivateRoute ושלד המסכים

**מטרה:** ניווט עובד בין חמישה מסכים ריקים, עם שמירה על מסלולים מוגנים.

**קבצים:** `src/utils/Routing.tsx` · `src/component/private-route/PrivateRoute.tsx` · `App.tsx` · `main.tsx` + חמישה רכיבי מסך ריקים

**משימות:**

1. `main.tsx` — לעטוף ב-`<BrowserRouter>`.
2. `Routing.tsx` בתבנית `docs/front-example/src/utils/Routing.tsx`:

   | Path | רכיב | מוגן |
   | --- | --- | --- |
   | `/register` | `Register` | לא |
   | `/login` | `Login` | לא |
   | `/` | `HomeRoute` | ✅ |
   | `/chat/:roomId` | `ChatRoute` | ✅ |
   | `*` | הפניה ל-`/` | — |

3. `PrivateRoute` — אם `userStore.getState().user` הוא `null` → `<Navigate to="/login" replace />`. אחרת מרנדר את הילד.
4. חמישה רכיבי מסך זמניים, כל אחד עם כותרת בעברית ושם המסך.
5. `App.tsx` מרנדר `<Routing />` ומשאיר את `/styleguide` כמסלול פיתוח.

**בדיקה [ויזואלית]:**

1. `localStorage.clear()` + מעבר ל-`/` → הפניה אוטומטית ל-`/login`.
2. הזרקה ידנית של משתמש ל-`localStorage` + רענון → `/` נפתח.
3. `/chat/101` נפתח ומציג את מזהה החדר מה-URL.
4. כפתורי הקדימה/אחורה של הדפדפן עובדים.

**קריטריון סיום:** הניווט עובד וההגנה עובדת בשני הכיוונים.

---

# שלב 10 — מסך הרשמה: UI בלבד

**מטרה:** המסך נראה בדיוק כמו הפרוטוטייפ. **בלי לוגיקה, בלי שרת.**

**קבצים:** `src/component/auth/register/Register.tsx`

**משימות:**

1. להעתיק את מבנה ה-DOM מ-`docs/DESIGN/register.html` — הפריסה הדו-פאנלית מסעיף 5.1:
   - **פאנל טופס** (משטח לבן): `.auth__brand` · `.auth__title` · `.auth__lede` · Banner מוסתר · שלושה `.field` · כפתור ראשי `--block` · `.form__alt` עם קישור להתחברות.
   - **פאנל תצוגה** (`.auth__panel`, רקע `--color-canvas-deep`): כותרת גדולה + תצוגה מקדימה סטטית של שיחה על פס הזמן + `.auth__note`.
2. שלושת השדות: שם פרטי, שם משפחה, טלפון. גובה 48px, מרווח `--sp-5` ביניהם.
3. הכפתור: `כניסה` — לא `שלח`, לא `אישור` (סעיף 8 ב-DESIGN-SYSTEM).
4. **עדיין ללא `useForm`.** רק מבנה וסגנון.

**בדיקה [ויזואלית]:** לפתוח את `docs/DESIGN/register.html` בכרטיסייה אחת ואת `/register` בשנייה, ולהשוות זו לצד זו: אותה פריסה, אותם מרווחים, אותם צבעים, פאנל התצוגה בצד שמאל.

**קריטריון סיום:** הבדל ויזואלי לא נראה לעין.

---

# שלב 11 — מסך הרשמה: ולידציה, API, Redux, ניווט

**מטרה:** הרשמה עובדת מקצה לקצה.

**קבצים:** `Register.tsx` · `user-service.ts` · `user-state.ts`

**משימות:**

1. `useForm<NewUser>()` עם `mode: "onBlur"`.
2. כללי ולידציה — **הטקסטים חייבים להיות זהים מילה במילה ל-`RULES` ב-`ui.js`:**

   | שדה | כלל | הודעה |
   | --- | --- | --- |
   | שם פרטי | `required` + לפחות 2 תווים | `יש למלא שם פרטי` / `שם פרטי צריך להכיל שתי אותיות לפחות` |
   | שם משפחה | `required` + לפחות 2 תווים | `יש למלא שם משפחה` / `שם משפחה צריך להכיל שתי אותיות לפחות` |
   | טלפון | `required` + regex | `מספר הטלפון לא תקין. הפורמט הנדרש: 0501234567` |

   הרג'קס מ-`ui.js`: `/^0(5\d|[2-4]|[8-9]|7\d)\d{7}$/` על הערך אחרי הסרת רווחים ומקפים.

3. `onSubmit`:
   - `loading = true` → הכפתור מקבל `is-loading` (**מונע שליחה כפולה**)
   - `await userService.register(data)`
   - הצלחה → `userStore.dispatch({ type: UserActionType.Register, payload: user })` → `navigate("/")`
   - כישלון → `loading = false`, Banner עם `לא ניתן להשלים את ההרשמה. נסה שוב.`, **לא לשמור כלום ב-Redux או ב-localStorage**
4. שגיאת 422 מהשרת: `detail` הוא **מערך**. אין להציג אותו ישירות. למפות לפי `loc[loc.length - 1]` לשדה בטופס.

**בדיקה [ויזואלית]:**

1. שליחה עם שדות ריקים → שלוש שגיאות שדה, מסגרות אדומות, אין קריאת רשת.
2. טלפון `123` → הודעת הטלפון המדויקת.
3. תיקון תוך כדי הקלדה → השגיאה נעלמת.
4. שליחה תקינה → ספינר בכפתור, הכפתור חסום, ואז ניווט ל-`/`.
5. `localStorage.user` מכיל את המשתמש; ב-Network רואים `POST /api/user/` עם 200.
6. לחיצה כפולה מהירה על הכפתור → **קריאת רשת אחת בלבד**.

**קריטריון סיום:** משתמש חדש נרשם, נשמר ומגיע למסך הראשי.

---

# שלב 12 — מסך התחברות

**מטרה:** המסך קיים ויזואלית במלואו, ומסביר בכנות שהוא לא נתמך. **TODO-1.**

**קבצים:** `src/component/auth/login/Login.tsx`

**משימות:**

1. אותה פריסה דו-פאנלית, שדה אחד: טלפון. DOM מ-`docs/DESIGN/login.html`.
2. ולידציה מלאה על הטלפון (אותו כלל, אותה הודעה).
3. `onSubmit` — **אין קריאת שרת**. מציג `Banner --error`:
   > **התחברות אינה זמינה כרגע**
   > השרת עדיין לא תומך בהתחברות לפי מספר טלפון. אפשר להיכנס דרך מסך ההרשמה.

   עם כפתור פעולה `מעבר להרשמה` שמנווט ל-`/register`.
4. הערת `// TODO-1` מעל ה-handler.

**בדיקה [ויזואלית]:** `/login` נראה זהה לפרוטוטייפ. טלפון לא תקין → שגיאת שדה. טלפון תקין → הבאנר מופיע, **ואין שום קריאה ב-Network**. כפתור הבאנר מנווט להרשמה.

**קריטריון סיום:** המסך שלם ולא מבטיח מה שאין.

---

# שלב 13 — מעטפת האפליקציה: Topbar + Rail

**מטרה:** השלד הקבוע של המסכים המחוברים.

**קבצים:** `src/component/layout/app-shell/AppShell.tsx` · `topbar/Topbar.tsx` · `user-menu/UserMenu.tsx` · `rail/Rail.tsx`

**משימות:**

1. `AppShell` — הפריסה מסעיף 5.2 ב-DESIGN-SYSTEM:
   ```text
   .app > .topbar (64px)
        > .workspace > .rail (352px)  |  .main
   ```
   **העמודה נשארת גלויה גם במסך שיחה.** היא מעטפת ולא מסך.
2. `Topbar` — `.brand` (אייקון `kav` + השם "קו") · כפתור `שיחה חדשה` עם אייקון `newchat` · `.user-chip`.
3. `UserMenu` — `.menu__panel` שנפתח מה-chip. מכיל שם, טלפון ו-`.menu__item--danger` ליציאה.
   סגירה ב-`Escape`, בלחיצה מחוץ לתפריט, ועם `aria-expanded` על הטריגר.
4. יציאה: `userStore.dispatch({ type: UserActionType.Logout })` → ניקוי מלא → `navigate("/login")`.
5. `Rail` — `.rail__head` (כותרת + `.rail__count`) + `.rail__body` שיקבל את הרשימה בשלב הבא. כרגע מציג placeholder.
6. `HomeRoute` ו-`ChatRoute` מתעטפים ב-`AppShell`.

**בדיקה [ויזואלית]:**

1. סרגל עליון לבן בגובה 64px, לוגו בצד ימין.
2. עמודה ברוחב 352px ברקע אפור, אזור עבודה לבן — **המעבר בין שני המשטחים נראה בבירור**.
3. לחיצה על ה-chip פותחת תפריט; `Escape` סוגר; לחיצה בחוץ סוגרת.
4. יציאה מנקה את `localStorage` ומנווטת להתחברות.
5. מעבר ל-`/chat/1` — העמודה **נשארת** במקומה.

**קריטריון סיום:** המעטפת יציבה בשני המסכים המוגנים.

---

# שלב 14 — `roomStore` ו-`roomService` [ללא בדיקה ויזואלית]

**מטרה:** רשימת השיחות ב-Redux, עם טעינה **פעם אחת בלבד**.

**קבצים:** `src/state/room-state.ts` · `src/services/room-service.ts` · עדכון `user-state.ts`

**משימות:**

1. `room-state.ts` בתבנית `course-state.ts`:
   ```ts
   export class RoomState { roomList: Room[] = []; }
   export enum RoomActionType { GetRoomList, AddRoom, RemoveRoom, UpdateRoomPreview, Reset }
   ```
   - `UpdateRoomPreview` → מעדכן `lastMessage` + `lastAt` של חדר יחיד (נדרש בשלב 21).
   - **בכל `case` יש ליצור מערך חדש** (`newState.roomList = [...]`), אחרת React לא ירנדר מחדש.
2. `room-service.ts` — singleton עם `isFetched: boolean`:
   ```ts
   public async getRoomList(forceFetch = false): Promise<Room[]>
   ```
   - אם `isFetched === true` ואין `forceFetch` → מחזיר מה-Store **ללא קריאת רשת**. זה לב סעיף 2.2 באפיון.
   - אחרת: `GET room-user/room/{userId}` → מיפוי → dispatch → `isFetched = true`.
   - סינון `hiddenRooms` מה-`localStorage` (TODO-2).
   - העשרה מ-`roomMeta` (TODO-6): `otherUserId` ושם תצוגה. חדר עם `name === ""` וללא meta → `שיחה #{id}`.
   - `public async createRoom(name, other: User): Promise<Room>` — `POST room/` עם `user_list: [toUserDTO(me), toUserDTO(other)]`, שמירת ה-meta מקומית, dispatch של `AddRoom`.
   - `public hideRoom(id: number): void` — TODO-2, מקומי בלבד.
3. להשלים את ה-`Logout` בשלב 8: איפוס `roomStore`, איפוס `messageStore`, `roomService.isFetched = false`.

**בדיקה:** בקונסול —
```js
await roomService.getRoomList();   // רואים קריאת רשת
await roomService.getRoomList();   // אין קריאה נוספת
```
ב-Network רואים **קריאה אחת בלבד**. `roomStore.getState().roomList` מלא.

**קריטריון סיום:** קריאה שנייה לא פוגעת בשרת.

---

# שלב 15 — רשימת שיחות: כרטיס, שלד, ריק, שגיאה

**מטרה:** המסך הראשי חי עם נתונים אמיתיים, בכל ארבעת המצבים.

**קבצים:** `src/component/room/room-card/RoomCard.tsx` · `room-list/RoomList.tsx` · `home/HomeRoute.tsx`

**משימות:**

1. **`RoomCard`** — `<div className="room" role="button" tabIndex={0}>` ולא `<button>` (יש בתוכו כפתור מחיקה). המבנה המדויק נלקח מ-`roomMarkup()` ב-`docs/DESIGN/screens.js`.
   עמודות: `Avatar` · `.room__main` (שם + הודעה אחרונה) · `.room__meta` (שעה + כפתור מחיקה).
   מצבים: מנוחה · `hover` · `aria-current="true"` לפעיל · `is-pressing` ללחיצה ארוכה.
   **TODO-3:** אין הודעה אחרונה מהשרת. אם `room.lastMessage` ריק → `עדיין אין תצוגה מקדימה` עם `u-faint`, והשעה ריקה.
   **TODO-5:** `.badge` נבנה אך `unread` תמיד 0 ולכן לא מוצג.
   נגישות: `Enter` פותח את השיחה.

2. **`RoomList`** — מתחבר ל-Store בדפוס מ-`CourseList.tsx`:
   ```ts
   useEffect(() => {
     const unsubscribe = roomStore.subscribe(() => setRoomList(roomStore.getState().roomList));
     (async () => { ... })();
     return () => unsubscribe();
   }, []);
   ```
   ארבעה מצבים:
   - **טעינה** → 5 × `.room-skeleton`. **לעולם לא ספינר על מסך ריק** (סעיף 7 ב-DESIGN-SYSTEM).
   - **ריק** → `.empty`: `עוד לא התחלת שיחה` + כפתור `שיחה חדשה`.
   - **שגיאה** → `.banner--error`: `לא ניתן לטעון את השיחות. נסה שוב.` + כפתור שקורא `getRoomList(true)`.
   - **נתונים** → רשימת כרטיסים, מיון לפי `lastAt` יורד כשהוא ידוע.

3. `.rail__count` מציג את מספר השיחות.
4. לחיצה על כרטיס → `navigate("/chat/" + room.id)`.

**בדיקה [ויזואלית]:**

1. רענון הדף → שלדים אפורים בצורת הכרטיסים, ואז הכרטיסים האמיתיים.
2. משתמש חדש ללא חדרים → המצב הריק עם הכפתור.
3. עצירת השרת + רענון → הבאנר האדום; הפעלה מחדש + `נסה שוב` → הרשימה חוזרת.
4. מעבר עכבר על כרטיס → הרמה של 1px וצל חזק יותר.
5. כניסה לשיחה וחזרה למסך הראשי → **אין קריאת רשת נוספת** ב-Network.

**קריטריון סיום:** ארבעת המצבים מוצגים נכון, והמעבר בין מסכים לא יוצר קריאות מיותרות.

---

# שלב 16 — Dialog ו-Toast

**מטרה:** שתי שכבות התצוגה שנדרשות לשלבים הבאים.

**קבצים:** `src/component/ui/dialog/Dialog.tsx` · `toast/Toast.tsx`

**משימות:**

1. **`Dialog`** — `.scrim` + `.dialog`:
   - `role="dialog"`, `aria-modal="true"`
   - סגירה ב-`Escape` ובלחיצה על ה-scrim
   - **החזרת מיקוד** לאלמנט שפתח את הדיאלוג בסגירה
   - `.dialog__actions` — כפתורים ברוחב שווה בשורה אחת
   - **הכפתור ההרסני אף פעם לא ראשון בסדר הקריאה** (סעיף 4.7)
2. **`Toast`** — `.toasts` כמכל, `.toast` יחיד, וריאנט `--error`. נעלם אוטומטית אחרי **3.2 שניות**. ניהול פשוט: מערך ב-state של `AppShell` + פונקציית `showToast` שמועברת למטה ב-props.

**בדיקה [ויזואלית]:** בסטייל-גייד — כפתור שפותח דיאלוג. `Escape` סוגר. לחיצה על הרקע סוגרת. המיקוד חוזר לכפתור. כפתור שני מציג טוסט שנעלם לבד.

**קריטריון סיום:** שני הרכיבים עובדים ונגישים במקלדת.

---

# שלב 17 — מחיקת שיחה (לחיצה ארוכה)

> **עודכן (AD-8):** המגבלה שסעיף זה בונה סביבה ("אין DELETE") כבר לא קיימת —
> `DELETE /api/room/{room_id}` עובד בפועל. המימוש בקוד קורא לו במקום להסתיר מקומית.
> ראה `ARCHITECTURE-DECISIONS.md` §AD-8.

**מטרה:** האינטראקציה מסעיף 8 באפיון, עם התנהגות כנה מול מגבלת השרת. **TODO-2.**

**קבצים:** `src/component/room/delete-room-dialog/DeleteRoomDialog.tsx` · `RoomCard.tsx`

**משימות:**

1. **לחיצה ארוכה** על הכרטיס: `onPointerDown` מפעיל טיימר של **550ms**; `onPointerUp` / `onPointerLeave` / `onPointerCancel` מבטלים אותו. במהלך ההמתנה הכרטיס מקבל `is-pressing`.
2. גם כפתור `.room__delete` וגם `Delete` במקלדת פותחים את אותו דיאלוג.
3. תוכן הדיאלוג:
   > **מחיקת השיחה**
   > השיחה עם {שם} תוסתר מהמכשיר הזה. השרת עדיין לא תומך במחיקה, ולכן היא לא תימחק עבור הצד השני.

   כפתורים: `ביטול` (ראשון) ואז `מחיקה` (`--danger`).
4. באישור: `roomService.hideRoom(id)` → הסרה מ-`RoomStore` → הסרת ההודעות מ-`MessageStore` → הוספה ל-`hiddenRooms` ב-`localStorage` → טוסט `השיחה הוסתרה`.
   **אין קריאת רשת. אין `GET` מחדש.**
5. אם החדר שהוסתר הוא החדר הפתוח כרגע → `navigate("/")`.

**בדיקה [ויזואלית]:**

1. לחיצה ארוכה של חצי שנייה → הכרטיס מתכווץ מעט, ואז הדיאלוג נפתח.
2. לחיצה קצרה → **נכנסים לשיחה**, הדיאלוג לא נפתח.
3. `ביטול` → הכרטיס נשאר.
4. `מחיקה` → הכרטיס נעלם מיד, טוסט מופיע, **אין שום קריאה ב-Network**.
5. רענון הדף → הכרטיס עדיין מוסתר.

**קריטריון סיום:** ההסתרה שורדת רענון ומוסברת למשתמש.

---

# שלב 18 — שיחה חדשה ויצירת חדר

**מטרה:** בחירת איש קשר → חדר אמיתי בשרת → מעבר לשיחה.

**קבצים:** `src/data/contacts.ts` · `src/component/room/new-chat-dialog/NewChatDialog.tsx`

**משימות:**

1. **`contacts.ts`** — רשימת ה-Mock מסעיף 9.1 באפיון. **חובה להשתמש ב-IDs האמיתיים שנוצרו בשלב 0:**
   ```ts
   export const CONTACTS: User[] = [
     { id: 2, firstName: "יוסי", lastName: "כהן",     phoneNumber: "050-1000001" },
     // ... חמישה בסך הכל, עם ה-IDs האמיתיים מה-DB
   ];
   ```
   הערה בראש הקובץ: `// TODO-7`.
   **אזהרה:** `id` שאינו קיים ב-DB יגרום ל-500 ב-`POST /api/room/` (הפרת Foreign Key).

2. **`NewChatDialog`** — `.dialog--wide` עם `.contacts`, כל איש קשר ככרטיס `.contact` (Avatar + שם). DOM מ-`docs/DESIGN/new-chat.html`.

3. בחירת איש קשר:
   - הכרטיס נכנס למצב טעינה
   - `roomService.createRoom(fullName, contact)` — `POST /api/room/` עם **שני** המשתמשים ב-`user_list`, כל אחד עם ארבעת השדות
   - הצלחה → `AddRoom` ל-Store → שמירת `roomMeta[roomId] = { otherUserId, name }` → סגירת הדיאלוג → `navigate("/chat/" + room.id)`
   - כישלון → הדיאלוג **נשאר פתוח**, טוסט `לא ניתן ליצור את השיחה. נסה שוב.`, ה-Store לא משתנה

4. **אין `GET` מחדש של רשימת החדרים.** החדר שחזר מהשרת נוסף ישירות.

**בדיקה [ויזואלית]:**

1. `שיחה חדשה` בסרגל העליון → דיאלוג עם חמישה כרטיסי אנשי קשר.
2. בחירת איש קשר → ב-Network `POST /api/room/` עם **200**, גוף התשובה `{id, name}`.
3. החדר מופיע מיד בעמודה עם השם הנכון, ומתבצע מעבר למסך השיחה.
4. **אין `GET /api/room-user/room/...` נוסף אחרי היצירה.**
5. עצירת השרת ובחירה חוזרת → טוסט שגיאה, הדיאלוג נשאר, אין חדר חדש ברשימה.

**קריטריון סיום:** חדר נוצר בשרת ומופיע ב-UI בלי טעינה מחדש.

---

# שלב 19 — `messageStore` ו-`messageService` [ללא בדיקה ויזואלית]

**מטרה:** הודעות ב-Redux, לפי חדר, עם טעינה חד-פעמית לכל חדר.

**קבצים:** `src/state/message-state.ts` · `src/services/message-service.ts`

**משימות:**

1. `message-state.ts`:
   ```ts
   export class MessageState {
     messagesByRoom: Record<number, Message[]> = {};
     loadedRooms:    Record<number, boolean>   = {};
   }
   export enum MessageActionType { GetMessages, AddMessage, ClearRoom, Reset }
   ```
   **בכל `case` יש ליצור אובייקט חדש ומערך חדש** — אחרת אין רינדור מחדש.

2. `message-service.ts` — singleton:
   - `getMessagesByRoom(roomId, force = false)` — אם `loadedRooms[roomId]` → מחזיר מה-Store **ללא רשת**. אחרת `GET message/room/{roomId}` → מיון לפי `id` עולה → מיפוי → dispatch.
   - `sendMessage(roomId, otherUserId, content)` — `POST message/user/{me}/other/{other}` עם `{ content, room_id: roomId }`.
     **`room_id` נשלח תמיד.** שליחה עם `null` יוצרת חדר חדש בכל קריאה — ראה סעיף 3.
   - **TODO-4:** בהצלחה, לשמור `messageTimes[message.id] = new Date().toISOString()` ב-`localStorage` ולהעשיר את המודל ב-`at`.
   - `mine` מחושב ב-mapper: `message.userId === currentUser.id`.

**בדיקה:** בקונסול —
```js
await messageService.getMessagesByRoom(1);   // קריאת רשת
await messageService.getMessagesByRoom(1);   // אין קריאה
```

**קריטריון סיום:** טעינה כפולה של אותו חדר יוצרת קריאת רשת אחת.

---

# שלב 20 — מסך שיחה: כותרת, thread ופס הזמן

**מטרה:** האלמנט החתימתי של המוצר — עמודת השעות עם הקו האנכי.

**קבצים:** `src/component/chat/chat-route/ChatRoute.tsx` · `chat-head/ChatHead.tsx` · `thread/Thread.tsx` · `message-item/MessageItem.tsx`

**משימות:**

1. **`ChatHead`** (`--size-chat-head`, 76px) — חץ חזרה **המצביע ימינה** (מובייל בלבד) · Avatar · `.chat-head__name` בגודל `--fs-lg` · `.chat-head__delete`.
2. **`Thread`** — `.thread` > `.thread__inner`. עמודת השעות ברוחב `--size-gutter` (60px) בצד הסיום, עם הקו האנכי ב-`.thread__inner::before`.
   **זה החריג היחיד המותר למיקום פיזי במערכת** (סעיף 3.2 ב-DESIGN-SYSTEM) — הוא כבר קיים ב-`screens.css`, אין לגעת בו.
   - הקו **לא מצויר כשאין הודעות**.
   - ראש הקו מסומן ב-`.day--start` עם התווית `תחילת השיחה`.
   - מפרידי תאריך `.day` יושבים על הקו כנקודה.
   > **מימוש בפועל:** מפריד יום חדש נפתח רק כששני הצדדים (ההודעה הקודמת וזו הנוכחית)
   > מחזיקים `at` וידוע שהיום שונה. הודעה היסטורית בלי `at` (TODO-4) לא פותחת מפריד —
   > נשארת בקבוצה הקודמת, כדי לא להציג מפרידים שגויים. ראה `Thread.tsx#groupByDay`.
3. **`MessageItem`** — `.msg` + `.msg--in` / `.msg--out` לפי `mine`, `.bubble` עם התוכן, `.msg__time` בעמודת השעות.
   **TODO-4:** להודעה ללא זמן מוצג `··` עם `title="השרת אינו מחזיר זמן הודעה"`.
4. גלילה אוטומטית להודעה האחרונה בטעינה (`scrollIntoView` על עוגן בתחתית).
5. מצבים: שלד `.thread-skeleton` בטעינה · `.empty` בחדר ריק (`עוד לא נשלחו הודעות`) · `.banner--error` בכישלון.
6. **TODO-3:** בכניסה לחדר, אחרי טעינת ההודעות, לעדכן את התצוגה המקדימה ב-`RoomStore` דרך `UpdateRoomPreview`. **זו הדרך היחידה שבה תופיע הודעה אחרונה ברשימת השיחות.**

**בדיקה [ויזואלית]:**

1. כניסה לשיחה קיימת → הודעות נטענות, בועות יוצאות בכחול משמאל, נכנסות באפור מימין.
2. **הקו האנכי רץ לאורך כל השיחה**, וכל שעה יושבת עליו ביישור אחד. השעה חותכת את הקו ברקע בצבע המשטח.
3. חדר ריק → מצב ריק, **בלי קו**.
4. יציאה מהשיחה וחזרה → מיידי, **אין קריאת רשת נוספת**.
5. חזרה למסך הראשי → הכרטיס של אותו חדר מציג עכשיו את ההודעה האחרונה.

**קריטריון סיום:** פס הזמן נראה כמו ב-`docs/DESIGN/chat.html`.

---

# שלב 21 — שורת כתיבה ושליחת הודעה

**מטרה:** לסגור את המעגל — שליחה, עדכון מקומי, בלי fetch חוזר.

**קבצים:** `src/component/chat/composer/Composer.tsx`

**משימות:**

1. **`Composer`** — גובה `--size-composer` (52px), `--border-width-strong`, `--radius-xl`, רקע שקוע שהופך ללבן במיקוד, `--shadow-bar` כלפי מעלה.
   כפתור השליחה **עם התווית "שליחה"**, לא אייקון בלבד (חוק 7 בסעיף 10 ב-DESIGN-SYSTEM). במובייל התווית יורדת והכפתור נשאר ריבוע 52px.
2. ולידציה: `if (!content.trim()) return;` — הודעה ריקה לא נשלחת (סעיף 17 באפיון).
3. זרימת השליחה:
   - ניקוי מיידי של השדה + הצגת ההודעה במצב `.msg--pending` (60% שקיפות, שעה `···`)
   - `await messageService.sendMessage(roomId, otherUserId, content)`
   - **הצלחה:** החלפת ה-pending בהודעה שחזרה מהשרת · `AddMessage` ל-`MessageStore` · `UpdateRoomPreview` ל-`RoomStore` · גלילה לתחתית
   - **כישלון:** ההודעה מקבלת `.msg--failed` עם כפתור `.msg__retry`. **התוכן לא נמחק מהמסך.** טוסט `לא ניתן לשלוח את ההודעה. נסה שוב.`
   > **מימוש בפועל:** ה-pending/failed חיים ב-`MessageStore` עצמו (לא ב-state מקומי של
   > `Composer`) כדי ש-`Thread` — רכיב-אח, לא צאצא — ירנדר אותם בלי prop-drilling.
   > `retry` שומר על אותו `id` (במקום למחוק ולשלוח כהודעה חדשה). ראה ARCHITECTURE-DECISIONS.md §AD-10.
4. **מניעת שליחה כפולה** בזמן שהבקשה בדרך.
5. `Enter` שולח; `Shift+Enter` יורד שורה.
6. **אין `GET` הודעות אחרי שליחה.** ההודעה שחזרה מהשרת נכנסת ישירות ל-Store.
7. `otherUserId` מגיע מ-`room.other?.id` (ראה AD-9 — השרת מחזיר את משתתפי החדר ישירות,
   אין יותר `roomMeta`). הוא `undefined` **רק** בחדר קבוצתי (יותר מ-2 משתתפים), כי אין
   "האחר" יחיד לבחור. במקרה הזה שדה הכתיבה מושבת עם `.composer__error`: `לא ניתן לזהות
   את הנמען בשיחה הזו`.

**בדיקה [ויזואלית]:**

1. הקלדה + `Enter` → ההודעה מופיעה מיד בעמעום, ואז מתייצבת. השדה התנקה.
2. ב-Network: `POST /api/message/user/{me}/other/{other}` עם 200 — **וללא `GET` אחריו**.
3. השעה של ההודעה החדשה מופיעה על פס הזמן.
4. חזרה למסך הראשי → הכרטיס מציג את ההודעה החדשה ואת השעה.
5. שדה ריק + `Enter` → **לא קורה כלום**, אין קריאה.
6. עצירת השרת ושליחה → בועה אדומה עם `נסה שוב`, הטקסט נשמר, טוסט מופיע. הפעלת השרת + `נסה שוב` → ההודעה נשלחת.
7. רענון הדף → ההודעה עדיין שם (היא נשמרה בשרת).

**קריטריון סיום:** מחזור מלא של שליחה עובד ללא קריאת `GET` אחת.

---

# שלב 22 — רספונסיביות, נגישות וניקוי

**מטרה:** לסגור את הפרויקט.

**משימות:**

1. **רספונסיביות** — נקודות השבירה מוגדרות כבר ב-`screens.css`, יש לוודא שה-DOM עומד בהן:
   - מתחת ל-**900px** — פאנל התצוגה במסכי הכניסה נעלם, הטופס תופס את כל הרוחב.
   - מתחת ל-**760px** — מסך אחד בכל רגע: `/` מציג את הרשימה, `/chat/:id` מציג את השיחה עם חץ חזרה. הרכיב הפעיל נקבע לפי המסלול.
2. **נגישות:**
   - מיקוד מקלדת נראה בכל אלמנט אינטראקטיבי
   - כרטיס שיחה: `Enter` פותח, `Delete` פותח דיאלוג מחיקה
   - לכל באנר `role="alert"`, לכל שדה שגוי `aria-invalid`
   - `prefers-reduced-motion` — כבר ממומש ב-`base.css`, יש לוודא שאין אנימציות inline שעוקפות אותו
3. **ניקוי:**
   - מחיקת `src/dev/Styleguide.tsx` ומסלול `/styleguide`
   - הסרת כל `console.log`
   - `npm run build` עובר ללא אזהרות TypeScript
4. **`frontend/README.md`** — הרצה, דרישות מוקדמות (MySQL + השרת על 8000), והסבר על ה-proxy.
5. **`frontend/TODO.md`** — העתקת טבלת הפערים מסעיף 4 עם רשימת המיקומים בקוד שנוגעים בכל פער, כדי שיהיה קל לסגור אותם כשה-endpoints ייכתבו.

**בדיקה [ויזואלית]:**

1. DevTools → 375px → מסך אחד, חץ חזרה עובד, שורת הכתיבה נשארת בגובה 52px.
2. DevTools → 850px → פאנל התצוגה נעלם מ-`/register`.
3. `Tab` לאורך כל האפליקציה — המיקוד תמיד נראה, אף אלמנט לא נדלג.
4. `npm run build && npm run preview` — הכל עובד גם ב-build.

**קריטריון סיום:** הפרויקט עובר build נקי ועובד בכל הרוחבים.

---

# נספח א' — מיפוי DTO ↔ Model

### User

| שרת (`UserDTO`) | אפליקציה (`User`) |
| --- | --- |
| `id` | `id: number` |
| `first_name` | `firstName: string` |
| `last_name` | `lastName: string` |
| `phone_number` | `phoneNumber: string` |

`fullName` הוא getter מחושב, **לא שדה**.

### Room

| שרת (`RoomDTO`) | אפליקציה (`Room`) | מקור |
| --- | --- | --- |
| `id` | `id: number` | שרת |
| `name` | `name: string` | שרת (**יכול להיות `""`**) |
| `user_list` | `userList: User[]` | שרת — ראה ARCHITECTURE-DECISIONS.md §AD-9 |
| — | `other?: User` | מחושב במיפוי: המשתתף היחיד מלבד המשתמש הנוכחי; `undefined` בחדר קבוצתי (יותר מ-2 משתתפים) · AD-9 |
| — | `displayName: string` | מחושב: `name` ← `other.fullName` ← `שיחה #{id}` |
| — | `lastMessage?: string` | `MessageStore` · TODO-3 |
| — | `lastAt?: string` | `messageTimes` מקומי · TODO-3, TODO-4 |
| — | `unread: number` | תמיד `0` · TODO-5 |

### Message

| שרת (`MessageDTO`) | אפליקציה (`Message`) | מקור |
| --- | --- | --- |
| `id` | `id: number` | שרת |
| `content` | `content: string` | שרת |
| `room_id` | `roomId: number` | שרת |
| `user_id` | `userId: number` | שרת |
| `is_read` | `isRead: boolean` | שרת (תמיד `false`) |
| — | `mine: boolean` | מחושב: `userId === currentUser.id` |
| — | `at?: string` | `messageTimes` מקומי · TODO-4 |
| — | `status?: "pending" \| "failed"` | מקומי בזמן שליחה |

---

# נספח ב' — טקסטים קבועים

**אין להמציא נוסח חדש.** כל שינוי כאן מחייב עדכון של סעיף 8 ב-`DESIGN-SYSTEM.md`.

### כפתורים

`כניסה` · `שליחה` · `מחיקה` · `ביטול` · `שיחה חדשה` · `נסה שוב` · `יציאה`

### ולידציה

- `יש למלא {שם השדה}`
- `{שם השדה} צריך להכיל שתי אותיות לפחות`
- `מספר הטלפון לא תקין. הפורמט הנדרש: 0501234567`

### שגיאות מסך

- `לא ניתן לטעון את השיחות. נסה שוב.`
- `לא ניתן ליצור את השיחה. נסה שוב.`
- `לא ניתן לשלוח את ההודעה. נסה שוב.`
- `לא ניתן להשלים את ההרשמה. נסה שוב.`

### מצבים ריקים

- `עוד לא התחלת שיחה` — במסך הראשי
- `עוד לא נשלחו הודעות` — במסך שיחה
- `עדיין אין תצוגה מקדימה` — בכרטיס שיחה שהודעותיו לא נטענו

**אין** התנצלויות, **אין** "אופס", **אין** מונחים טכניים (`404`, `timeout`, `CORS`) מול המשתמש.

---

# נספח ג' — תכונות לוגיות מול תכונות פיזיות

`left` ו-`right` הן תכונות **פיזיות**: הן מצביעות תמיד על אותו צד של המסך, בלי קשר לכיוון הכתיבה. בעברית "התחלה" היא ימין, באנגלית "התחלה" היא שמאל — ותכונה פיזית לא יודעת את זה.

תכונה **לוגית** נפתרת על ידי הדפדפן מול ה-`dir` של ה-`<html>`. בגלל זה לא נדרשים overrides של `[dir="rtl"]` ולא נדרשת היפוך ערכים ידני.

דוגמה מהפרויקט — פס האקסנט של כרטיס שיחה פעיל, שאמור להיות "בקצה ההתחלה", כלומר בימין:

```css
/* ❌ פיזי — הפס יופיע בשמאל */
.room[aria-current="true"] { border-left: 3px solid var(--color-accent); }

/* ✅ לוגי — ימין ב-RTL, שמאל ב-LTR */
.room[aria-current="true"] { border-inline-start: 3px solid var(--color-accent); }
```

### טבלת המרה

| פיזי | לוגי |
| --- | --- |
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` / `padding-right` | `padding-inline-start` / `padding-inline-end` |
| `padding: 0 16px` | `padding-inline: 16px` |
| `left: 0` | `inset-inline-start: 0` |
| `right: 0` | `inset-inline-end: 0` |
| `border-right` | `border-inline-end` |
| `text-align: left` | `text-align: start` |
| `border-radius: 16px 16px 0 16px` | `border-start-start-radius` וכו' |

### שתי הבהרות

1. **`margin-block` הוא הציר האנכי** (top/bottom). הוא לא קשור ל-RTL — הציר האנכי זהה בעברית ובאנגלית. השימוש בו הוא לעקביות, לא תיקון באג. `margin-top: 16px` לא ישבור כלום; `margin-left` כן.
2. **החריג היחיד המותר** במערכת הוא `.thread__inner::before` — הקו האנכי של פס הזמן, שמעוגן פיזית בכוונה כדי להתיישר לעמודת השעות. הוא כבר קיים ב-`screens.css`. אין לגעת בו ואין להעתיק את הדפוס למקום אחר.

---

# נספח ד' — Vite: מה שונה מ-CRA

Vite הוא שני כלים באריזה אחת — שרת פיתוח וכלי בנייה — והוא מחליף את `react-scripts`.

**בפיתוח:** CRA מבנדל את כל האפליקציה עם webpack לפני שהוא מציג משהו. Vite לא מבנדל כלל — הוא מגיש קבצים כ-ESM נייטיבי ומטרנספל כל קובץ רק כשהדפדפן מבקש אותו. התוצאה: עלייה כמעט מיידית ו-HMR שמחליף מודול בודד בלי לאבד state של React.

**בבנייה:** `npm run build` מריץ Rollup ומוציא bundle מוקטן ל-`dist/`.

| | CRA | Vite |
| --- | --- | --- |
| `index.html` | ב-`public/`, עם `%PUBLIC_URL%` | **בשורש**, עם `<script type="module" src="/src/main.tsx">` |
| נקודת כניסה | `src/index.tsx` | `src/main.tsx` |
| קונפיגורציה | מוסתרת, דורשת `eject` | `vite.config.ts` גלוי ועריך |
| משתני סביבה | `process.env.REACT_APP_X` | `import.meta.env.VITE_X` |
| פורט | 3000 | 5173 |
| פקודות | `start` / `build` / `test` | `dev` / `build` / `preview` |

`npm run preview` מגיש את `dist/` הבנוי — לבדיקת פרודקשן לוקאלית.

**למה זה קריטי כאן:** `vite.config.ts` הוא מה שמאפשר את ה-proxy. השרת לא מגדיר CORS middleware, ולכן קריאה מ-`localhost:5173` ל-`127.0.0.1:8000` נחסמת בדפדפן. עם ה-proxy הפרונט קורא ל-`/api/user/` — אותו origin, אין CORS — ו-Vite מעביר את הבקשה בצד השרת ל-FastAPI. זה בדיוק הפתרון שמומלץ בסעיף 1.1 של `API SPEC.md`, בלי לגעת בקוד השרת.
