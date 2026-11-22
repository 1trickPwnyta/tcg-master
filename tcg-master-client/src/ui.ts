import $ from "jquery";
import { EventQueue, type GameEvent, type IEventConsumer } from "./events";
import { Input } from "./input";

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

export class UI implements IEventConsumer {
    private readonly events: EventQueue = new EventQueue(this);
    private _busy: boolean = false;

    public get busy(): boolean {
        return this._busy;
    }

    public start() {
        this.update();
    }

    public consumeEvent(event: GameEvent) {
        switch (event.code) {
            case "MSG":
                if (this.busy) return false;
                if (event.payload.length) {
                    this._busy = true;
                    this.processMessage(event.payload);
                    setTimeout(() => this.update(), 1000);
                    return;
                } else {
                    this.processMessage([]); // Blank line
                }
                break;
            case "ASK":
                if (this.busy) return false;
                this.processPrompt(event.payload);
                break;
            case "ERR": this.processMessage(event.payload); break;
            case "NEW": $("#console").empty(); break;
            case "END": this.gameOver(); break;
            default:
                console.error(`Unsupported event code: ${event.code}`);
                break;
        }

        this.update();
    }

    private update() {
        this._busy = false;
        const next = this.events.next();
        if (next) {
            this.consumeEvent(next);
        }
    }

    private processMessage(tokens: { name: string, type?: string }[]) {
        const log = $("#console");
        log.append(tokens.map(t => {
            if (t.type) {
                return `<span class="token_${t.type}">${t.name}</span>`;
            } else {
                return t.name;
            }
        }).join(" ").replaceAll(/\s([\.!\?,;:'])/g, "$1"));
        log.append("<br />");
        log.scrollTop(log[0].scrollHeight);
    }

    private processPrompt(prompt: { text: string, choices: string[] }) {
        $("#prompt").text(prompt.text);
        $("#choices").html(prompt.choices.join("<br />"));
    }

    private gameOver() {
        $("#prompt").text("Game over!");
        $("#choices").html("");
    }
};
