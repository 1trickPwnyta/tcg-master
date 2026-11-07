import { CardDef } from "../../../../defs/CardDef.js";
import { DefDatabase } from "../../../../defs/DefDatabase.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.PlayCard)
export class InterruptWorker_PlayCard extends InterruptWorker {
    public override execute(context: InterruptContext, card_id: number | null): boolean {
        if (card_id) {
            const card = context.game.search.getCard(card_id)!;
            const def = DefDatabase.get<CardDef>(card.def);
            return def.play({ game: context.game, state: context.state, player: context.game.players.active, card: card });
        } else {
            const player = context.game.players.active;
            context.game.interrupts.interrupt({
                player: player.id,
                prompt: "Select a card to play from your hand.",
                choices: player.hand.cards.map(c => ({ text: c.name, target_id: c.id })),
                resolution: InterruptResolution.PlayCard
            });
            return true;
        }
    }
};
