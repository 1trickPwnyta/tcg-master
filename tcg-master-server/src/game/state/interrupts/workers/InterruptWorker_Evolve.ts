import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.Evolve)
export class InterruptWorker_Evolve extends InterruptWorker {
    public override execute(context: InterruptContext, card_id: number, evolution_id: number): boolean {
        const location = context.engine.search.findCard(card_id);
        const card = location?.cards.find(c => c.id === card_id);
        const evolution = context.engine.search.getCard(evolution_id);
        if (location && card && evolution) {
            context.engine.cards.move(evolution_id, context.engine.players.active.hand.id, location.id);
            evolution.damage = card.damage;
            try {
                for (const attachment of card.attachments.cards) {
                    context.engine.cards.move(attachment.id, card.attachments.id, evolution.attachments.id);
                }
            } catch (e) {
                debugger;
                throw e;
            }
            context.engine.cards.move(card_id, location.id, evolution.attachments.id);
            context.engine.send(context.engine.players.active, "'s", card, "evolved into", evolution, "!");
        } else {
            throw new Error("Couldn't find the card to evolve or the evolution card.");
        }
        return true;
    }
};
