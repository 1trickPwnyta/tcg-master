import { PokemonCard } from "../../PokemonCard.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.Evolve)
export class InterruptWorker_Evolve extends InterruptWorker {
    public override execute(context: InterruptContext, card_id: number, evolution_id: number): boolean {
        const card = context.engine.search.getCard(card_id) as PokemonCard;
        const evolution = context.engine.search.getCard(evolution_id) as PokemonCard;
        card.evolve(evolution);
        return true;
    }
};
