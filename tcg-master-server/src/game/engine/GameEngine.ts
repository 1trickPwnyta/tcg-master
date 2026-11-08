import { Client_AI } from "../../ai/Client_AI.js";
import { GameState } from "../state/GameState.js";
import { Interrupt, InterruptSync } from "../state/interrupts/Interrupt.js";
import { PlayerState } from "../state/PlayerState.js";
import { Client } from "../../Client.js";
import { IToken } from "../../IToken.js";
import { SetupEngine } from "./SetupEngine.js";
import { TurnEngine } from "./TurnEngine.js";
import { InterruptEngine } from "./InterruptEngine.js";
import { SearchEngine } from "./SearchEngine.js";
import { PlayerEngine } from "./PlayerEngine.js";
import { CardEngine } from "./CardEngine.js";
import { PokemonEngine } from "./PokemonEngine.js";
import { SerializationReplace } from "../state/serializer.js";

export class GameEngine {
    public readonly clients: Client[];
    private _state?: GameState;
    private options: { prizes?: number };
    private _simulation: boolean = false;
    private promptsGiven: number = 0;

    public readonly setup: SetupEngine;
    public readonly turns: TurnEngine;

    public readonly players: PlayerEngine;
    public readonly interrupts: InterruptEngine;
    public readonly search: SearchEngine;
    public readonly cards: CardEngine;
    public readonly pokemon: PokemonEngine;

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

        this.players = new PlayerEngine(this);
        this.interrupts = new InterruptEngine(this);
        this.search = new SearchEngine(this);
        this.cards = new CardEngine(this);
        this.pokemon = new PokemonEngine(this);
    }

    public start(state?: GameState) {
        if (state) {
            this._state = state;
            this._simulation = true;
        } else {
            this._state = new GameState(this, { prizes: this.options.prizes ?? 6 });
            this.state.players.push(PlayerEngine.makePlayer(1, "Pikachu"));
            this.state.players.push(PlayerEngine.makePlayer(2, "COM"));
        }
        if (!this.simulation) {
            this.update();
        }
    }

    public get simulation(): boolean {
        return this._simulation;
    }

    public get state(): GameState {
        return this._state!;
    }

    public getStateHash(): number {
        const str = JSON.stringify([
            this.state.players.map(p => [
                p.active,
                [ ...p.bench.cards ].sort((a, b) => a.id - b.id),
                p.limbo,
                [ ...p.hand.cards ].sort((a, b) => a.id - b.id),
                p.discard,
                p.prizes,
                p.deck
            ]),
            this.state.turn,
            this.state.winner_id,
            this.state.interrupt?.player,
            this.state.interrupt?.prompt,
            this.state.interrupt?.choices
        ], SerializationReplace);
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 33) ^ str.charCodeAt(i);
        }
        return hash >>> 0;
    }

    public getClient(player_id: number): Client {
        return this.clients.find(c => c.player_id === player_id)!;
    }

    public flipCoin(player_id?: number): boolean {
        const heads = Math.random() < 0.5;
        if (player_id) {
            this.send(this.players.get(player_id), "flipped a coin... It was", heads ? "heads" : "tails", "!");
        } else {
            this.send("A coin was flipped... It was", heads ? "heads" : "tails", "!");
        }
        return heads;
    }

    public update() {
        if (!this.state.winner_id) {
            if (this.state.interrupt) {
                this.interrupts.interrupt(this.state.interrupt);
            } else if (this.state.interruptStack.length) {
                this.interrupts.interrupt(this.state.interruptStack.pop()!);
            } else if (!this.state.turn) {
                this.setup.update();
            } else if (this.state.betweenTurns) {
                this.turns.begin(this.players.inactive.id);
            } else {
                this.turns.update();
            }
        }
    }

    public end(winner_id: number) {
        this.state.interrupt = null;
        const winner = this.players.get(winner_id);
        this.send(winner, "has no more prizes left.", winner, "wins!");
        this.state.winner_id = winner_id;
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
        for (const player of this.state.players) {
            this.sendTo(player.id, ...parts);
        }
    }

    public sendTo(player_id: number, ...parts: any[]) {
        if (!this.state.winner_id) {
            const client = this.clients.find(c => c.player_id === player_id);
            client?.send(...parts);
        }
    }

    public sendError(player: PlayerState, ...parts: (IToken | string)[]) {
        if (!this.state.winner_id) {
            this.clients.find(c => c.player_id === player.id)?.error(...parts);
        }
    }
};
