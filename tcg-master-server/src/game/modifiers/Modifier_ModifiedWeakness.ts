import { DefDatabase } from "../../defs/DefDatabase.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_ModifiedWeakness extends StatusModifier {
    public override notify_given(context: ModifierContext, args: any): void {
        const type = DefDatabase.get<EnergyTypeDef>(args.type);
        context.engine.send(...context.card.fullTokens, "'s weakness was changed to", type, ".");
    }
    
    public override getModifiedWeakness(_context: ModifierContext, args: any): EnergyTypeDef | undefined {
        return DefDatabase.get<EnergyTypeDef>(args.type);
    }
};
