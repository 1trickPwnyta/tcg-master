import { EffectDef } from "../../defs/EffectDef.js";
import { AttackContext } from "../attacks/AttackContext.js";
import { PokemonCard } from "../state/PokemonCard.js";

export type EffectContext = {
    def: EffectDef;
    args?: any;
};

export abstract class EffectWorker {
    public abstract getTarget(context: AttackContext): PokemonCard | null;

    public abstract apply(context: AttackContext, args?: any): void;
};
