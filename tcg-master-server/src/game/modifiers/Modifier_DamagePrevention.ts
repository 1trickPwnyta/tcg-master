import { ModifierContext } from "./Modifier.js";
import { ModifierStatus } from "./ModifierStatus.js";

export class Modifier_DamagePrevention extends ModifierStatus {
    public override modifyDamageTaken(_context: ModifierContext, amount: number, args: any): number {
        if (args.buffer && amount <= args.buffer) {
            amount = 0;
        }
        if (args.amount) {
            amount -= (args.amount === "all" ? amount : args.amount);
        }
        return amount;
    }

    public override notify_endOfTurn(context: ModifierContext, turn_id: number) {
        if (turn_id === context.card.owner.opponent.id) {
            this.remove(context);
        }
    }
};
