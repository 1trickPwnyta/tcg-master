import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_SelfDamage extends AttackWorker {
    private readonly amount: number;
    private readonly trigger: "coin" | "always";

    public constructor(args: any) {
        super();
        this.amount = args.amount;
        this.trigger = args.trigger;
    }

    public override postEffect(context: AttackContext) {
        if (this.trigger === "always" || !context.engine.game.flipCoin(context.attacker.owner)) {
            context.attacker.dealDamage({
                amount: this.amount,
                attacker: context.attacker,
                type: context.attacker.def.type
            });
        }
    }
};
