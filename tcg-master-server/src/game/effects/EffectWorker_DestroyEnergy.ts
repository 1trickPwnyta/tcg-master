import { AttackContext } from "../attacks/AttackContext.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { EffectWorker } from "./EffectWorker.js";

export class EffectWorker_DestroyEnergy extends EffectWorker {
    public override getTarget(context: AttackContext): PokemonCard | null {
        return context.defender;
    }

    public override apply(context: AttackContext, args?: any): void {
        if (context.defender.inPlay) {
            const card = context.engine.search.getCard(args.energy)!;
            card.discard();
            context.engine.send(card, "was discarded from", ...context.defender.fullTokens, ".");
        }
    }
}