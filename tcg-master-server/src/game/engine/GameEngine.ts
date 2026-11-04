import { Client_AI } from "../../ai/Client_AI.js";
import { GameState } from "../state/GameState.js";
import { Interrupt, InterruptSync } from "../state/interrupts/Interrupt.js";
import { PlayerState } from "../state/PlayerState.js";
import { Client } from "../../Client.js";
import { IToken } from "../../IToken.js";
import { GameWorker_Setup } from "./GameWorker_Setup.js";
import { GameWorker_Turn } from "./GameWorker_Turn.js";
import { InterruptActor } from "../state/actors/InterruptActor.js";
import { SearchActor } from "../state/actors/SearchActor.js";
import { PlayerActor } from "../state/actors/PlayerActor.js";
import { CardActor } from "../state/actors/CardActor.js";
import { PokemonActor } from "../state/actors/PokemonActor.js";

export class GameEngine {
    public readonly clients: Client[];
    private state: GameState;
    public readonly simulation: boolean = false;
    private promptsGiven: number = 0;

    public readonly setup: GameWorker_Setup;
    public readonly turns: GameWorker_Turn;

    public readonly players: PlayerActor;
    public readonly interrupts: InterruptActor;
    public readonly search: SearchActor;
    public readonly cards: CardActor;
    public readonly pokemon: PokemonActor;

    public constructor(client1?: Client, client2?: Client, options: { prizes?: number } = {}, clonedState?: GameState) {
        this.setup = new GameWorker_Setup(this);
        this.turns = new GameWorker_Turn(this);

        if (client1) {
            client1.game = this;
        } else {
            client1 = new Client_AI();
            client1.game = this;
        }
        if (client2) {
            client2.game = this;
        } else {
            client2 = new Client_AI();
            client2.game = this;
        }
        this.clients = [ client1, client2 ];
        client1.player_id = client1.player_id ?? 1;
        client2.player_id = client2.player_id ?? clonedState?.players.find(p => p.id !== client1.player_id)?.id ?? 2;

        this.state = clonedState ?? {
            players: [ PlayerActor.makePlayer(1, "Pikachu"), PlayerActor.makePlayer(2, "COM") ],
            turn: null,
            betweenTurns: false,
            interrupt: null,
            interruptStack: [],
            rules: {
                prizes: options.prizes ?? 6
            },
            nextInterrupt_id: 1000
        };
        this.simulation = clonedState !== undefined;

        this.players = new PlayerActor(this);
        this.interrupts = new InterruptActor(this);
        this.search = new SearchActor(this);
        this.cards = new CardActor(this);
        this.pokemon = new PokemonActor(this);

        if (!this.simulation) {
            this.update();
        }
    }

    public getState(): GameState {
        return this.state;
    }

    public getStateHash(): number {
        const str = JSON.stringify([
            this.state.players.map(p => {
                p.active,
                [ ...p.bench.cards ].sort((a, b) => a.id - b.id),
                p.limbo,
                [ ...p.hand.cards ].sort((a, b) => a.id - b.id),
                p.discard,
                p.prizes,
                p.deck
            }),
            this.state.turn,
            this.state.winner_id,
            this.state.interrupt?.player,
            this.state.interrupt?.prompt,
            this.state.interrupt?.choices
        ]);
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
