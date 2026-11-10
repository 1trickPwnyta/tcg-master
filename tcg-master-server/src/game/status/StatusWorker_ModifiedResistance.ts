import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_ModifiedResistance extends StatusWorker {
    public override notify_given(context: StatusContext, args: any): void {
        context.engine.send(...context.card.fullTokens, "'s resistance was changed to", args.type, ".");
    }

    public override getModifiedResistance(_context: StatusContext, args: any): EnergyTypeDef | undefined {
        return args.type;
    }
};
