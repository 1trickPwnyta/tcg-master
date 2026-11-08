import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_FoulGas extends AttackWorker {
    public override postEffect(context: AttackContext, knockedOut: boolean) {
        if(!knockedOut) {
            if (context.engine.flipCoin(context.engine.players.active.id)) {
                context.engine.pokemon.poison(context.engine.players.inactive.id, context.defender.id);
            } else {
                context.engine.pokemon.confuse(context.engine.players.inactive.id, context.defender.id);
            }
        }
    }
};
