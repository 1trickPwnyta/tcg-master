import { DamageContext } from "../state/PokemonCard.js";
import { ModifierContext } from "./Modifier.js";
import { AttachmentModifier } from "./AttachmentModifier.js";

export class Modifier_Defender extends AttachmentModifier {
    public override modifyDamageTaken(context: ModifierContext, damageContext: DamageContext,args: any): number {
        if (damageContext.source === "attack") {
            damageContext.amount = Math.max(0, damageContext.amount - 20);
        }

        return damageContext.amount;
    }

    public override notify_endOfTurn(context: ModifierContext, turn_id: number): void {
        if (turn_id !== context.owner.id) {
            this.remove(context);
        }
    }
};
