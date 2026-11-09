import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Heal extends AttackWorker {
    private readonly amount: number | "all";

    public constructor(args: any) {
        super();
        this.amount = args.amount;
    }
    
    public override postEffect(context: AttackContext, knockedOut: boolean, ...targets: number[]) {
        context.attacker.heal(this.amount === "all" ? context.attacker.damage : this.amount);
    }
};
