import { Choice } from "../../Choice.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.Retreat)
export class InterruptWorker_Retreat extends InterruptWorker {
    public override execute(context: InterruptContext, replacement_id: number): boolean {
        const player = context.engine.game.activePlayer;
        if (!player.bench.count) {
            context.engine.sendError(player, "There are no Pokémon on your bench to switch with.");
            return false;
        }

        const card = player.activePokemon!;
        const cantRetreatReason = card.cantRetreatReason();
        if (cantRetreatReason) {
            context.engine.sendError(player, card, "can't retreat due to", cantRetreatReason, ".");
            return false;
        }
        const energy = card.attachments.energyCards;
        const paid = [];
        let amount = 0;
        while (energy.length && amount < card.def.retreat) {
            const next = energy.pop()!;
            amount += next.amount;
            paid.push(next.card.id);
        }
        if (amount < card.def.retreat) {
            context.engine.sendError(player, card, "doesn't have enough energy to retreat.");
            return false;
        } else if (replacement_id) {
            while (paid.length) {
                const card = context.engine.search.getCard(paid.pop()!)!;
                card.discard();
            }
            let failToStatus = false;
            for (const status of card.modifiers) {
                if (!status.modifier.try_retreat({
                    engine: context.engine,
                    owner: player,
                    card: card
                })) {
                    failToStatus = true;
                    break;
                }
            }
            if (!failToStatus) {
                const replacement = context.engine.search.getCard(replacement_id)!;
                player.bench.add(player.activePokemon!);
                player.active.add(replacement);
                context.engine.send(player, "'s", card, "retreated to the bench.");
                context.engine.send(player, "sent out", player.activePokemon, "!");
            }
            return true;
        } else {
            context.engine.interrupts.interrupt({
                player: player.id,
                prompt: `Which Pokémon on your bench will replace ${card.name}?`,
                choices: player.bench.cards.map(c => new Choice(c)),
                resolution: InterruptResolution.Retreat
            });
            return true;
        }
    }
};
