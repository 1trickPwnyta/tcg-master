import { AttackContext } from "../attacks/AttackContext.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { EffectWorker } from "./EffectWorker.js";

export class EffectWorker_Absorb extends EffectWorker {
    public getTarget(context: AttackContext): PokemonCard | null {
        return context.attacker;
    }

    public apply(context: AttackContext, args?: any) {
        if (context.finalDamage) {
            const amount = args.amount ?? Math.ceil(context.finalDamage * args.fraction!);
            context.attacker.heal(amount);
        }
    }
};
