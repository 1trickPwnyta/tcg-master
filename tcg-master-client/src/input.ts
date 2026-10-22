import { io } from "socket.io-client";
import $ from "jquery";

declare global {
    var formSubmit: (e: Event) => void;
}

globalThis.formSubmit = (e: Event) => {
    e.preventDefault();
    const form = $("form");
    const input = form.find("input[type=\"text\"]").val() as string;
    form.trigger("reset");
    Input.send(input.trim());
};

$("#input")[0].focus();

export class Input {
    private static socket = io("http://localhost:3000");

    static {
        Input.socket.on("MSG", Input.receive);
        Input.socket.on("ERR", Input.receive);
        Input.socket.on("ASK", Input.prompt);
        Input.socket.on("NEW", () => $("#console").empty());
    }

    public static send(input: string) {
        const log = $("#console");
        log.append(`<span class="user-input">&gt; ${input}</span><br />`);
        log.scrollTop(log[0].scrollHeight);
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
};
