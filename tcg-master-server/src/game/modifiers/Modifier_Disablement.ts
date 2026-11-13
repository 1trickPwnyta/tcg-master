import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_Disablement extends StatusModifier {
    public override notify_given(context: ModifierContext, args: any): void {
        context.engine.send(...context.card.fullTokens, "'s", args.attack_name, "was disabled.");
    }

    public override canUseAttack(_context: ModifierContext, attackName: string, args: any): boolean {
        return attackName !== args.attack_name;
    }

    public override notify_endOfTurn(context: ModifierContext, turn_id: number): void {
        if (context.owner.id === turn_id) {
            this.remove(context);
        }
    }
};
