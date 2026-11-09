import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Missable extends AttackWorker {
    public override preEffect(context: AttackContext, damage: number): number {
        if (!context.engine.game.flipCoin(context.attacker.owner)) {
            return -1;
        } else {
            return damage;
        }
    }
}