import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.PlayCard)
export class InterruptWorker_PlayCard extends InterruptWorker {
    public override execute(context: InterruptContext, card_id: number | null): boolean {
        if (card_id) {
            const card = context.engine.search.getCard(card_id)!;
            return card.play();
        } else {
            const player = context.engine.game.activePlayer;
            context.engine.interrupts.interrupt({
                player: player.id,
                prompt: "Select a card to play from your hand.",
                choices: player.hand.cards.map(c => ({ text: c.name, target_id: c.id })),
                resolution: InterruptResolution.PlayCard
            });
            return true;
        }
    }
};
