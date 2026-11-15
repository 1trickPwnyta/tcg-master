import { AttackContext } from "../attacks/AttackContext.js";
import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_Smokescreen extends StatusModifier {
    public override try_attack(context: ModifierContext, attackContext: AttackContext) {
        if (!context.engine.game.flipCoin(context.owner)) {
            attackContext.fail();
        }
    }

    public override notify_endOfTurn(context: ModifierContext, turn_id: number): void {
        if (context.owner.id === turn_id) {
            this.remove(context);
        }
    }
};
