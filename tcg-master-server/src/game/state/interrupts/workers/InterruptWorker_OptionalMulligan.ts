import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.OptionalMulligan)
export class InterruptWorker_OptionalMulligan extends InterruptWorker {
    public override execute(context: InterruptContext, answer: "yes" | "no", player_id: number, mulligans: number): boolean {
        const player = context.engine.game.getPlayer(player_id);
        if (answer === "yes") {
            player.hand.reveal();
            context.engine.send(player, "has no basic Pokémon in", player.pronouns.possessive, "hand.", player.pronouns.subjective.capitalizeFirst(), "must take a mulligan.");
            player.hand.shuffleIntoDeck();
            const totalMulligans = context.engine.setup.setupDraw(player, mulligans + 1);
            if (totalMulligans !== null) {
                player.mulligans = totalMulligans;
            }
        } else {
            player.mulligans = mulligans;
        }

        return true;
    }
};
