# קו (Kav Chat) — Frontend

צ'אט בצד-לקוח בלבד, React + TypeScript, מול שרת FastAPI קיים. לפרטי הארכיטקטורה, הפערים
מול האפיון והחלטות שהתקבלו תוך כדי הפיתוח ראו `docs/TASKS-FRONT.md` ו-
`docs/ARCHITECTURE-DECISIONS.md`. לפערים פתוחים מול השרת ראו `TODO.md`.

## דרישות מוקדמות

- **Node.js** (לפי `package.json` — Vite 8, React 19).
- **MySQL** רץ, עם סכימה `chat_db` קיימת. פרטי חיבור: `backend/modules/app_config/database.py`.
- **השרת (FastAPI)** רץ על `127.0.0.1:8000` — ראו `backend/docs/API SPEC.md`. הרצה מתוך `backend/`:

  ```bash
  PYTHONPATH=modules uvicorn main:app --reload --host 127.0.0.1 --port 8000
  ```

  `PYTHONPATH=modules` נדרש כי `main.py` מייבא מודולים (`app_config`, `room`, `user`...)
  יחסית לתיקיית `backend/modules/`, לא לתיקיית `backend/` עצמה.

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
