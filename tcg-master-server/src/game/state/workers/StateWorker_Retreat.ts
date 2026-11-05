import { CardDatabase } from "../../cards/CardDatabase.js";
import { CardWorker_Pokemon } from "../../cards/workers/CardWorker_Pokemon.js";
import { InterruptResolution } from "../interrupts/InterruptResolution.js";
import { ResolvesInterrupt } from "../interrupts/InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.Retreat)
export class StateWorker_Retreat extends StateWorker {
    public override execute(context: StateContext, replacement_id: number): boolean {
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
        const worker = CardDatabase.find<CardWorker_Pokemon>(card.dbid);
        const energy = context.game.pokemon.getEnergy(card.id);
        const paid = [];
        let amount = 0;
        while (energy.length && amount < worker.retreatCost) {
            const next = energy.pop()!;
            amount += next.worker.amount;
            paid.push(next.card.id);
        }
        if (amount < worker.retreatCost) {
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
