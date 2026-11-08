import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_DestinyBond extends StatusWorker {
    public override notify_knockedOut(context: StatusContext, attacker_id?: number) {
        if (attacker_id) {
            context.engine.pokemon.knockOut(context.engine.players.active.id, attacker_id);
        }
    }

    public override notify_endOfTurn(context: StatusContext, turn_id: number) {
        if (context.owner_id !== turn_id) {
            this.remove(context);
        }
    }
};
