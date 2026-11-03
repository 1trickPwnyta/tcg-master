import { CardDatabase } from "../../cards/CardDatabase.js";
import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.PlayCard)
export class StateWorker_PlayCard extends StateWorker {
    public override execute(context: StateContext, card_id: number): boolean {
        if (card_id) {
            const card = context.game.getCard(card_id)!;
            const worker = CardDatabase.find(card.dbid);
            return worker.play({ game: context.game, state: context.state, player: context.game.activePlayer, card: card });
        } else {
            const player = context.game.activePlayer;
            context.game.interrupt({
                player: player.id,
                prompt: "Select a card to play from your hand.",
                choices: player.hand.cards.map(c => ({ text: c.name, target_id: c.id })),
                resolution: InterruptResolution.PlayCard
            });
            return true;
        }
    }
};
