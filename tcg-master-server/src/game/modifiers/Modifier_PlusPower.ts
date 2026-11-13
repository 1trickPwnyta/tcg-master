import { DamageContext } from "../state/PokemonCard.js";
import { ModifierContext } from "./Modifier.js";
import { AttachmentModifier } from "./AttachmentModifier.js";

export class Modifier_PlusPower extends AttachmentModifier {
    public override modifyDamageDealt(_context: ModifierContext, damageContext: DamageContext): number {
        return damageContext.amount > 0 ? damageContext.amount + 10 : damageContext.amount;
    }

    public override notify_endOfTurn(context: ModifierContext, _turn_id: number): void {
        this.remove(context);
    }
};
