import { CardDatabase } from "../../cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../../cards/workers/CardWorker_Pokemon.js";
import { StateActor } from "./StateActor.js";

export class PokemonActor extends StateActor {
    public damage(player_id: number, card_id: number, amount: number, source?: string): boolean {
        if (amount) {
            const player = this.game.players.get(player_id)!;
            const card = this.game.search.getCard(card_id)!;
            card.damage += amount;
            this.game.send(player, "'s", card, "took", { name: amount.toString(), type: "damage" }, `damage${source ? ` due to ${source}` : ""}!`);
            if (card.damage >= CardDatabase.find<CardWorker_Pokemon>(card.dbid).hp) {
                this.game.send(player, "'s", card, "was knocked out!");
                this.game.cards.move(card.id, this.game.search.findCard(card.id)!.id, player.discard.id);
                this.game.cards.takePrize(this.game.players.getOpponent(player.id).id);
                const interrupt = this.game.turns.checkActivePokemon();
                if (interrupt) {
                    this.game.interrupts.interrupt(interrupt);
                }
                return true;
            }
        }

        return false;
    }

    public heal(player_id: number, card_id: number, amount: number) {
        const player = this.game.players.get(player_id)!;
        const card = this.game.search.getCard(card_id)!;
        amount = Math.min(amount, card.damage);
        card.damage -= amount;
        this.game.send(player, "'s", card, "was healed for ", { name: amount.toString(), type: "heal" }, "HP.");
    }

    public poison(player_id: number, card_id: number) {
        const player = this.game.players.get(player_id)!;
        const card = this.game.search.getCard(card_id)!;
        card.poison = true;
        this.game.send(player, "'s", card, "was poisoned!");
    }

    public confuse(player_id: number, card_id: number) {
        const player = this.game.players.get(player_id)!;
        const card = this.game.search.getCard(card_id)!;
        card.orientation = "confused";
        this.game.send(player, "'s", card, "got confused!");
    }

    public paralyze(player_id: number, card_id: number) {
        const player = this.game.players.get(player_id)!;
        const card = this.game.search.getCard(card_id)!;
        card.orientation = "paralyzed";
        this.game.send(player, "'s", card, "was paralyzed!");
    }
};
