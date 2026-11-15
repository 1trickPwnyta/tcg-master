import { AttackContext } from "../attacks/AttackContext.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { EffectWorker } from "./EffectWorker.js";

export class EffectWorker_BenchDamage extends EffectWorker {
    public override getTarget(context: AttackContext, args?: any): PokemonCard | null {
        return context.engine.search.getCard(args.target) as PokemonCard;
    }

    public override apply(context: AttackContext, args?: any): void {
        this.getTarget(context, args)!.dealDamage({
            amount: args.amount,
            attacker: context.attacker,
            source: "attack"
        });
    }
};
