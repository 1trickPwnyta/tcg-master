import { DamageContext } from "../state/PokemonCard.js";
import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_DamagePrevention extends StatusModifier {
    public override modifyDamageTaken(_context: ModifierContext, damageContext: DamageContext, args: any): number {
        if (args.buffer && damageContext.amount <= args.buffer) {
            damageContext.amount = 0;
        }
        if (args.amount) {
            damageContext.amount -= (args.amount === "all" ? damageContext.amount : args.amount);
        }
        return damageContext.amount;
    }

    public override notify_endOfTurn(context: ModifierContext, turn_id: number) {
        if (turn_id === context.card.owner.opponent.id) {
            this.remove(context);
        }
    }
};
