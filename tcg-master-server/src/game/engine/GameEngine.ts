import { Client_AI } from "../../ai/Client_AI.js";
import { Game as Game } from "../state/Game.js";
import { Interrupt, InterruptAsync, InterruptSync } from "../state/interrupts/Interrupt.js";
import { Player } from "../state/Player.js";
import { Client, ClientEvent } from "../../Client.js";
import { SetupEngine } from "./SetupEngine.js";
import { TurnEngine } from "./TurnEngine.js";
import { InterruptEngine } from "./InterruptEngine.js";
import { SearchEngine } from "./SearchEngine.js";
import { IllegalMoveError } from "../state/interrupts/InterruptResolver.js";
import { Card } from "../state/Card.js";

export class GameEngine {
    public readonly clients: Client[] = [];
    private _game?: Game;
    private options: { prizes?: number };
    private _simulation: boolean = false;

    public readonly setup: SetupEngine;
    public readonly turns: TurnEngine;

    public readonly interrupts: InterruptEngine;
    public readonly search: SearchEngine;

    public constructor(client1?: Client | null, client2?: Client | null, options: { prizes?: number } = {}) {
        this.options = options;
        this.setup = new SetupEngine(this);
        this.turns = new TurnEngine(this);

        if (client1) {
            client1.engine = this;
        } else if (client1 === undefined) {
            client1 = new Client_AI();
            client1.engine = this;
        }
        if (client1) {
            client1.player_id = client1.player_id ?? 1;
            this.clients.push(client1);
        }
        if (client2) {
            client2.engine = this;
        } else if (client2 === undefined) {
            client2 = new Client_AI();
            client2.engine = this;
        }
        if (client2) {
            client2.player_id = client2.player_id ?? 2;
            this.clients.push(client2);
        }

        this.interrupts = new InterruptEngine(this);
        this.search = new SearchEngine(this);
    }

    public start(player1name: string, player2name: string) {
        this._game = new Game(this, { prizes: this.options.prizes ?? 6 });
        this.game.players.push(new Player(1, this, player1name));
        this.clients[0].player = this.game.players[0];
        this.game.players.push(new Player(2, this, player2name));
        this.clients[1].player = this.game.players[1];

        this.game.update();
    }

    public startSimulation(state: Game) {
        this._game = state;
        this._simulation = true;
    }

    public get simulation(): boolean {
        return this._simulation;
    }

    public get game(): Game {
        return this._game!;
    }

    public getClient(player_id: number): Client | null {
        return this.clients.find(c => c.player_id === player_id) ?? null;
    }

    public end(winner_id: number) {
        this.game.interrupt = null;
        const winner = this.game.getPlayer(winner_id);
        this.send(winner, "has no more prizes left.", winner, "wins!");
        this.game.winner_id = winner_id;
        for (const client of this.clients) {
            client.notify_gameOver(winner);
        }
    }

    public sendInterrupt(interrupt: Interrupt) {
        if (this.simulation) return;

        if (interrupt instanceof InterruptAsync) {
            for (const sub of interrupt.interrupts) {
                this.sendInterrupt(sub);
            }
        } else if (interrupt instanceof InterruptSync) {
            const client = this.clients.find(c => c.player_id === interrupt.player);
            client?.prompt(interrupt as InterruptSync);
        }
    }

    public send(...parts: any[]) {
        if (this.simulation) return;
        const id = this.game.recordMessage(parts);
        for (const player of this.game.players) {
            this.sendToWithId(player, id, ...parts);
        }
    }

    public sendTo(player: Player, ...parts: any[]) {
        this.sendToWithId(player, -1, ...parts);
    }

    public sendToWithId(player: Player, id: number, ...parts: any[]) {
        if (this.simulation) return;
        if (this.game.winner_id) return;
        const client = this.clients.find(c => c.player_id === player.id);
        client?.send(id, ...parts);
    }

    public sendEvent(event: ClientEvent, ...message: any[]) {
        if (this.simulation) return;
        if (this.game.winner_id) return;
        if (message.length) {
            this.send(...message);
        }
        for (const player of this.game.players) {
            this.sendEventTo(player, event);
        }
    };

    public sendEventTo(player: Player, event: ClientEvent, ...message: any[]) {
        if (this.simulation) return;
        if (this.game.winner_id) return;
        if (message.length) {
            this.sendTo(player, ...message);
        }
        const client = this.clients.find(c => c.player_id === player.id);
        client?.sendEvent(event);
    }

    public sendSync() {
        for (const client of this.clients) {
            client.sync();
        }
    }

    public showcase(card: Card) {
        for (const client of this.clients) {
            client.showcase(card.def);
        }
    }

    public sendError(player: Player, message: string) {
        if (!this.game.winner_id) {
            const client = this.clients.find(c => c.player_id === player.id);
            if (client) {
                client.error(message);
            } else {
                throw new IllegalMoveError(message);
            }
        }
    }
};
