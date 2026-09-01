"""
Seed script for the chat database.

Fills the MySQL database (chat_db) with realistic test data:
    1000 users, 500 rooms, room_user links for every room and every user,
    and 25000 messages sent only by actual members of each room.

Run from the project root:
    python modules/seed.py
"""

import random
import sys
from pathlib import Path

# allow running the file directly (modules/ is the import root of the app)
sys.path.insert(0, str(Path(__file__).resolve().parent))

from sqlmodel import Session, select, delete, func

from app_config.database import engine, create_db_and_tables
from user.user import User
from room.room import Room
from room_user.room_user import RoomUser
from message.message import Message

# ---------- Config ----------

NUM_USERS = 1000
NUM_ROOMS = 500
NUM_MESSAGES = 25000

GROUP_RATIO = 0.6  # 60% of rooms are group chats, the rest are 1-on-1
ACTIVE_RATIO = 0.8  # 80% of rooms are active
READ_RATIO = 0.7  # 70% of messages are already read

BATCH_SIZE = 1000

# ---------- Fake data pools ----------

FIRST_NAMES = [
    "Liam", "Noah", "Oliver", "Elijah", "James", "Aiden", "Lucas", "Mason",
    "Ethan", "Logan", "Emma", "Olivia", "Ava", "Sophia", "Isabella", "Mia",
    "Charlotte", "Amelia", "Harper", "Evelyn", "Mohammed", "Ali", "Omar",
    "Yusuf", "Sara", "Fatima", "Layla", "Nour", "Tamar", "Yael", "Itay",
    "Noa", "Maya", "Lior", "Rotem", "Shira", "Amit", "Guy", "Oren", "Dana",
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Wilson", "Taylor", "Cohen", "Levi", "Mizrahi", "Peretz",
    "Shapiro", "Goldberg", "Abraham", "Hassan", "Ali", "Khan", "Patel",
    "Kim", "Chen", "Wang", "Lopez", "Martinez", "Hernandez", "Gonzalez",
    "Nguyen", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson",
]

MESSAGE_TEMPLATES = [
    "Hey, how are you?",
    "Did you see the game last night?",
    "Can we meet tomorrow?",
    "I'll be there in 10 minutes.",
    "That sounds great!",
    "Are you free this weekend?",
    "Check out this link!",
    "Happy birthday!",
    "Thanks for the help.",
    "No problem at all.",
    "See you soon!",
    "What time works for you?",
    "I just got back home.",
    "Did you finish the project?",
    "Let me know when you arrive.",
    "Good morning everyone!",
    "I'm running a bit late.",
    "Can someone help me with this?",
    "Great work today!",
    "Don't forget about the meeting.",
    "I'll send you the details.",
    "This is really important.",
    "Sounds like a plan.",
    "I agree with you.",
    "Let's talk later.",
    "Call me when you can.",
    "I miss you all!",
    "Where should we eat tonight?",
    "I'm on my way.",
    "We need to talk.",
    "Did you get my message?",
    "Looking forward to it!",
    "I'll be done in an hour.",
    "Can you send me the file?",
    "Thank you so much!",
    "No worries, take your time.",
    "I have a question about this.",
    "Everything is ready.",
    "Let's celebrate!",
    "I can't make it today, sorry.",
]

GROUP_ROOM_NAMES = [
    "Family", "Work Team", "Project Alpha", "Dev Squad", "Weekend Plans",
    "Book Club", "Gym Buddies", "Travel Group", "Study Group", "Friends Forever",
    "Office Chat", "Night Owls", "Morning Run", "Gaming Night", "Movie Night",
    "Tech Talk", "Startup Ideas", "Design Team", "Marketing", "Support Group",
]


def random_phone(index: int) -> str:
    """Unique-by-construction Israeli style phone number."""
    prefix = random.choice(["050", "052", "053", "054", "055", "058"])
    return f"{prefix}-{index:07d}"


def clear_tables(session: Session) -> None:
    """Delete existing rows, children first so the FKs stay happy."""
    for model in (Message, RoomUser, Room, User):
        session.exec(delete(model))
    session.commit()


def seed_users(session: Session) -> list[int]:
    print(f"Seeding {NUM_USERS} users...")
    users = [
        User(
            first_name=random.choice(FIRST_NAMES),
            last_name=random.choice(LAST_NAMES),
            phone_number=random_phone(i),
        )
        for i in range(1, NUM_USERS + 1)
    ]
    session.add_all(users)
    session.commit()
    return list(session.exec(select(User.id)).all())


def seed_rooms(session: Session) -> list[tuple[int, bool]]:
    """Create the rooms and return (room_id, is_group) pairs."""
    print(f"Seeding {NUM_ROOMS} rooms...")
    flags = []
    rooms = []
    for i in range(1, NUM_ROOMS + 1):
        is_group = random.random() < GROUP_RATIO
        name = f"{random.choice(GROUP_ROOM_NAMES)} {i}" if is_group else f"Chat {i}"
        rooms.append(Room(name=name, is_active=random.random() < ACTIVE_RATIO))
        flags.append(is_group)
    session.add_all(rooms)
    session.commit()

    room_ids = list(session.exec(select(Room.id)).all())
    return list(zip(room_ids, flags))


def seed_room_users(session: Session, user_ids: list[int],
                    rooms: list[tuple[int, bool]]) -> dict[int, list[int]]:
    """Link users to rooms. Every room gets members and every user gets a room."""
    print("Linking users to rooms (room_user)...")
    room_members: dict[int, list[int]] = {}

    for room_id, is_group in rooms:
        member_count = random.randint(3, 20) if is_group else 2
        room_members[room_id] = random.sample(user_ids, min(member_count, len(user_ids)))

    # make sure no user is left out of the shared table
    linked = {uid for members in room_members.values() for uid in members}
    orphans = [uid for uid in user_ids if uid not in linked]
    room_ids = [room_id for room_id, _ in rooms]
    for uid in orphans:
        room_id = random.choice(room_ids)
        room_members[room_id].append(uid)

    links = [
        RoomUser(room_id=room_id, user_id=uid)
        for room_id, members in room_members.items()
        for uid in members
    ]
    for start in range(0, len(links), BATCH_SIZE):
        session.add_all(links[start:start + BATCH_SIZE])
        session.commit()

    print(f"  {len(links)} room_user rows "
          f"({len(orphans)} users needed an extra room to be covered)")
    return room_members


def seed_messages(session: Session, room_members: dict[int, list[int]]) -> None:
    print(f"Seeding {NUM_MESSAGES} messages...")
    room_ids = list(room_members.keys())

    batch = []
    for _ in range(NUM_MESSAGES):
        room_id = random.choice(room_ids)
        batch.append(Message(
            content=random.choice(MESSAGE_TEMPLATES),
            room_id=room_id,
            user_id=random.choice(room_members[room_id]),
            is_read=random.random() < READ_RATIO,
        ))
        if len(batch) >= BATCH_SIZE:
            session.add_all(batch)
            session.commit()
            batch = []

    if batch:
        session.add_all(batch)
        session.commit()


def update_room_last_message(session: Session) -> None:
    """Set each room's last_message_id after the bulk message insert (add_massage does this
    one row at a time via the API; seeding bypasses that, so it's redone here in bulk)."""
    print("Updating last_message_id on rooms...")
    last_ids = session.exec(
        select(Message.room_id, func.max(Message.id)).group_by(Message.room_id)
    ).all()
    for room_id, last_message_id in last_ids:
        room = session.get(Room, room_id)
        room.last_message_id = last_message_id
        session.add(room)
    session.commit()


# ---------- Seed ----------

def seed() -> None:
    create_db_and_tables()

    with Session(engine) as session:
        clear_tables(session)
        user_ids = seed_users(session)
        rooms = seed_rooms(session)
        room_members = seed_room_users(session, user_ids, rooms)
        seed_messages(session, room_members)
        update_room_last_message(session)

    print("Done! Database seeded successfully.")


if __name__ == "__main__":
    seed()
