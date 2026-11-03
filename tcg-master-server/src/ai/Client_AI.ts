import { Client } from "../Client.js";
import { Card_Pokemon_BaseSet_Staryu } from "../game/cards/workers/BaseSet/Card_Pokemon_BaseSet_Staryu.js";
import { GameEngine } from "../game/engine/GameEngine.js";
import { Choice } from "../game/state/Interrupt.js";
import { GameState } from "../game/state/GameState.js";
import path from "path";
import { Worker } from "worker_threads";
import { InterruptActor } from "../game/state/actors/InterruptActor.js";

export type AIChoice = {
    i: number | null;
    key: string;
    valid: boolean;
};

export type AIContext = {
    prompt: string;
    choices: Choice[];
    force: boolean;
    interrupt_id: number;
    player_id: number;
    state: GameState;
    attemptedChoices?: Map<string, number>
};

export type ScoredChoice = {
    choice: AIChoice;
    score: number;
};

export class Client_AI extends Client {
    public static getAIChoices(context: AIContext): AIChoice[] {
        return [ ...context.choices, ...(!context.force ? [ null ] : []) ].map((c, i) => {
            const key = context.player_id + context.prompt + context.choices.map(c => c.text + c.target_id).join("") + c?.text + c?.target_id;
            return {
                i: c ? i : null,
                key: key,
                valid: (context.attemptedChoices?.get(key) ?? 0) < 5
            };
        });
    }

    private readonly id: string = crypto.randomUUID();
    public override name: string = "COM";
    public invalid: boolean = false;
    private readonly movesUsed: Map<number, (number | null)[]> = new Map<number, (number | null)[]>();
    protected interrupt_id: number | null = null;

    public constructor() {
        super();
    }

    public override send(...parts: any[]): void {
        console.log(Client.tokenize(...parts).map(t => t.name).join(" "));
    }

    public override error(...parts: any[]): void {
        throw new Error(Client.tokenize(...parts).map(t => t.name).join(" "));
    }

    public override prompt(text: string, choices: Choice[], force: boolean = false) {
        if (this.interrupt_id) {
            return;
        }

        console.log(`${text} [ ${choices.map(c => c.text).join(", ")}${!force ? ", (cancel)" : ""} ]`);
        const state = this.game!.getState();
        this.interrupt_id = InterruptActor.getInterrupt(state, this.player_id!)!.id!;

        const worker = new Worker(path.join(import.meta.dirname, "AIWorker.js"));
        worker.on("message", (scores: ScoredChoice[]) => {
            worker.terminate();
            const hash = this.game!.getStateHash();
            const choice = scores.filter(s => s.score !== null && !(this.movesUsed.get(hash) ?? []).includes(s.choice.i)).sort((a, b) => b.score! - a.score!)[0]?.choice ?? scores[0].choice;
            if (!this.movesUsed.has(hash)) {
                this.movesUsed.set(hash, []);
            }
            this.movesUsed.set(hash, [ ...this.movesUsed.get(hash)!, choice.i ]);
            if (this.interrupt_id === InterruptActor.getInterrupt(state, this.player_id!)?.id) {
                console.log(`> ${choice.i ?? "(cancel)"}`);
                this.interrupt_id = null;
                InterruptActor.resolveInterrupt(this.game!, state, this.player_id!, choice.i);
            } else {
                throw new Error(`Attempted to respond to interrupt ${this.interrupt_id} but it wasn't available.`);
            }
        });
        worker.postMessage({
            prompt: text,
            choices: choices,
            force: force,
            interrupt_id: this.interrupt_id,
            player_id: this.player_id!,
            state: this.game!.getState()
        });
    }

    public witness(player: Player, card: Card) {
        if (player !== this.player) {
            this.witnessedCards.set(Object.getPrototypeOf(card), this.witnessedCards.get(Object.getPrototypeOf(card)) ?? 0 + 1);
        }
    }

    public getBeliefDistribution(game: GameEngine, amount: number): Card[] {
        const totalWitnessed = this.witnessedCards.values().reduce((sum, value) => sum + value, 0);
        const cards: Card[] = [];

        for (const witnessed of this.witnessedCards.keys()) {
            const distAmount = Math.ceil(this.witnessedCards.get(witnessed)! / totalWitnessed * amount);
            for (let i = 0; i < distAmount; i++) {
                const card = new witnessed(game, game.players[this.player.opponent.id]);
                cards.push(card);
            }
        }

        while (cards.length > amount) {
            cards.splice(Math.floor(Math.random() * cards.length), 1);
        }

        // If we didn't produce enough (never witnessed any cards), just stuff with Basic Pokemon
        while (cards.length < amount) {
            cards.push(new Card_Pokemon_BaseSet_Staryu(game, game.players[this.player.opponent.id]));
        }
        return cards;
    }
};
