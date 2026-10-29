import { CardDatabase } from "../../cards/CardDatabase.js";
import { CardWorker_Energy } from "../../cards/CardWorker_Energy.js";
import { CardWorker_Pokemon } from "../../cards/CardWorker_Pokemon.js";
import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.Retreat)
export class StateWorker_Retreat extends StateWorker {
    public override execute(context: StateContext, replacement_id: string): boolean {
        const player = context.game.activePlayer;
        if (!player.bench.cards.length) {
            context.game.sendError(player, "There are no Pokémon on your bench to switch with.");
            return false;
        }

        const card = player.active.cards[0];
        const worker = CardDatabase.find<CardWorker_Pokemon>(card.dbid);
        const energy = card.attachments.cards.map(c => ({ id: c.id, worker: CardDatabase.find<CardWorker_Energy>(c.dbid) }));
        const paid = [];
        let amount = 0;
        while (energy.length && amount < worker.retreatCost) {
            const next = energy.pop()!;
            amount += next.worker.amount;
            paid.push(next.id);
        }
        if (amount < worker.retreatCost) {
            context.game.sendError(player, card, "doesn't have enough energy to retreat.");
            return false;
        } else if (replacement_id) {
            context.game.moveCard(player.active.cards[0].id, player.active.id, player.bench.id);
            context.game.moveCard(replacement_id, player.bench.id, player.active.id);
            context.game.send(player, "'s", card, "retreated to the bench.");
            context.game.send(player, "sent out", player.active.cards[0], "!");
            return true;
        } else {
            context.game.interrupt({
                player: player.id,
                prompt: `Which Pokémon on your bench will replace ${card.name}?`,
                choices: player.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
                resolution: InterruptResolution.Retreat
            });
            return true;
        }
    }
};
