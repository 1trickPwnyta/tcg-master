import { Client } from "../Client.js";
import { Card_Pokemon_BaseSet_Staryu } from "../game/cards/BaseSet/Card_Pokemon_BaseSet_Staryu.js";
import { Card } from "../game/cards/Card.js";
import { GameEngine } from "../game/engine/GameEngine.js";
import { Player } from "../game/Player.js";
import { AIPlanner } from "./AIPlanner.js";

export class Client_AI extends Client {
    public override name: string = "COM";
    public planner: AIPlanner | null = null;
    private witnessedCards: Map<(new (game: GameEngine, owner: Player) => Card), number> = new Map<(new (game: GameEngine, owner: Player) => Card), number>();
    public readonly depth: number;

    public constructor(game: GameEngine, depth: number = 0) {
        super();
        this.game = game;
        this.depth = depth;
    }

    public override send(...parts: any[]): void {
        console.log(Client.tokenize(...parts).map(t => t.name).join(" "));
    }

    public override error(message: string): void {
        console.error(`${this.player} received an error: ${message}`);
    }

    public override prompt(text: string, choices: string[], force: boolean = false) {
        console.log(`${text} [ ${choices.join(", ")}${!force ? ", (cancel)" : ""} ]`);
        const choice = Math.floor(Math.random() * choices.length);
        const finalChoice = !force && Math.random() < 0.1 ? null : choice;
        console.log(`> ${finalChoice ?? "(cancel)"}`);
        this.game!.resolveInterrupt(this.player_id!, finalChoice);
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

    public override copy(player: Player, depth: number = 0): Client {
        return new Client_AI(player, depth);
    }
};
