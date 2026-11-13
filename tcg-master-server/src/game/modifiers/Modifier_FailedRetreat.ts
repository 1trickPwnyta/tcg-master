import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_FailedRetreat extends StatusModifier {
    public override notify_endOfTurn(context: ModifierContext) {
        this.remove(context);
    }
};
