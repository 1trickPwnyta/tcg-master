import { EnergyCardDef } from "../../defs/EnergyCardDef.js";
import { PokemonCardDef } from "../../defs/PokemonCardDef.js";
import { DefDatabase } from "../../defs/DefDatabase.js";
import { CardState } from "../state/CardState.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { SubEngine } from "./SubEngine.js";
import { StatusDefOf } from "../../defs/defof/StatusDefOf.js";
import { StatusDef } from "../../defs/StatusDef.js";

export type DamageContext = {
    owner_id: number;
    card_id: number;
    amount: number;
    attacker_id?: number;
    source?: string;
    type?: EnergyTypeDef;
};

export class PokemonEngine extends SubEngine {
    public getEnergy(card_id: number): { card: CardState, def: EnergyCardDef }[] {
        return this.engine.search.getCard(card_id)!.attachments.cards.filter(c => c.kind === "energy").map(c => ({
            card: c,
            def: DefDatabase.get<EnergyCardDef>(c.def)
        }));
    }

    public cantAttack(card_id: number): string | null {
        const card = this.engine.search.getCard(card_id)!;
        for (const status of card.status) {
            const def = DefDatabase.get<StatusDef>(status);
            if (!def.canAttack) {
                return def.label;
            }
        }

        return null;
    }

    public cantRetreat(card_id: number): string | null {
        const card = this.engine.search.getCard(card_id)!;
        for (const status of card.status) {
            const def = DefDatabase.get<StatusDef>(status);
            if (!def.canRetreat) {
                return def.label;
            }
        }

        return null;
    }

    public damage(context: DamageContext): boolean {
        let amount = context.amount;

        const card = this.engine.search.getCard(context.card_id)!;
        const def = DefDatabase.get<PokemonCardDef>(card.def);
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
            const player = this.engine.players.get(context.owner_id)!;
            const card = this.engine.search.getCard(context.card_id)!;
            card.damage += amount;
            this.engine.send(player, "'s", card, "took", { name: amount.toString(), type: "damage" }, `damage${context.source ? ` due to ${context.source}` : ""}!`);
            if (card.damage >= DefDatabase.get<PokemonCardDef>(card.def).hp) {
                this.knockOut(player.id, card.id, context.attacker_id);
                return true;
            }
        }

        return false;
    }

    public knockOut(player_id: number, card_id: number, attacker_id?: number) {
        const player = this.engine.players.get(player_id)!;
        const card = this.engine.search.getCard(card_id)!;
        this.engine.send(player, "'s", card, "was knocked out!");
        for (const status of card.status) {
            const def = DefDatabase.get<StatusDef>(status);
            def.worker.notify_knockedOut({
                engine: this.engine,
                owner_id: player_id,
                card_id: card_id
            }, attacker_id);
        }
        this.engine.cards.move(card.id, this.engine.search.findCard(card.id)!.id, player.discard.id);
        this.engine.cards.takePrize(this.engine.players.getOpponent(player.id).id);
        const interrupt = this.engine.turns.checkActivePokemon();
        if (interrupt) {
            this.engine.interrupts.interrupt(interrupt);
        }
    }

    public heal(player_id: number, card_id: number, amount: number) {
        const player = this.engine.players.get(player_id)!;
        const card = this.engine.search.getCard(card_id)!;
        amount = Math.min(amount, card.damage);
        card.damage -= amount;
        this.engine.send(player, "'s", card, "was healed for ", { name: amount.toString(), type: "heal" }, "HP.");
    }

    public giveStatus(player_id: number, card_id: number, status: StatusDef) {
        status.worker.give({
            engine: this.engine,
            owner_id: player_id,
            card_id: card_id
        });
    }

    public poison(player_id: number, card_id: number) {
        StatusDefOf.Poison.worker.give({
            engine: this.engine,
            owner_id: player_id,
            card_id: card_id
        });
    }

    public confuse(player_id: number, card_id: number) {
        StatusDefOf.Confusion.worker.give({
            engine: this.engine,
            owner_id: player_id,
            card_id: card_id
        });
    }

    public paralyze(player_id: number, card_id: number) {
        StatusDefOf.Paralysis.worker.give({
            engine: this.engine,
            owner_id: player_id,
            card_id: card_id
        });
    }

    public sleep(player_id: number, card_id: number) {
        StatusDefOf.Sleep.worker.give({
            engine: this.engine,
            owner_id: player_id,
            card_id: card_id
        });
    }
};
