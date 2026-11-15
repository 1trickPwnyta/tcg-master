import { DefDatabase } from "../../defs/DefDatabase.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_ModifiedResistance extends StatusModifier {
    public override notify_given(context: ModifierContext, args: any): void {
        const type = DefDatabase.get<EnergyTypeDef>(args.type);
        context.engine.send(...context.card.fullTokens, "'s resistance was changed to", type, ".");
    }

    public override getModifiedResistance(_context: ModifierContext, args: any): EnergyTypeDef | undefined {
        return DefDatabase.get<EnergyTypeDef>(args.type);
    }
};
