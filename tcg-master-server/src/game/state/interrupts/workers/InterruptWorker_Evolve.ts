import { PokemonCard } from "../../PokemonCard.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.Evolve)
export class InterruptWorker_Evolve extends InterruptWorker {
    public override execute(context: InterruptContext, card_id: number, evolution_id: number): boolean {
        const card = context.engine.search.getCard(card_id) as PokemonCard;
        const evolution = context.engine.search.getCard(evolution_id) as PokemonCard;
        if (card.location && card && evolution) {
            card.location.add(evolution);
            evolution.damage = card.damage;
            card.attachments.transfer(evolution.attachments);
            evolution.attachments.add(card);
            context.engine.send(context.engine.game.activePlayer, "'s", card, "evolved into", evolution, "!");
        } else {
            throw new Error("Couldn't find the card to evolve or the evolution card.");
        }
        return true;
    }
};
