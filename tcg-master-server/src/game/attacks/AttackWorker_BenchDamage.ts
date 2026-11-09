import { Player } from "../state/Player.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_BenchDamage extends AttackWorker {
    private readonly amount: number;
    private readonly target: "all" | "choose";
    private readonly scope: "attacker" | "defender" | "both";

    public constructor(args: any) {
        super();
        this.amount = args.amount;
        this.target = args.target;
        this.scope = args.scope;
    }

    public override postEffect(context: AttackContext, knockedOut: boolean, ...targets: number[]) {
        if (this.scope === "attacker" || this.scope === "both") {
            this.damageBench(context, context.attacker.owner);
        }
        if (this.scope === "defender" || this.scope === "both") {
            this.damageBench(context, context.defender.owner);
        }
    }

    private damageBench(context: AttackContext, player: Player) {
        if (this.target === "all") {
            for (const card of player.bench.cards) {
                card.dealDamage({
                    amount: this.amount,
                    attacker: context.attacker
                })
            }
        }
    }
};
