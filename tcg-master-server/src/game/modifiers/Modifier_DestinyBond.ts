import { PokemonCard } from "../state/PokemonCard.js";
import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_DestinyBond extends StatusModifier {
    public override notify_knockedOut(_context: ModifierContext, attacker?: PokemonCard) {
        attacker?.knockOut();
    }

    public override notify_endOfTurn(context: ModifierContext, turn_id: number) {
        if (context.owner.id !== turn_id) {
            this.remove(context);
        }
    }
};
