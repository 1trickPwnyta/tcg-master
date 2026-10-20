import { io } from "socket.io-client";
import $ from "jquery";

declare global {
    var form_submit: (e: Event) => void;
}

globalThis.form_submit = (e: Event) => {
    e.preventDefault();
    const textarea = $("textarea");
    const form = $("form");
    const input = form.find("input[type=\"text\"]").val();
    form.trigger("reset");
    textarea.append("> ");
    textarea.append(input as string);
    textarea.append("\n");
    textarea.scrollTop(textarea[0].scrollHeight);
    Input.send(input as string);
};

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

    public static receive(message: string) {
        const textarea = $("textarea");
        textarea.append(message);
        textarea.append("\n");
        textarea.scrollTop(textarea[0].scrollHeight)
    }

    public static prompt(prompt: { text: string, choices: string[] }) {
        $("#prompt").text(prompt.text);
        $("#choices").html(prompt.choices.join("<br />"));
    }
}
