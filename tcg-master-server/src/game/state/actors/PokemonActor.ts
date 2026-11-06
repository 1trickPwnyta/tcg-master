import { CardDef_Energy } from "../../../defs/CardDef_Energy.js";
import { CardDef_Pokemon } from "../../../defs/CardDef_Pokemon.js";
import { DefDatabase } from "../../../defs/DefDatabase.js";
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
    public getEnergy(card_id: number): { card: CardState, def: CardDef_Energy }[] {
        return this.game.search.getCard(card_id)!.attachments.cards.filter(c => c.kind === "energy").map(c => ({
            card: c,
            def: DefDatabase.get<CardDef_Energy>(c.def)
        }));
    }

    public damage(context: DamageContext): boolean {
        let amount = context.amount;

        const card = this.game.search.getCard(context.card_id)!;
        const def = DefDatabase.get<CardDef_Pokemon>(card.def);
        if (context.type) {
            if (def.weakness === context.type) {
                amount *= 2;
            }
            if (def.resistance === context.type) {
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
            if (card.damage >= DefDatabase.get<CardDef_Pokemon>(card.def).hp) {
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
