import { DefDatabase } from "../../defs/DefDatabase.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { AttachmentModifier } from "./AttachmentModifier.js";
import { ModifierContext } from "./Modifier.js";

export class Modifier_Energy extends AttachmentModifier {
    public override get isEnergy(): boolean {
        return true;
    }

    public override provideEnergy(_context: ModifierContext, args: any): EnergyTypeDef[] {
        if (args) {
            const def = DefDatabase.get<EnergyTypeDef>(args.type);
            return Array.from({ length: args.amount }, () => def);
        } else {
            return super.provideEnergy(_context, args);
        }
    }
};
