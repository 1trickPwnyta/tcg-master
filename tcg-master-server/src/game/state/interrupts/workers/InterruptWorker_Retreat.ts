import { PokemonCardDef } from "../../../../defs/PokemonCardDef.js";
import { DefDatabase } from "../../../../defs/DefDatabase.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.Retreat)
export class InterruptWorker_Retreat extends InterruptWorker {
    public override execute(context: InterruptContext, replacement_id: number): boolean {
        const player = context.game.players.active;
        if (!player.bench.cards.length) {
            context.game.sendError(player, "There are no Pokémon on your bench to switch with.");
            return false;
        }

        const card = player.active.cards[0];
        if (card.orientation === "paralyzed") {
            context.game.sendError(player, card, "can't retreat due to paralysis.");
            return false;
        }
        if (card.orientation === "asleep") {
            context.game.sendError(player, card, "can't retreat due to sleep.");
            return false;
        }
        const def = DefDatabase.get<PokemonCardDef>(card.def);
        const energy = context.game.pokemon.getEnergy(card.id);
        const paid = [];
        let amount = 0;
        while (energy.length && amount < def.retreat) {
            const next = energy.pop()!;
            amount += next.def.amount;
            paid.push(next.card.id);
        }
        if (amount < def.retreat) {
            context.game.sendError(player, card, "doesn't have enough energy to retreat.");
            return false;
        } else if (replacement_id) {
            while (paid.length) {
                context.game.cards.move(paid.pop()!, card.attachments.id, player.discard.id);
            }
            context.game.cards.move(player.active.cards[0].id, player.active.id, player.bench.id);
            context.game.cards.move(replacement_id, player.bench.id, player.active.id);
            context.game.send(player, "'s", card, "retreated to the bench.");
            context.game.send(player, "sent out", player.active.cards[0], "!");
            return true;
        } else {
            context.game.interrupts.interrupt({
                player: player.id,
                prompt: `Which Pokémon on your bench will replace ${card.name}?`,
                choices: player.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
                resolution: InterruptResolution.Retreat
            });
            return true;
        }
    }
};
