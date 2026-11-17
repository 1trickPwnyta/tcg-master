import { TrainerCard } from "../state/TrainerCard.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Lass extends TrainerWorker {
    public override execute(context: TrainerContext) {
        context.player.hand.reveal();
        context.player.opponent.hand.reveal();

        for (const player of context.engine.game.players) {
            for (const trainer of player.hand.cards.filter(c => c instanceof TrainerCard && c != context.card)) {
                player.deck.add(trainer);
            }
            player.deck.shuffle();
        }
    }
};
