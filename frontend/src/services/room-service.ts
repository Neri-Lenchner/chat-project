import {http} from "../utils/http";
import {Room, RoomDTO, RoomMeta} from "../models/room";
import {User} from "../models/user";
import {toRoom, toRoomCreateDTO} from "../utils/mappers";
import {RoomActionType, roomStore} from "../state/room-state";
import {userStore} from "../state/user-state";
import {hiddenRooms, roomMeta} from "../utils/storage";

/* בתבנית docs/front-example/src/services/course-service.ts.
   סעיף 2.2 באפיון: קריאה ראשונית אחת לאזור מידע, ומשם עבודה מול Redux בלבד. */

class RoomService {

    public isFetched: boolean = false;

    public async getRoomList(forceFetch: boolean = false): Promise<Room[]> {
        if (!this.isFetched || forceFetch) {
            const user = userStore.getState().user;
            if (!user) {
                return roomStore.getState().roomList;
            }
            try {
                const response = await http.get<RoomDTO[]>("room-user/room/" + user.id);

                /* TODO-2: אין DELETE /api/room/{id}. חדר "שנמחק" מוסתר מקומית
                   וממשיך לחזור מהשרת, ולכן מסננים אותו כאן. ראה TASKS-FRONT.md §4 */
                const hiddenRoomIdList = hiddenRooms.getAll();

                /* TODO-6: אין endpoint למשתתפי חדר. ההעשרה מגיעה מה-meta המקומי,
                   ובלעדיה displayName נופל ל-name של השרת או ל-"שיחה #{id}". */
                const roomMetaMap = roomMeta.getAll();

                const roomList = response.data
                    .filter(roomDto => !hiddenRoomIdList.includes(roomDto.id))
                    .map(roomDto => toRoom(roomDto, roomMetaMap[roomDto.id]));

                this.isFetched = true;
                roomStore.dispatch({type: RoomActionType.GetRoomList, payload: roomList});
            } catch (err) {
                console.error("Error from getRoomList");
                throw err;
            }
        }
        return roomStore.getState().roomList;
    }

    public async createRoom(name: string, other: User): Promise<Room> {
        const me = userStore.getState().user;
        if (!me) {
            throw new Error("אין משתמש מחובר");
        }
        try {
            /* המשתמש המחובר נכלל ברשימה בעצמו — השרת לא מוסיף אותו. */
            const response = await http.post<RoomDTO>("room/", toRoomCreateDTO(name, [me, other]));

            /* TODO-6: שומרים מי הצד השני לפני שהמידע הזה אובד —
               הוא נדרש גם לתצוגה וגם ל-other_user_id בשליחת הודעה. */
            const meta = new RoomMeta(other.id, other.fullName);
            roomMeta.set(response.data.id, meta);

            const room = toRoom(response.data, meta);
            roomStore.dispatch({type: RoomActionType.AddRoom, payload: room});
            return room;
        } catch (err) {
            console.error("Error from createRoom");
            throw err;
        }
    }

    /* TODO-2: אין DELETE בשרת. ההסתרה מקומית בלבד, והחדר ימשיך להתקיים
       אצל המשתתף השני. ראה TASKS-FRONT.md §4 */
    public hideRoom(roomId: number): void {
        hiddenRooms.add(roomId);
        roomStore.dispatch({type: RoomActionType.RemoveRoom, payload: roomId});
    }

    /* סעיף 21 באפיון — איפוס מלא ביציאה. */
    public reset(): void {
        this.isFetched = false;
        roomStore.dispatch({type: RoomActionType.Reset, payload: null});
    }
}

export const roomService = new RoomService();
