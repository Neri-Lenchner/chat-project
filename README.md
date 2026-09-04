# Kav Chat (chat_project)

A real-time 1:1 chat application: register/login by phone number, start conversations with contacts, send messages, and see typing indicators, read receipts, and online/offline presence live over a WebSocket.

- **Backend**: Python, FastAPI, SQLModel (SQLAlchemy) over MySQL, JWT auth, native WebSockets.
- **Frontend**: React 19 + TypeScript, Vite, Redux, React Router, React Hook Form, Axios.

## Project layout

```
chat_project/
├── backend/            FastAPI app
│   ├── main.py         App entrypoint (mounts routers, creates DB tables)
│   ├── modules/        Feature modules (see below)
│   ├── requirements.txt
│   └── .env.example    DB + JWT config template
├── frontend/           React + Vite SPA
│   ├── src/
│   │   ├── component/  UI components (auth, chat, room, layout, shared ui/)
│   │   ├── services/   Axios REST clients + WebSocket clients
│   │   ├── state/      Redux state slices
│   │   ├── models/     TypeScript domain types
│   │   └── utils/      Routing, JWT/storage helpers, config
│   └── docs/           Design system, architecture decisions, demo users
├── docs/               Reference/example front-end material
└── spec-front.md       Original Hebrew front-end spec
```

### Backend modules (`backend/modules/`)

Each domain has its own folder with a model, a service (business logic), and a router (HTTP endpoints), following the same pattern:

| Module | Responsibility |
|---|---|
| `user` | Registration, login (JWT issuance), lookup by phone |
| `room` | Conversations ("rooms") between two users — create, list, delete |
| `room_user` | Join table linking users to rooms; contact resolution |
| `message` | Sending/listing messages, marking a room as read |
| `ws` | WebSocket endpoint; connection manager tracks who's online and relays typing/presence/read/message events |
| `auth` | JWT token creation/decoding |
| `app_config` | DB engine/session setup, reads `.env` |
| `utils` | Shared error types, error-handler middleware, validators, DTO mixin |

No migration framework is used (`SQLModel.metadata.create_all` only creates missing tables — it won't alter existing ones), so schema changes to existing models require a manual `ALTER TABLE`.

### API surface

All REST endpoints are prefixed `/api/...`; the WebSocket is `/api/ws/`.

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/user/` | Register |
| `POST` | `/api/user/login` | Login (returns JWT) |
| `GET` | `/api/user/phone/{phone_number}` | Look up a user by phone |
| `GET` | `/api/room/user/{user_id}` | List a user's rooms |
| `POST` | `/api/room/` | Create a room (1:1 conversation) |
| `DELETE` | `/api/room/{room_id}/user/{user_id}` | Remove a user from a room |
| `GET` | `/api/room-user/room/{user_id}` | List rooms via the room_user join |
| `POST` | `/api/message/user/{user_id}/other/{other_user_id}` | Send a message |
| `GET` | `/api/message/room/{room_id}` | List messages in a room |
| `POST` | `/api/message/room/{room_id}/user/{user_id}/read` | Mark a room's messages as read |
| `WS` | `/api/ws/?token=<jwt>` | Real-time channel (see below) |

Full request/response shapes are documented in `backend/docs/API SPEC.md`.

### Real-time (WebSocket) events

The client authenticates the socket with a JWT (`?token=`). Server → client push events:

- `presence_snapshot` — sent once on connect, lists which contacts are currently online
- `presence` — a contact came online/offline
- `typing` — a contact started/stopped typing in a shared room
- `read` — the other user read a room's messages
- (new messages are pushed as they're created)

Client → server: `{"type": "typing", "room_id": ..., "is_typing": true|false}`.

The frontend's `socket-service.ts` auto-reconnects (2s delay) if the connection drops.

## Running locally

### Backend

```bash
cd backend
# create/activate a virtualenv, then:
pip install -r requirements.txt
cp .env.example .env   # fill in DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, JWT_SECRET
python main.py          # or: uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Requires a running MySQL server matching the `.env` credentials; tables are created automatically on startup. `backend/modules/seed.py` can seed sample data but **drops all tables first** — don't run it against real data.

### Frontend

```bash
cd frontend
npm install
npm run dev      # Vite dev server
npm run build    # type-check + production build
```

The frontend expects the backend at `http://localhost:8000` (see `frontend/src/utils/app-config.ts`).

## Further docs

- `backend/docs/API SPEC.md` — full REST API reference
- `frontend/docs/ARCHITECTURE-DECISIONS.md`, `frontend/docs/SPECV2-FRONT.md`, `frontend/docs/TASKS-FRONT.md` — frontend design/architecture notes
- `frontend/docs/DEMO-USERS.md` — sample contact IDs used by the mock contact list (`frontend/src/data/contacts.ts`)
- `spec-front.md` — original functional spec (Hebrew)
