import { Client } from "../Client.js";
import { Card_Pokemon_BaseSet_Staryu } from "../game/cards/workers/BaseSet/Card_Pokemon_BaseSet_Staryu.js";
import { GameEngine } from "../game/engine/GameEngine.js";
import { GameState } from "../game/state/GameState.js";
import path from "path";
import { Worker } from "worker_threads";
import { InterruptSync } from "../game/state/interrupts/Interrupt.js";
import { AIPruner } from "./AIPruner.js";
import { HistoryEntry } from "./Client_AIWorker.js";

export type AIChoice = {
    i: number | null;
    target: number | null;
    key: string;
    valid: boolean;
};

export type AIContext = {
    prompt: string;
    choices: AIChoice[];
    force: boolean;
    interrupt: InterruptSync;
    interrupt_id: number;
    player_id: number;
    state: GameState;
    attemptedChoices?: Map<string, number>
};

export type ScoredChoice = {
    choice: AIChoice;
    score: number;
    history: HistoryEntry[];
};

export class Client_AI extends Client {
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

    public override prompt(interrupt: InterruptSync) {
        if (this.interrupt_id) {
            return;
        }

        console.log(`${interrupt.prompt} [ ${interrupt.choices!.map(c => c.text).join(", ")}${!interrupt.force ? ", (cancel)" : ""} ]`);
        this.interrupt_id = this.game!.interrupts.get(this.player_id!)!.id!;

        const worker = new Worker(path.join(import.meta.dirname, "AIWorker.js"));
        worker.on("message", (scores: ScoredChoice[]) => {
            worker.terminate();
            const hash = this.game!.getStateHash();
            const scoresUnused = scores.filter(s => s.score !== null && !(this.movesUsed.get(hash) ?? []).includes(s.choice.i)).sort((a, b) => b.score! - a.score!);
            const choice = scoresUnused[0]?.choice ?? scores[0].choice;
            if (!this.movesUsed.has(hash)) {
                this.movesUsed.set(hash, []);
            }
            this.movesUsed.set(hash, [ ...this.movesUsed.get(hash)!, choice.i ]);
            if (this.interrupt_id === this.game!.interrupts.get(this.player_id!)?.id) {
                console.log(`> ${choice.i ?? "(cancel)"}`);
                this.interrupt_id = null;
                this.game!.interrupts.resolve(this.player_id!, choice.i);
            } else {
                throw new Error(`Attempted to respond to interrupt ${this.interrupt_id} but it wasn't available.`);
            }
        });
        worker.postMessage({
            prompt: interrupt.prompt,
            choices: AIPruner.prune(this.game!, interrupt),
            force: interrupt.force,
            interrupt: interrupt,
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
