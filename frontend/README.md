# קו (Kav Chat) — Frontend

צ'אט בצד-לקוח בלבד, React + TypeScript, מול שרת FastAPI קיים. לפרטי הארכיטקטורה, הפערים
מול האפיון והחלטות שהתקבלו תוך כדי הפיתוח ראו `docs/TASKS-FRONT.md` ו-
`docs/ARCHITECTURE-DECISIONS.md`. לפערים פתוחים מול השרת ראו `TODO.md`.

## דרישות מוקדמות

- **Node.js** (לפי `package.json` — Vite 8, React 19).
- **MySQL** רץ, עם סכימה `chat_db` קיימת. פרטי חיבור: `backend/modules/app_config/database.py`.
- **השרת (FastAPI)** רץ על `127.0.0.1:8000` — ראו `backend/docs/API SPEC.md`. הרצה מתוך `backend/`
  (עם venv מותקן לפי `requirements.txt` ו-`.env` מוגדר):

  ```bash
  python main.py
  # או: uvicorn main:app --reload --host 127.0.0.1 --port 8000
  ```

  `main.py` מוסיף בעצמו את `backend/modules/` ל-`sys.path` בתחילת הקובץ, כך שאין
  צורך יותר להגדיר `PYTHONPATH` ידנית כדי שהייבוא של `app_config`, `room`, `user` וכו' יעבוד.

- **שישה משתמשי דמו** קיימים כבר ב-DB (מזהי ה-IDs נמצאים ב-`docs/DEMO-USERS.md` ומקודדים
  ב-`src/data/contacts.ts` — רשימת "אנשי הקשר" היא Mock מקומי, ראה TODO-7 ב-`TODO.md`).
  בלי משתמשים אמיתיים, יצירת חדר (`POST /api/room/`) תיפול ב-500 (הפרת Foreign Key).

## הרצה

```bash
npm install
npm run dev
```

האפליקציה עולה על `http://localhost:5173`.

## Build

```bash
npm run build     # tsc -b && vite build — פלט ל-dist/
npm run preview   # הרצת ה-build המוכן לבדיקה
```

## ה-proxy אל השרת

השרת (FastAPI) לא מגדיר CORS middleware, ולכן קריאה ישירה מ-`localhost:5173` ל-
`127.0.0.1:8000` הייתה נחסמת בדפדפן. הפתרון — proxy של Vite ב-`vite.config.ts`:
כל קריאה ל-`/api/*` מהאפליקציה מנותבת פנימית על-ידי שרת הפיתוח של Vite אל
`http://127.0.0.1:8000`, כך שמבחינת הדפדפן כל הבקשות יוצאות ל-origin אחד (`localhost:5173`)
ואין בעיית CORS בכלל. `changeOrigin: true` מוודא שכותרת ה-`Host` בבקשה שמגיעה לשרת
תואמת ליעד. ראו `src/utils/http.ts` — כל קריאת axios באפליקציה משתמשת ב-`/api` כ-base
URL יחסי, ולעולם לא בכתובת מלאה לשרת.

**שים לב:** ה-proxy עובד רק בסביבת הפיתוח (`npm run dev`). ב-build לפרודקשן
(`npm run build` + `npm run preview` או פריסה אמיתית) צריך פתרון proxy/reverse-proxy
מקביל בצד השרת שמריץ את הקבצים הסטטיים — זה מחוץ לתחום הפרויקט הנוכחי.

## מבנה

ראו `docs/TASKS-FRONT.md` §5 למבנה התיקיות המלא ולהסבר הקונבנציות (CSS דו-שכבתי,
Redux קלאסי, DTO↔Model, מזהי TODO-N בקוד).

## תכונות בזמן-אמת (WebSocket)

מעל ה-REST API נוסף ערוץ WebSocket אחד (`src/services/socket-service.ts`, מתחבר עם
`?token=<jwt>` ומתחדש אוטומטית אחרי ניתוק — `RECONNECT_DELAY_MS = 2000`). עליו בנויים:

- **נוכחות (מחובר/לא מחובר)** — `state/presence-state.ts` + `services/presence-socket-service.ts`.
  מוצג כנקודת סטטוס על `Avatar` ובטקסט "מחובר/ת" / "לא מחובר/ת" ב-`ChatHead`.
- **מקליד/ה עכשיו** — `state/typing-state.ts` + `services/typing-socket-service.ts`.
  `Composer` שולח אירועי typing מוגבלים בקצב (`TYPING_RESEND_MS = 2000`, נעצר מיד
  בשליחה/ריקון/עזיבת הרכיב); מוצג כ-"מקליד/ה…" ב-`ChatHead`.
- **אישורי קריאה** — `services/read-socket-service.ts` מול
  `POST /api/message/room/{room_id}/user/{user_id}/read`. מוצג כ-✓ (נשלח) / ✓✓ כחול
  (נקרא) ב-`MessageItem`.

שלושת אלה נוספו אחרי סנכרון ה-dev האחרון ואינם מתועדים ב-`docs/TASKS-FRONT.md` —
עדכנו את המקום הרלוונטי שם אם עובדים על תיעוד רחב יותר.
