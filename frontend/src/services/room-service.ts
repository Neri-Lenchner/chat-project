import {http} from "../utils/http";
import {Room, RoomDTO} from "../models/room";
import {User} from "../models/user";
import {toRoom, toRoomCreateDTO} from "../utils/mappers";
import {RoomActionType, roomStore} from "../state/room-state";
import {userStore} from "../state/user-state";
import {messageService} from "./message-service";

/* Following the docs/front-example/src/services/course-service.ts pattern.
   Section 2.2 of the spec: one initial call per data area, and from then on work against Redux only. */

class RoomService {

    public isFetched: boolean = false;

    public async getRoomList(forceFetch: boolean = false): Promise<Room[]> {
        if (!this.isFetched || forceFetch) {
            const user = userStore.getState().user;
            if (!user) {
                return roomStore.getState().roomList;
            }
            try {
                /* The server sorts by descending id (the most recently created room first) — no
                   client-side sort is needed. See backend/docs/API SPEC.md §3.3.
                   The server also attaches the user_list of each room — TODO-6 is closed,
                   there's no more local roomMeta. See ARCHITECTURE-DECISIONS.md §AD-9. */
                const response = await http.get<RoomDTO[]>("room-user/room/" + user.id);

                const roomList = response.data.map(roomDto => toRoom(roomDto, user.id));

                this.isFetched = true;
                roomStore.dispatch({type: RoomActionType.GetRoomList, payload: roomList});
            } catch (err) {
                console.error("Error from getRoomList");
                throw err;
            }
        }
        return roomStore.getState().roomList;
    }

    /* An existing room with this contact, based on what's already in roomStore. There's no
       server call here at all — this is just a peek at the current Store. */
    public findRoomByContact(otherUserId: number): Room | undefined {
        return roomStore.getState().roomList.find(room => room.other?.id === otherUserId);
    }

    /* Selecting a contact shouldn't create a duplicate: the server itself doesn't check for duplicates
       (API SPEC §3.2 — "a repeated call with the same participants will create another room"),
       so the check is done here, locally, before every POST call. */
    public async getOrCreateRoom(name: string, other: User): Promise<Room> {
        const existingRoom = this.findRoomByContact(other.id);
        if (existingRoom) {
            return existingRoom;
        }
        return this.createRoom(name, other);
    }

    public async createRoom(name: string, other: User): Promise<Room> {
        const me = userStore.getState().user;
        if (!me) {
            throw new Error("אין משתמש מחובר");
        }
        try {
            /* The logged-in user is included in the list themselves — the server doesn't add them.
               The response includes user_list, so there's no need to keep meta separately. */
            const response = await http.post<RoomDTO>("room/", toRoomCreateDTO(name, [me, other]));

            const room = toRoom(response.data, me.id);
            roomStore.dispatch({type: RoomActionType.AddRoom, payload: room});
            return room;
        } catch (err) {
            console.error("Error from createRoom");
            throw err;
        }
    }

    /* DELETE /api/room/{room_id}/user/{user_id} — removes the logged-in user's membership;
       the room and its messages are only actually deleted once every participant has left. */
    public async deleteRoom(roomId: number): Promise<void> {
        const me = userStore.getState().user;
        if (!me) {
            throw new Error("אין משתמש מחובר");
        }
        try {
            await http.delete("room/" + roomId + "/user/" + me.id);
            roomStore.dispatch({type: RoomActionType.RemoveRoom, payload: roomId});
            messageService.clearRoom(roomId);
        } catch (err) {
            console.error("Error from deleteRoom");
            throw err;
        }
    }

    /* Section 21 of the spec — a full reset on logout. */
    public reset(): void {
        this.isFetched = false;
        roomStore.dispatch({type: RoomActionType.Reset, payload: null});
    }
}

export const roomService = new RoomService();
