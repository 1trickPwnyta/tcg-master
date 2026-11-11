import { ModifierContext } from "./Modifier.js";
import { ModifierStatus } from "./ModifierStatus.js";

export class Modifier_Smokescreen extends ModifierStatus {
    public override modifyDamageDealt(context: ModifierContext, amount: number): number {
        if (!context.engine.game.flipCoin(context.card.owner)) {
            context.engine.send("The attack did nothing.");
            return -1;
        } else {
            return amount;
        }
    }

    public override notify_endOfTurn(context: ModifierContext, turn_id: number): void {
        if (context.owner.id === turn_id) {
            this.remove(context);
        }
    }
};
