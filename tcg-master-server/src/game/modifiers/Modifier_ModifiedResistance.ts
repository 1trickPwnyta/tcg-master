import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { ModifierContext } from "./Modifier.js";
import { ModifierStatus } from "./ModifierStatus.js";

export class Modifier_ModifiedResistance extends ModifierStatus {
    public override notify_given(context: ModifierContext, args: any): void {
        context.engine.send(...context.card.fullTokens, "'s resistance was changed to", args.type, ".");
    }

    public override getModifiedResistance(_context: ModifierContext, args: any): EnergyTypeDef | undefined {
        return args.type;
    }
};
