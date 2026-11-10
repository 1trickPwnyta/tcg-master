import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Absorb extends AttackWorker {
    private readonly amount?: number;
    private readonly fraction?: number;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
        this.fraction = args.fraction;
    }

    public override postEffect(context: AttackContext, knockedOut: boolean, ...targets: number[]) {
        if (context.damage) {
            const amount = this.amount ?? Math.ceil(context.damage * this.fraction!);
            context.attacker.heal(amount);
        }
    }
};