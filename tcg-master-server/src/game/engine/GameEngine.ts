import { Client_AI } from "../../ai/Client_AI.js";
import { Game as Game } from "../state/Game.js";
import { Interrupt, InterruptSync } from "../state/interrupts/Interrupt.js";
import { Player } from "../state/Player.js";
import { Client } from "../../Client.js";
import { IToken } from "../../IToken.js";
import { SetupEngine } from "./SetupEngine.js";
import { TurnEngine } from "./TurnEngine.js";
import { InterruptEngine } from "./InterruptEngine.js";
import { SearchEngine } from "./SearchEngine.js";

export class GameEngine {
    public readonly clients: Client[];
    private _game?: Game;
    private options: { prizes?: number };
    private _simulation: boolean = false;
    private promptsGiven: number = 0;

    public readonly setup: SetupEngine;
    public readonly turns: TurnEngine;

    public readonly interrupts: InterruptEngine;
    public readonly search: SearchEngine;

    public constructor(client1?: Client, client2?: Client, options: { prizes?: number } = {}) {
        this.options = options;
        this.setup = new SetupEngine(this);
        this.turns = new TurnEngine(this);

        if (client1) {
            client1.engine = this;
        } else {
            client1 = new Client_AI();
            client1.engine = this;
        }
        if (client2) {
            client2.engine = this;
        } else {
            client2 = new Client_AI();
            client2.engine = this;
        }
        this.clients = [ client1, client2 ];
        client1.player_id = client1.player_id ?? 1;
        client2.player_id = client2.player_id ?? 2;

        this.interrupts = new InterruptEngine(this);
        this.search = new SearchEngine(this);
    }

    public start(state?: Game) {
        if (state) {
            this._game = state;
            this._simulation = true;
        } else {
            this._game = new Game(this, { prizes: this.options.prizes ?? 6 });
            this.game.players.push(new Player(1, this, "Pikachu"));
            this.game.players.push(new Player(2, this, "COM"));
        }
        if (!this.simulation) {
            this.game.update();
        }
    }

    public get simulation(): boolean {
        return this._simulation;
    }

    public get game(): Game {
        return this._game!;
    }

    public getClient(player_id: number): Client {
        return this.clients.find(c => c.player_id === player_id)!;
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
        if (this.simulation && this.promptsGiven > 0) {
            return;
        }
        if (interrupt.interrupts?.length) {
            for (const sub of interrupt.interrupts) {
                this.sendInterrupt(sub);
            }
        } else {
            this.promptsGiven++;
            this.clients.find(c => c.player_id === interrupt.player)!.prompt(interrupt as InterruptSync);
        }
    }

    public send(...parts: any[]) {
        for (const player of this.game.players) {
            this.sendTo(player, ...parts);
        }
    }

    public sendTo(player: Player, ...parts: any[]) {
        if (!this.game.winner_id) {
            const client = this.clients.find(c => c.player_id === player.id);
            client?.send(...parts);
        }
    }

    public sendError(player: Player, ...parts: (IToken | string)[]) {
        if (!this.game.winner_id) {
            this.clients.find(c => c.player_id === player.id)?.error(...parts);
        }
    }
};
