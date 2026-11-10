import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_CoinDamage extends AttackWorker {
    private readonly amount: number;
    private readonly coins: number;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
        this.coins = args.coins;
    }

    public override preEffect(context: AttackContext, damage: number): number {
        for (let i = 0; i < this.coins; i++) {
            if (context.engine.game.flipCoin(context.attacker.owner)) {
                damage += this.amount;
            }
        }
        
        return damage;
    }
};
