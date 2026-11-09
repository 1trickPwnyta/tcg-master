import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_FoulGas extends AttackWorker {
    public override postEffect(context: AttackContext, knockedOut: boolean) {
        if(!knockedOut) {
            if (context.engine.game.flipCoin(context.engine.game.activePlayer)) {
                context.defender.poison();
            } else {
                context.defender.confuse();
            }
        }
    }
};
