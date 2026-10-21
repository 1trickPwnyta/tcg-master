import { io } from "socket.io-client";
import $ from "jquery";

declare global {
    var form_submit: (e: Event) => void;
}

globalThis.form_submit = (e: Event) => {
    e.preventDefault();
    const log = $("#console");
    const form = $("form");
    const input = form.find("input[type=\"text\"]").val();
    form.trigger("reset");
    log.append("> ");
    log.append(input as string);
    log.append("<br />");
    log.scrollTop(log[0].scrollHeight);
    Input.send(input as string);
};

$("#input")[0].focus();

class Input {
    private static socket = io("http://localhost:3000");

    static {
        Input.socket.on("MSG", Input.receive);
        Input.socket.on("ERR", Input.receive);
        Input.socket.on("ASK", Input.prompt);
    }

    public static send(input: string) {
        Input.socket.emit("CMD", input);
    }

    public static receive(tokens: { text: string, type?: string }[]) {
        const log = $("#console");
        log.append(tokens.map(t => {
            if (t.type) {
                return `<span class="token_${t.type}">${t.text}</span>`;
            } else {
                return t.text;
            }
        }).join(" ").replaceAll(/\s([\.!\?,;:'])/g, "$1"));
        log.append("<br />");
        log.scrollTop(log[0].scrollHeight)
    }

    public static prompt(prompt: { text: string, choices: string[] }) {
        $("#prompt").text(prompt.text);
        $("#choices").html(prompt.choices.join("<br />"));
    }
}
