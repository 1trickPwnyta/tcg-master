import { DefDatabase } from "../../../defs/DefDatabase.js";
import { EffectDef } from "../../../defs/EffectDef.js";
import { Player } from "../../state/Player.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_BenchDamage extends AttackComp {
    public override apply(context: AttackContext): void {
        if (this.args.scope === "attacker" || this.args.scope === "both") {
            this.addBenchDamage(context, context.attacker.owner);
        }
        if (this.args.scope === "defender" || this.args.scope === "both") {
            this.addBenchDamage(context, context.defender.owner);
        }
    }

    private addBenchDamage(context: AttackContext, player: Player) {
        if (this.args.target === "all") {
            for (const card of player.bench.cards) {
                context.addEffect(DefDatabase.get<EffectDef>("BenchDamage"), { target: card.id, amount: this.args.amount });
            }
        }
    }

    public override applyAverage(context: AttackContext): void {
        this.apply(context);
    }
};
