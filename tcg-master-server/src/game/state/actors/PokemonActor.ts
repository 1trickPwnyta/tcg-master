import { CardDatabase } from "../../cards/CardDatabase.js";
import { CardWorker_Energy } from "../../cards/workers/CardWorker_Energy.js";
import { CardWorker_Pokemon } from "../../cards/workers/CardWorker_Pokemon.js";
import { EnergyType } from "../../EnergyType.js";
import { CardState, CardStatus } from "../CardState.js";
import { StateActor } from "./StateActor.js";

export type DamageContext = {
    owner_id: number;
    card_id: number;
    amount: number;
    source?: string;
    type?: EnergyType;
};

export class PokemonActor extends StateActor {
    public getEnergy(card_id: number): { card: CardState, worker: CardWorker_Energy }[] {
        return this.game.search.getCard(card_id)!.attachments.cards.filter(c => c.kind === "energy").map(c => ({
            card: c,
            worker: CardDatabase.find<CardWorker_Energy>(c.dbid)
        }));
    }

    public damage(context: DamageContext): boolean {
        let amount = context.amount;

        const card = this.game.search.getCard(context.card_id)!;
        const worker = CardDatabase.find<CardWorker_Pokemon>(card.dbid);
        if (context.type) {
            if (worker.weakness === context.type) {
                amount *= 2;
            }
            if (worker.resistance === context.type) {
                amount -= 30;
                amount = Math.max(0, amount);
            }
        }

        if (card.damageThreshold && card.damageThreshold > amount) {
            amount = 0;
        }

        if (amount > 0) {
            const player = this.game.players.get(context.owner_id)!;
            const card = this.game.search.getCard(context.card_id)!;
            card.damage += amount;
            this.game.send(player, "'s", card, "took", { name: amount.toString(), type: "damage" }, `damage${context.source ? ` due to ${context.source}` : ""}!`);
            if (card.damage >= CardDatabase.find<CardWorker_Pokemon>(card.dbid).hp) {
                this.knockOut(player.id, card.id);
                return true;
            }
        }

        return false;
    }

    public knockOut(player_id: number, card_id: number) {
        const player = this.game.players.get(player_id)!;
        const card = this.game.search.getCard(card_id)!;
        this.game.send(player, "'s", card, "was knocked out!");
        this.game.cards.move(card.id, this.game.search.findCard(card.id)!.id, player.discard.id);
        this.game.cards.takePrize(this.game.players.getOpponent(player.id).id);
        const interrupt = this.game.turns.checkActivePokemon();
        if (interrupt) {
            this.game.interrupts.interrupt(interrupt);
        }
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

    public sleep(player_id: number, card_id: number) {
        const player = this.game.players.get(player_id)!;
        const card = this.game.search.getCard(card_id)!;
        card.orientation = "asleep";
        this.game.send(player, "'s", card, "fell asleep!");
    }

    public hasStatus(card_id: number, status: CardStatus): boolean {
        const card = this.game.search.getCard(card_id)!;
        return card.status.includes(status);
    }

    public giveStatus(card_id: number, status: CardStatus) {
        const card = this.game.search.getCard(card_id)!;
        if (!card.status.includes(status)) {
            card.status.push(status);
        }
    }

    public removeStatus(card_id: number, status: CardStatus) {
        const card = this.game.search.getCard(card_id)!;
        card.status = card.status.filter(s => s !== status);
    }
};
