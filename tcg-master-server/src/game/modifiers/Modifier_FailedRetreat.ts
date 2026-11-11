import { ModifierContext } from "./Modifier.js";
import { ModifierStatus } from "./ModifierStatus.js";

export class Modifier_FailedRetreat extends ModifierStatus {
    public override notify_endOfTurn(context: ModifierContext) {
        this.remove(context);
    }
};
