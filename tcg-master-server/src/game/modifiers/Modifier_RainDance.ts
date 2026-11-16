import { EnergyTypeDefOf } from "../../defs/defof/EnergyTypeDefOf.js";
import { EnergyCard } from "../state/EnergyCard.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { ModifierContext } from "./Modifier.js";
import { PokemonPowerModifier } from "./PokemonPowerModifier.js";

export class Modifier_RainDance extends PokemonPowerModifier {
    public override overrideAllowPlayEnergy(context: ModifierContext, energy: EnergyCard, target: PokemonCard): boolean {
        return !this.hasDisqualifyingStatus(context.card) && energy.def.type == EnergyTypeDefOf.Water && target.def.type == EnergyTypeDefOf.Water;
    }
};
