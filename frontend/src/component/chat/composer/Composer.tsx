import {JSX, KeyboardEvent, useRef, useState} from "react";
import Button from "../../ui/button/Button";
import Icon from "../../ui/icon/Icon";
import {Room} from "../../../models/room";
import {messageService} from "../../../services/message-service";
import {ShowToast} from "../../layout/app-shell/AppShell";
import "./Composer.css";

/* Section 21 in the spec. The Store (messageService.sendMessage) is responsible for the
   pending/failed cycle and updating RoomStore — here it's just UI: field, button, keyboard. */

interface ComposerProps {
    room: Room;
    showToast: ShowToast;
}

function Composer(composerProps: ComposerProps): JSX.Element {

    const {room, showToast} = composerProps;

    const [content, setContent] = useState<string>("");
    const [isSending, setSending] = useState<boolean>(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    /* useState doesn't update synchronously between rapid clicks — the same issue
       that was fixed in Register.tsx (double-submit race). The ref checks-and-sets immediately. */
    const isSendingRef = useRef<boolean>(false);

    /* AD-9: undefined only in a group room (more than 2 participants) — there's no single recipient. */
    const otherUserId = room.other?.id;
    const isDisabled = !otherUserId;

    function autoGrow(): void {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }

    async function send(): Promise<void> {
        if (isDisabled || isSendingRef.current) return;

        const trimmed = content.trim();
        if (!trimmed) return; // Section 17 in the spec — an empty message is not sent

        setContent("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        isSendingRef.current = true;
        setSending(true);
        try {
            await messageService.sendMessage(room.id, otherUserId as number, trimmed);
        } catch {
            showToast("לא ניתן לשלוח את ההודעה. נסה שוב.", "error");
        } finally {
            isSendingRef.current = false;
            setSending(false);
        }
    }

    function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void send();
        }
    }

    return (
        <div className={isDisabled ? "composer is-invalid" : "composer"}>
            <div className="composer__inner">
                <div className="composer__row">
                    <textarea className="composer__input"
                              ref={textareaRef}
                              rows={1}
                              placeholder="כתוב הודעה…"
                              aria-label="תוכן ההודעה"
                              disabled={isDisabled}
                              value={content}
                              onChange={event => {
                                  setContent(event.target.value);
                                  autoGrow();
                              }}
                              onKeyDown={onKeyDown}/>

                    <Button variant="primary"
                            className="composer__send"
                            icon="send"
                            loading={isSending}
                            disabled={isDisabled || !content.trim()}
                            onClick={() => void send()}>
                        שליחה
                    </Button>
                </div>

                {isDisabled && (
                    <p className="composer__error">
                        <Icon name="alert" size="sm"/>
                        לא ניתן לזהות את הנמען בשיחה הזו
                    </p>
                )}
            </div>
        </div>
    );
}

export default Composer;
