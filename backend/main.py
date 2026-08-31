
import uvicorn
from fastapi import FastAPI

from app_config.database import create_db_and_tables
from room.room_router import router as room_router
from user.user_router import router as user_router
from room_user.room_user_router import router as room_user_router
from message.message_router import router as message_router
from room_user.room_user import RoomUser

app = FastAPI()

if __name__ == "__main__":
    uvicorn.run("main:app",
                host="127.0.0.1",
                port=8000,
                reload=True,
                reload_dirs=["."]
                )
#                 uvicorn main:app --reload --host 127.0.0.1 --port 8000

app.include_router(room_router)
app.include_router(user_router)
app.include_router(room_user_router)
app.include_router(message_router)
# app.include_router(address_router)
# app.include_router(task_router)
# app.include_router(project_router)
# app.include_router(person_project_router)

create_db_and_tables()

