# API – מערכת צ'אט (FastAPI)

מסמך זה מתאר **בדיוק** את ה־API שהשרת מממש כיום (`python_chat/`), כפי שהוא מוגדר בקוד ה־routers.
כל מה שמופיע כאן אומת מול הקוד. מה שלא מופיע כאן – **לא קיים בשרת**.

- גרסת המסמך: 2026-08-20
- מקור האמת בקוד: `python_chat/modules/*/*_router.py`

---

## 1. מידע כללי

| נושא | ערך |
| --- | --- |
| Base URL | `http://127.0.0.1:8000` (זהה ל־`http://localhost:8000`) |
| הרצה | `uvicorn main:app --reload --host 127.0.0.1 --port 8000` מתוך `python_chat/` |
| Content-Type | `application/json` בכל בקשה עם body |
| Swagger UI | `http://127.0.0.1:8000/docs` |
| OpenAPI JSON | `http://127.0.0.1:8000/openapi.json` |
| אימות (Auth) | **אין**. אין טוקנים, אין cookies, אין headers מיוחדים |
| מזהה משתמש | מועבר תמיד כ־path parameter (`user_id`) – הפרונט אחראי לשמור אותו ב־`localStorage` |
| קוד הצלחה | **200** בכל ה־endpoints, כולל POST (לא 201) |

### 1.1 CORS – חובה לשים לב

בשרת **לא מוגדר CORS middleware**.
משמעות: קריאה מהדפדפן מאפליקציית פרונט שרצה על origin אחר (למשל `http://localhost:5173` או `http://localhost:3000`)
תיכשל בדפדפן עם שגיאת CORS, גם אם השרת החזיר 200.

עד שיתווסף middleware בצד השרת (ראו סעיף 7), הפרונט חייב אחת מהאפשרויות:

- להגדיר **proxy** בשרת הפיתוח (Vite / CRA) שיעביר `/api/*` ל־`http://127.0.0.1:8000`.
- או להגיש את קבצי הפרונט מאותו origin.

### 1.2 Trailing slash

שני endpoints מוגדרים עם `/` בסוף: `POST /api/user/` ו־`POST /api/room/`.
פנייה ללא ה־`/` (למשל `POST /api/user`) תחזיר **307 Temporary Redirect** ל־URL עם ה־`/`.
`fetch` ו־`axios` עוקבים אחרי 307 ושומרים על ה־method וה־body, אך זו קריאה מיותרת –
**יש לפנות תמיד ל־URL המדויק כפי שמופיע במסמך**.

---

## 2. מודלים (Schemas)

השדות הם בדיוק כפי שהשרת מחזיר – **snake_case**, ללא עטיפה נוספת (אין `data` / `result`).

### 2.1 User

```json
{
  "id": 1,
  "first_name": "Dana",
  "last_name": "Cohen",
  "phone_number": "050-0000001"
}
```

| שדה | טיפוס | הערות |
| --- | --- | --- |
| `id` | int | מזהה, נוצר בשרת |
| `first_name` | string | חובה, ללא ולידציית אורך בשרת |
| `last_name` | string | חובה, ללא ולידציית אורך בשרת |
| `phone_number` | string | חובה. **אין אילוץ ייחודיות** – אפשר לרשום פעמיים אותו טלפון |

### 2.2 Room

```json
{
  "id": 12,
  "name": "Work Team"
}
```

| שדה | טיפוס | הערות |
| --- | --- | --- |
| `id` | int | מזהה |
| `name` | string | שם החדר. **יכול להיות מחרוזת ריקה** `""` בחדר שנוצר אוטומטית משליחת הודעה |

> שדה `is_active` קיים בטבלה אך **אינו מוחזר** ב־API. השרת תמיד מציב `true` ביצירת חדר.
> אין ב־Room שדות של הודעה אחרונה / זמן / משתתפים – ראו סעיף 6.

### 2.3 Message

```json
{
  "id": 501,
  "content": "שלום, מה נשמע?",
  "room_id": 12,
  "user_id": 1,
  "is_read": false
}
```

| שדה | טיפוס | הערות |
| --- | --- | --- |
| `id` | int | מזהה, וגם סדר כרונולוגי בפועל (עולה) |
| `content` | string | תוכן ההודעה |
| `room_id` | int | החדר שאליו שייכת ההודעה |
| `user_id` | int | **השולח** |
| `is_read` | bool | תמיד `false` בהודעה חדשה. **אין endpoint לעדכון הערך** |

> **אין שדה תאריך/שעה בהודעה.** השדה `date_time` מוער בקוד (`message.py`).
> לכן אי אפשר להציג זמן הודעה מהשרת – יש להציג זמן מקומי בצד הפרונט או לבקש הוספת השדה בשרת.

---

## 3. Endpoints

סיכום מהיר:

| # | Method | Path | תיאור | סטטוס |
| --- | --- | --- | --- | --- |
| 1 | POST | `/api/user/` | הרשמת משתמש | ✅ עובד |
| 2 | POST | `/api/room/` | יצירת חדר עם רשימת משתתפים | ✅ עובד |
| 3 | GET | `/api/room-user/room/{user_id}` | רשימת החדרים של משתמש | ✅ עובד |
| 4 | GET | `/api/message/room/{room_id}` | כל ההודעות בחדר | ✅ עובד |
| 5 | POST | `/api/message/user/{user_id}/other/{other_user_id}` | שליחת הודעה | ✅ עובד |
| 6 | GET | `/api/roomuser/{user_id}` | – | ❌ **שבור, אין להשתמש** (סעיף 3.6) |

---

### 3.1 הרשמת משתמש

```http
POST /api/user/
```

**Request Body**

```json
{
  "first_name": "Dana",
  "last_name": "Cohen",
  "phone_number": "050-1234567"
}
```

כל שלושת השדות חובה. שדות נוספים שיישלחו – יתעלמו מהם.

**Response – 200**

```json
{
  "id": 1,
  "first_name": "Dana",
  "last_name": "Cohen",
  "phone_number": "050-1234567"
}
```

**שגיאות**

| קוד | מתי |
| --- | --- |
| 422 | שדה חובה חסר או טיפוס שגוי |
| 500 | תקלת DB |

**הערות לפרונט**

- אין בדיקת כפילות טלפון – אותו מספר יכול להירשם שוב ויקבל `id` חדש.
- יש לשמור את אובייקט התשובה כולו ב־Redux + `localStorage`; ה־`id` נדרש כמעט לכל קריאה אחרת.

**דוגמה**

```bash
curl -X POST http://127.0.0.1:8000/api/user/ -H "Content-Type: application/json" -d "{\"first_name\":\"Dana\",\"last_name\":\"Cohen\",\"phone_number\":\"050-1234567\"}"
```

---

### 3.2 יצירת חדר

```http
POST /api/room/
```

**Request Body**

```json
{
  "name": "Work Team",
  "user_list": [
    { "id": 1, "first_name": "Dana", "last_name": "Cohen", "phone_number": "050-1234567" },
    { "id": 2, "first_name": "Ari",  "last_name": "Levi",  "phone_number": "052-7654321" }
  ]
}
```

| שדה | טיפוס | חובה | הערות |
| --- | --- | --- | --- |
| `name` | string | כן | שם החדר |
| `user_list` | array של User | כן | רשימת המשתתפים |

⚠️ **חשוב:** כל אובייקט ב־`user_list` חייב לכלול את **ארבעת** השדות (`id`, `first_name`, `last_name`, `phone_number`),
אחרת תוחזר 422 – למרות שהשרת בפועל משתמש רק ב־`id` כדי ליצור את שורות הקישור `room_user`.
המשתמש המחובר **אינו** מתווסף אוטומטית – יש לכלול אותו ברשימה בעצמו.

**Response – 200**

```json
{ "id": 12, "name": "Work Team" }
```

התשובה מכילה רק `id` ו־`name` – **לא** את רשימת המשתתפים.

**שגיאות**

| קוד | מתי |
| --- | --- |
| 422 | `name` חסר, `user_list` חסר, או משתמש ברשימה ללא כל השדות |
| 500 | `id` של משתמש שאינו קיים ב־DB (הפרה של Foreign Key) |

**הערות לפרונט**

- אין בדיקת כפילות: קריאה חוזרת עם אותם משתתפים תיצור חדר **נוסף**.
- אין ולידציה של רשימה ריקה: `"user_list": []` ייצור חדר ללא משתתפים, והוא לא יופיע לאף אחד ב־`GET /api/room-user/room/{user_id}`.
- לאחר הצלחה יש להוסיף את החדר שחזר ל־`RoomStore` ללא קריאת GET נוספת.

**דוגמה**

```bash
curl -X POST http://127.0.0.1:8000/api/room/ -H "Content-Type: application/json" -d "{\"name\":\"Work Team\",\"user_list\":[{\"id\":1,\"first_name\":\"Dana\",\"last_name\":\"Cohen\",\"phone_number\":\"050-1234567\"},{\"id\":2,\"first_name\":\"Ari\",\"last_name\":\"Levi\",\"phone_number\":\"052-7654321\"}]}"
```

---

### 3.3 רשימת החדרים של משתמש

```http
GET /api/room-user/room/{user_id}
```

**Path Parameters**

| פרמטר | טיפוס | תיאור |
| --- | --- | --- |
| `user_id` | int | מזהה המשתמש המחובר |

**Response – 200**

```json
[
  { "id": 12, "name": "Work Team" },
  { "id": 13, "name": "" }
]
```

**שגיאות**

| קוד | מתי |
| --- | --- |
| 422 | `user_id` אינו מספר |
| 500 | תקלת DB |

**הערות לפרונט**

- משתמש שאינו קיים / ללא חדרים מחזיר **`[]` עם קוד 200** – לא 404.
- **אין מיון מובטח** ואין pagination. בפועל הסדר הוא לפי סדר שורות ה־`room_user`.
- אין בתשובה הודעה אחרונה, זמן, מספר הודעות שלא נקראו או רשימת משתתפים.
  מסך רשימת השיחות צריך להרכיב את המידע הזה בעצמו (למשל ע"י `GET` הודעות לפי חדר) או להסתפק בשם החדר.
- חדר שנוצר משליחת הודעה ללא `room_id` יגיע עם `"name": ""` – יש לטפל בתצוגה (למשל להציג את שם איש הקשר).

**דוגמה**

```bash
curl http://127.0.0.1:8000/api/room-user/room/1
```

---

### 3.4 הודעות לפי חדר

```http
GET /api/message/room/{room_id}
```

**Path Parameters**

| פרמטר | טיפוס | תיאור |
| --- | --- | --- |
| `room_id` | int | מזהה החדר |

**Response – 200**

```json
[
  { "id": 501, "content": "היי", "room_id": 12, "user_id": 1, "is_read": false },
  { "id": 502, "content": "מה נשמע?", "room_id": 12, "user_id": 2, "is_read": false }
]
```

**שגיאות**

| קוד | מתי |
| --- | --- |
| 422 | `room_id` אינו מספר |
| 500 | תקלת DB |

**הערות לפרונט**

- חדר לא קיים / ריק מחזיר **`[]` עם קוד 200**.
- מוחזרות **כל** ההודעות בחדר, ללא pagination וללא הגבלה. בחדר עמוס זו תשובה כבדה.
- אין בדיקת הרשאה – כל אחד יכול לקרוא הודעות של כל חדר.
- זיהוי "ההודעה שלי" מול "הודעה של האחר" נעשה בפרונט: השוואת `user_id` ל־`id` של המשתמש המחובר.
- הסדר בפועל הוא לפי `id` עולה. אם רוצים ביטחון – למיין בפרונט לפי `id`.

**דוגמה**

```bash
curl http://127.0.0.1:8000/api/message/room/12
```

---

### 3.5 שליחת הודעה

```http
POST /api/message/user/{user_id}/other/{other_user_id}
```

**Path Parameters**

| פרמטר | טיפוס | תיאור |
| --- | --- | --- |
| `user_id` | int | מזהה המשתמש **השולח** (המחובר) |
| `other_user_id` | int | מזהה המשתמש המקבל |

**Request Body**

```json
{
  "content": "שלום, מה נשמע?",
  "room_id": 12
}
```

| שדה | טיפוס | חובה | הערות |
| --- | --- | --- | --- |
| `content` | string | כן | תוכן ההודעה |
| `room_id` | int \| null | לא (ברירת מחדל `null`) | קובע את התנהגות השרת – ראו למטה |

**שתי התנהגויות שונות – קריטי:**

1. **`room_id` נשלח (לא null)** – ההודעה נוספת לחדר הקיים.
   `other_user_id` **מתעלמים ממנו לחלוטין**, ולא נבדקת חברות בחדר.
2. **`room_id` הוא `null` / לא נשלח** – השרת יוצר **חדר חדש** עם `name: ""`,
   מקשר אליו את `user_id` ואת `other_user_id`, ומכניס אליו את ההודעה.
   ⚠️ אין חיפוש של חדר קיים בין שני המשתמשים – **כל קריאה כזו יוצרת חדר חדש נוסף**.

**כלל עבודה לפרונט:** לשלוח `room_id: null` **רק** בהודעה הראשונה בשיחה חדשה,
ומיד לשמור את ה־`room_id` שחזר בתשובה ולהשתמש בו בכל ההודעות הבאות.

**Response – 200**

```json
{
  "id": 503,
  "content": "שלום, מה נשמע?",
  "room_id": 12,
  "user_id": 1,
  "is_read": false
}
```

השרת קובע תמיד: `user_id` = ה־`user_id` שב־path, `is_read` = `false`.

**שגיאות**

| קוד | מתי |
| --- | --- |
| 422 | `content` חסר, או `user_id` / `other_user_id` שאינם מספרים |
| 500 | `room_id: null` עם `user_id` / `other_user_id` שלא קיימים ב־DB (הפרת FK) |

**הערות לפרונט**

- החדר החדש חוזר עם שם ריק; אם רוצים שם משמעותי – עדיף ליצור את החדר תחילה דרך `POST /api/room/` ואז לשלוח הודעות עם `room_id`.
- לאחר הצלחה: להוסיף את ההודעה שחזרה ל־`MessageStore` תחת ה־`room_id` שחזר, ואם נוצר חדר חדש – להוסיף אותו ל־`RoomStore` (`name: ""`).

**דוגמאות**

הודעה לחדר קיים:

```bash
curl -X POST http://127.0.0.1:8000/api/message/user/1/other/2 -H "Content-Type: application/json" -d "{\"content\":\"hi\",\"room_id\":12}"
```

הודעה ראשונה שיוצרת חדר:

```bash
curl -X POST http://127.0.0.1:8000/api/message/user/1/other/2 -H "Content-Type: application/json" -d "{\"content\":\"hi\"}"
```

---

### 3.6 ❌ `GET /api/roomuser/{user_id}` – שבור, אין להשתמש

ב־`room_router.py` מוגדר:

```python
@router.get("user/{user_id}", ...)   # חסר "/" בתחילת ה-path
```

בגלל ה־`/` החסר, ה־path בפועל שנרשם הוא `/api/roomuser/{user_id}` (ולא `/api/room/user/{user_id}`),
וגם אם פונים אליו הוא קורס עם **500** כי `room_service.get_room_list_by_user` אינו קיים.

**במקומו יש להשתמש ב־`GET /api/room-user/room/{user_id}` (סעיף 3.3).**

---

## 4. מבנה שגיאות

### 4.1 שגיאת ולידציה – 422

זהו הפורמט הסטנדרטי של FastAPI:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "phone_number"],
      "msg": "Field required",
      "input": { "first_name": "Dana", "last_name": "Cohen" }
    }
  ]
}
```

`detail` הוא **מערך**. אין להציג אותו ישירות למשתמש – יש למפות לפי `loc[-1]` לשדה בטופס.

### 4.2 שגיאת שרת – 500

השרת מחזיר `Internal Server Error` ללא JSON מובנה.
בפרונט יש להציג הודעה גנרית ("אירעה שגיאה, נסה שוב").

### 4.3 מה **לא** קיים

- אין 401 / 403 (אין אימות).
- **אין 404** באף endpoint. מזהה שאינו קיים מחזיר `[]` או 500, לפי ה־endpoint.
- אין 201 ואין 204.
- אין גוף שגיאה אחיד – יש לבדוק `response.ok` / `status` ולא להסתמך על מבנה השגיאה.

---

## 5. תרחישי עבודה מלאים

### 5.1 הרשמה והתחברות

```text
POST /api/user/  →  שמירת ה-User ב-Redux + localStorage
```

**אין endpoint להתחברות** (ראו סעיף 6). מסך "התחברות" לא ניתן לממש מול השרת הנוכחי.

### 5.2 טעינת רשימת השיחות (פעם אחת)

```text
GET /api/room-user/room/{user_id}  →  RoomStore.rooms, isLoaded = true
```

מעבר חוזר למסך לא יבצע קריאה נוספת אם `isLoaded === true`.

### 5.3 כניסה לשיחה

```text
GET /api/message/room/{room_id}  →  MessageStore.byRoomId[room_id]
```

לטעון רק אם החדר עוד לא נטען ל־Store.

### 5.4 שיחה חדשה עם איש קשר

```text
אפשרות א' (מומלצת – שם לחדר):
  POST /api/room/  { name, user_list: [me, other] }  →  RoomStore += room
  POST /api/message/user/{me}/other/{other}  { content, room_id: room.id }

אפשרות ב' (מהירה – שם ריק):
  POST /api/message/user/{me}/other/{other}  { content }         (ללא room_id)
  →  התשובה מכילה room_id של חדר חדש → RoomStore += { id: room_id, name: "" }
```

### 5.5 שליחת הודעה בשיחה קיימת

```text
POST /api/message/user/{me}/other/{other}  { content, room_id }
→  MessageStore.byRoomId[room_id] += message
```

---

## 6. פערים בין אפיון הפרונט לשרת (חסר בשרת)

הדברים הבאים מופיעים ב־`SPECV2-FRONT.md` אך **אינם קיימים** בשרת. אי אפשר לממש אותם עד שיפותחו:

| מה שהאפיון דורש | סטטוס בשרת |
| --- | --- |
| `POST /api/user/login` (התחברות לפי טלפון) | ❌ לא קיים |
| `DELETE /api/room/{id}` (מחיקת שיחה) | ❌ לא קיים |
| רשימת משתמשים / אנשי קשר לבחירה ביצירת שיחה | ❌ אין `GET /api/user` |
| הודעה אחרונה + זמן ההודעה האחרונה ברשימת השיחות | ❌ אין שדות כאלה ב־Room ואין תאריך בהודעה |
| שעת הודעה בבועת ההודעה (`12:45`) | ❌ אין `date_time` ב־Message |
| סימון הודעה כנקראה | ❌ `is_read` נכתב אך אין endpoint לעדכונו |
| רשימת משתתפי חדר / שם איש הקשר בשיחה 1:1 | ❌ אין endpoint שמחזיר את המשתתפים |

**המלצה:** לממש בפרונט מול מה שקיים (סעיפים 3.1–3.5), ולסמן את המסכים התלויים בפערים כ־TODO,
או להוסיף את ה־endpoints החסרים בשרת.

---

## 7. תיקונים נדרשים בשרת (לידיעת הפרונט)

1. **CORS** – בלעדיו הפרונט לא יוכל לעבוד מהדפדפן ב־origin נפרד:

   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

2. **הראוט השבור** ב־`room_router.py` – `@router.get("user/{user_id}")` צריך להיות `"/user/{user_id}"`,
   וגם אז חסרה המתודה `get_room_list_by_user` ב־`RoomService`.

3. **`date_time` בהודעה** – השדה מוער ב־`message.py`; בלעדיו אין תצוגת זמן.

---

## 8. טבלת סיכום ל־Copy/Paste

| פעולה | Method | URL מלא | Body | Response |
| --- | --- | --- | --- | --- |
| הרשמה | POST | `http://127.0.0.1:8000/api/user/` | `{first_name, last_name, phone_number}` | `User` |
| יצירת חדר | POST | `http://127.0.0.1:8000/api/room/` | `{name, user_list: User[]}` | `Room` |
| חדרים של משתמש | GET | `http://127.0.0.1:8000/api/room-user/room/{user_id}` | – | `Room[]` |
| הודעות בחדר | GET | `http://127.0.0.1:8000/api/message/room/{room_id}` | – | `Message[]` |
| שליחת הודעה | POST | `http://127.0.0.1:8000/api/message/user/{user_id}/other/{other_user_id}` | `{content, room_id?}` | `Message` |
