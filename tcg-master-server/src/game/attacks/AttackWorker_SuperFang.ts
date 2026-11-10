import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_SuperFang extends AttackWorker {
    public override preEffect(context: AttackContext, damage: number): number {
        const remaining = context.defender.def.hp - context.defender.damage;
        return damage + Math.ceil(remaining / 20) * 10;
    }
};
