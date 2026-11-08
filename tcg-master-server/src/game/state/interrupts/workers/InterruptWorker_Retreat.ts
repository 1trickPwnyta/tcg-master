import { PokemonCardDef } from "../../../../defs/PokemonCardDef.js";
import { DefDatabase } from "../../../../defs/DefDatabase.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";
import { StatusDef } from "../../../../defs/StatusDef.js";

@ResolvesInterrupt(InterruptResolution.Retreat)
export class InterruptWorker_Retreat extends InterruptWorker {
    public override execute(context: InterruptContext, replacement_id: number): boolean {
        const player = context.engine.players.active;
        if (!player.bench.cards.length) {
            context.engine.sendError(player, "There are no Pokémon on your bench to switch with.");
            return false;
        }

        const card = player.active.cards[0];
        const cantRetreatReason = context.engine.pokemon.cantRetreat(card.id);
        if (cantRetreatReason) {
            context.engine.sendError(player, card, "can't retreat due to", cantRetreatReason, ".");
            return false;
        }
        const def = DefDatabase.get<PokemonCardDef>(card.def);
        const energy = context.engine.pokemon.getEnergy(card.id);
        const paid = [];
        let amount = 0;
        while (energy.length && amount < def.retreat) {
            const next = energy.pop()!;
            amount += next.def.amount;
            paid.push(next.card.id);
        }
        if (amount < def.retreat) {
            context.engine.sendError(player, card, "doesn't have enough energy to retreat.");
            return false;
        } else if (replacement_id) {
            while (paid.length) {
                context.engine.cards.move(paid.pop()!, card.attachments.id, player.discard.id);
            }
            let failToStatus = false;
            for (const status of card.status) {
                const def = DefDatabase.get<StatusDef>(status);
                if (!def.worker.try_retreat({
                    engine: context.engine,
                    owner_id: player.id,
                    card_id: card.id
                })) {
                    failToStatus = true;
                    break;
                }
            }
            if (!failToStatus) {
                context.engine.cards.move(player.active.cards[0].id, player.active.id, player.bench.id);
                context.engine.cards.move(replacement_id, player.bench.id, player.active.id);
                context.engine.send(player, "'s", card, "retreated to the bench.");
                context.engine.send(player, "sent out", player.active.cards[0], "!");
            }
            return true;
        } else {
            context.engine.interrupts.interrupt({
                player: player.id,
                prompt: `Which Pokémon on your bench will replace ${card.name}?`,
                choices: player.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
                resolution: InterruptResolution.Retreat
            });
            return true;
        }
    }
};
