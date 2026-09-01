import {User} from "../models/user";

/* TODO-7: there is no GET /api/user for a contact list. The contact list is a
   local mock — this is the spec's own requirement (section 9.1), not a shortcut.
   See TASKS-FRONT.md §4

   The IDs must belong to real users in the DB (see docs/DEMO-USERS.md),
   otherwise POST /api/room/ fails with 500 (foreign key violation). */
export const CONTACTS: User[] = [
    new User(2002, "יוסי", "כהן", "050-1000001"),
    new User(2003, "נועה", "שגב", "050-1000002"),
    new User(2004, "דני", "לוי", "050-1000003"),
    new User(2005, "משה", "ישראלי", "050-1000004"),
    new User(2006, "רון", "אזולאי", "050-1000005"),
];
