import { Client } from "../Client.js";
import path from "path";
import { Worker } from "worker_threads";
import { InterruptSync } from "../game/state/interrupts/Interrupt.js";
import { SerializationReplace } from "../game/state/serializer.js";
import { Choice } from "../game/state/Choice.js";

export type AIContext = {
    player_id: number;
    game: string;
};

export class Client_AI extends Client {
    public override name: string = "COM";
    public invalid: boolean = false;
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

        console.log(`${interrupt.prompt} [ ${interrupt.choices!.map(c => c.label).join(", ")}${!interrupt.force ? ", (cancel)" : ""} ]`);
        this.interrupt_id = this.engine!.interrupts.get(this.player_id!)!.id!;

        const worker = new Worker(path.join(import.meta.dirname, "AIWorker.js"));
        worker.on("message", (message: Choice | string | null) => {
            if (typeof message === "string") {
                console.log(message);
                return;
            }

            worker.terminate();
            if (this.interrupt_id === this.engine!.interrupts.get(this.player_id!)?.id) {
                const choice = message as Choice | null;
                console.log(`> ${choice ? interrupt.choices.findIndex(c => (c.id ?? c.label) === (choice.id ?? choice.label)) : "(cancel)"}`);
                this.interrupt_id = null;
                this.engine!.interrupts.resolve(this.player_id!, choice ? interrupt.choices.findIndex(c => (c.id ?? c.label) === (choice.id ?? choice.label)) : null);
            } else {
                throw new Error(`Attempted to respond to interrupt ${this.interrupt_id} but it wasn't available.`);
            }
        });
        worker.postMessage({
            player_id: this.player_id!,
            game: JSON.stringify(this.engine!.game, SerializationReplace)
        });
    }

    /*public witness(player: Player, card: Card) {
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
    }*/
};
