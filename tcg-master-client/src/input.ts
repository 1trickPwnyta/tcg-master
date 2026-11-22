import { io } from "socket.io-client";
import $ from "jquery";

export class Input {
    public static readonly socket = io("http://localhost:3000", {
        timeout: 600000,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000
    });

    public static send(input: string) {
        const log = $("#console");
        log.append(`<span class="user-input">&gt; ${input}</span><br />`);
        log.scrollTop(log[0].scrollHeight);
        Input.socket.emit("CMD", input);
        $("#prompt").text("Please stand by...");
        $("#choices").html("");
    }
};
