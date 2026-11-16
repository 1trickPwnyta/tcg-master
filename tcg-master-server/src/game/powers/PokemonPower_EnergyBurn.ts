import { EnergyTypeDefOf } from "../../defs/defof/EnergyTypeDefOf.js";
import { EnergyCard } from "../state/EnergyCard.js";
import { PokemonPowerContext, PokemonPowerWorker } from "./PokemonPowerWorker.js";

export class PokemonPower_EnergyBurn extends PokemonPowerWorker {
    public override cantUseReason(context: PokemonPowerContext): string | null {
        if (this.hasDisqualifyingStatus(context.card)) {
            return "a status condition";
        }

        return null;
    }

    public override execute(context: PokemonPowerContext) {
        for (const energy of context.card.attachments.energyCards) {
            if (energy.card instanceof EnergyCard) {
                energy.card.setOverride(EnergyTypeDefOf.Fire);
            } else {
                const args = context.card.attachments.getArgs(energy.card.id);
                if (args) {
                    args.originalType = args.type;
                    args.type = EnergyTypeDefOf.Fire.name;
                }
            }
        }
    }
};
