import { ModifierContext } from "./Modifier.js";
import { ModifierTrainer } from "./ModifierTrainer.js";

export class Modifier_PlusPower extends ModifierTrainer {
    public override modifyDamageDealt(_context: ModifierContext, amount: number): number {
        return amount > 0 ? amount + 10 : amount;
    }

    public override notify_endOfTurn(context: ModifierContext, _turn_id: number): void {
        this.remove(context);
    }
};
