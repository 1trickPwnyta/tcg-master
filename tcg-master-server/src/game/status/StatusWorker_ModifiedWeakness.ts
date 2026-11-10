import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_ModifiedWeakness extends StatusWorker {
    public override notify_given(context: StatusContext, args: any): void {
        context.engine.send(...context.card.fullTokens, "'s weakness was changed to", args.type, ".");
    }
    
    public override getModifiedWeakness(_context: StatusContext, args: any): EnergyTypeDef | undefined {
        return args.type;
    }
};
