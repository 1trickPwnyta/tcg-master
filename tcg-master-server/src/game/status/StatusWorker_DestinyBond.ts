import { PokemonCard } from "../state/PokemonCard.js";
import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_DestinyBond extends StatusWorker {
    public override notify_knockedOut(context: StatusContext, attacker?: PokemonCard) {
        attacker?.knockOut();
    }

    public override notify_endOfTurn(context: StatusContext, turn_id: number) {
        if (context.owner.id !== turn_id) {
            this.remove(context);
        }
    }
};
