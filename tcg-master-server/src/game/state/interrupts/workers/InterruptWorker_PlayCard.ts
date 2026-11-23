import { Choice } from "../Choice.js";
import { InterruptSync } from "../Interrupt.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { MenuOption } from "../MenuOption.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.PlayCard)
export class InterruptWorker_PlayCard extends InterruptWorker {
    public override execute(context: InterruptContext, card_id: number | MenuOption.PlayCard): boolean {
        if (card_id !== MenuOption.PlayCard) {
            const card = context.engine.search.getCard(card_id)!;
            return card.play();
        } else {
            const player = context.engine.game.activePlayer;
            context.engine.interrupts.interrupt(new InterruptSync(player)
                .withPrompt("Select a card to play from your hand.")
                .withChoices(player.hand.cards.map(c => new Choice(c)))
                .withResolution(InterruptResolution.PlayCard));
            return true;
        }
    }
};
