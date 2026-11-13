import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_ModifiedResistance extends StatusModifier {
    public override notify_given(context: ModifierContext, args: any): void {
        context.engine.send(...context.card.fullTokens, "'s resistance was changed to", args.type, ".");
    }

    public override getModifiedResistance(_context: ModifierContext, args: any): EnergyTypeDef | undefined {
        return args.type;
    }
};
