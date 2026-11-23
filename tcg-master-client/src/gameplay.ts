import $ from "jquery";
import { EventQueue, type GameEvent, type IEventConsumer } from "./events";
import { io, Socket } from "socket.io-client";
import { UI } from "./ui";
import { PvP } from "./pvp";

export class Gameplay implements IEventConsumer {
    private static _instance?: Gameplay;

    public static get instance(): Gameplay {
        return Gameplay._instance!;
    }

    public static startVsCom() {
        UI.switchToApp($("#gameplay"), () => {
            const socket = io("http://localhost:3000", {
                timeout: 600000,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000
            });
            socket.emit("START", {
                name: localStorage.user.name,
                opponent: "com"
            });
            Gameplay.start(socket);
        });
    }

    public static startVsHuman() {
        UI.setWaitMessage("Searching for another player...");
        UI.switchToApp($("#waiting"), () => PvP.match(socket => {
            UI.switchToApp($("#gameplay"), () => Gameplay.start(socket));
        }));
    }

    public static start(socket: Socket) {
        Gameplay._instance = new Gameplay(socket);
        Gameplay._instance.start();
        $("#input")[0].focus();
        socket.emit("JOIN");
    }

    private readonly socket;
    private readonly events: EventQueue;
    private _busy: boolean = false;

    public get busy(): boolean {
        return this._busy;
    }

    private constructor(socket: Socket) {
        this.socket = socket;
        this.events = new EventQueue(this, this.socket);
    }

    private start() {
        this.update();
    }

    public send(input: string) {
        const log = $("#console");
        log.append(`<span class="user-input">&gt; ${input}</span><br />`);
        log.scrollTop(log[0].scrollHeight);
        this.socket.emit("CMD", input);
        $("#input")[0].focus();
    }

    public consumeEvent(event: GameEvent) {
        if (this.busy && !event.urgent) {
            return false;
        }

        switch (event.code) {
            case "MSG":
                if (event.payload.length) {
                    this._busy = true;
                    this.processMessage(event.payload);
                    setTimeout(() => this.update(), 1000);
                } else {
                    this.processMessage([]); // Blank line
                }
                break;
            case "INFO": this.processMessage(event.payload); break;
            case "SHOW": this.showcase(event.payload as string); break;
            case "ASK": this.processPrompt(event.payload); break;
            case "WAIT": this.wait(); break;
            case "ERR": this.processMessage(event.payload); break;
            case "NEW": this.newGame(); break;
            case "END": this.gameOver(); break;
            default:
                console.error(`Unsupported event code: ${event.code}`);
                break;
        }

        if (!this._busy) {
            this.update();
        }
    }

    private update() {
        this._busy = false;
        const next = this.events.next();
        if (next) {
            this.consumeEvent(next);
        }
    }

    private detokenize(tokens: { name: string, type?: string }[]): string {
        return tokens.map(t => {
            if (t.type) {
                return `<span class="token_${t.type}">${t.name}</span>`;
            } else {
                return t.name;
            }
        }).join(" ").replaceAll(/\s([\.!\?,;:'])/g, "$1");
    }

    private processMessage(tokens: { name: string, type?: string }[]) {
        const log = $("#console");
        log.append(this.detokenize(tokens));
        log.append("<br />");
        log.scrollTop(log[0].scrollHeight);
    }

    private processPrompt(prompt: { text: any[], choices: { option: string, parts: any[] }[] }) {
        $("#prompt").html(this.detokenize(prompt.text));
        $("#choices").html(prompt.choices.map(c => `[${c.option}] ` + this.detokenize(c.parts)).join("<br />"));
    }

    private wait() {
        $("#prompt").text("Please stand by...");
        $("#choices").html("");
    }

    private newGame() {
        $("#console").empty();
        $("#prompt").text("Setting up...");
        $("#choices").html("");
        $("#showcase").html("");
    }

    private gameOver() {
        $("#prompt").text("Game over!");
        $("#choices").html("");
    }

    private showcase(path: string) {
        const showcase = $("#showcase");
        const currentImage = showcase.find("div");
        if (currentImage.length) {
            currentImage.fadeOut(200, function() { $(this).remove(); });
        }
        const image = $("<div>");
        image.css("background-image", `url("/card-images/${path}")`);
        image.css("display", "none");
        showcase.append(image);
        image.fadeIn(200);
    }
};
