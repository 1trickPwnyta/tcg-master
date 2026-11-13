import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_LeekSlap extends StatusModifier {
    public override canUseAttack(_context: ModifierContext, attackName: string): boolean {
        return attackName !== "Leek Slap";
    }
};
