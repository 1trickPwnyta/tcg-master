import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.Evolve)
export class StateWorker_Evolve extends StateWorker {
    public override execute(context: StateContext, card_id: number, evolution_id: number): boolean {
        const location = context.game.findCard(card_id);
        const card = location?.cards.find(c => c.id === card_id);
        const evolution = context.game.getCard(evolution_id);
        if (location && card && evolution) {
            context.game.moveCard(evolution_id, context.game.activePlayer.hand.id, location.id);
            evolution.damage = card.damage;
            try {
                for (const attachment of card.attachments.cards) {
                    context.game.moveCard(attachment.id, card.attachments.id, evolution.attachments.id);
                }
            } catch (e) {
                debugger;
                throw e;
            }
            context.game.moveCard(card_id, location.id, evolution.attachments.id);
            context.game.send(context.game.activePlayer, "'s", card, "evolved into", evolution, "!");
        } else {
            throw new Error("Couldn't find the card to evolve or the evolution card.");
        }
        return true;
    }
};
