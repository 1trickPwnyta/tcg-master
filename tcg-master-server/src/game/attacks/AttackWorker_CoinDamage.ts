import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_CoinDamage extends AttackWorker {
    private readonly amount: number;
    private readonly coins: number;
    private readonly selfDamage: number;

    private actualSelfDamage: number = 0;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
        this.coins = args.coins;
        this.selfDamage = args.selfDamage ?? 0;
    }

    public override preEffect(context: AttackContext, damage: number): number {
        this.actualSelfDamage = 0;
        for (let i = 0; i < this.coins; i++) {
            if (context.engine.game.flipCoin(context.attacker.owner)) {
                damage += this.amount;
            } else if (this.selfDamage) {
                this.actualSelfDamage += this.selfDamage;
            }
        }
        
        return damage;
    }

    public override postEffect(context: AttackContext) {
        if (this.actualSelfDamage) {
            context.attacker.dealDamage({
                amount: this.actualSelfDamage,
                attacker: context.attacker,
                type: context.attacker.def.type
            });
            this.actualSelfDamage = 0;
        }
    }
};
