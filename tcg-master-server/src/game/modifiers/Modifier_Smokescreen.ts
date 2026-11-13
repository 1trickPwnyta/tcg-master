import { DamageContext } from "../state/PokemonCard.js";
import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_Smokescreen extends StatusModifier {
    public override modifyDamageDealt(context: ModifierContext, damageContext: DamageContext): number {
        if (!context.engine.game.flipCoin(context.card.owner)) {
            context.engine.send("The attack did nothing.");
            return -1;
        } else {
            return damageContext.amount;
        }
    }

    public override notify_endOfTurn(context: ModifierContext, turn_id: number): void {
        if (context.owner.id === turn_id) {
            this.remove(context);
        }
    }
};
