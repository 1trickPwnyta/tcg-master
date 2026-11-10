import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Flail extends AttackWorker {
    public override preEffect(context: AttackContext, damage: number): number {
        return damage + context.attacker.damage;
    }
};
