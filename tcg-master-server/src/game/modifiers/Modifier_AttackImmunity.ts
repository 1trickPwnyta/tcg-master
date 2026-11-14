import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_AttackImmunity extends StatusModifier {
    public override notify_endOfTurn(context: ModifierContext, turn_id: number) {
        if (turn_id === context.card.owner.opponent.id) {
            this.remove(context);
        }
    }
};
