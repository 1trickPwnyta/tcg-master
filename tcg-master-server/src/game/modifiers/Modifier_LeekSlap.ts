import { ModifierContext } from "./Modifier.js";
import { ModifierStatus } from "./ModifierStatus.js";

export class Modifier_LeekSlap extends ModifierStatus {
    public override canUseAttack(_context: ModifierContext, attackName: string): boolean {
        return attackName !== "Leek Slap";
    }
};
