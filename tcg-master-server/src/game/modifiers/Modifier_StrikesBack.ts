import { DamageContext } from "../state/PokemonCard.js";
import { ModifierContext } from "./Modifier.js";
import { PokemonPowerModifier } from "./PokemonPowerModifier.js";

export class Modifier_StrikesBack extends PokemonPowerModifier {
    public override notify_damageTaken(context: ModifierContext, damageContext: DamageContext): void {
        if (damageContext.source === "attack") {
            if (!this.hasDisqualifyingStatus(context.card)) {
                damageContext.attacker?.dealDamage({
                    amount: 10,
                    source: this.label
                });
            }
        }
    }
};
