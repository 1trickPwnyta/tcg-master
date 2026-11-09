import { DefDatabase } from "../../defs/DefDatabase.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_WaterGun extends AttackWorker {
    private readonly cost: EnergyTypeDef;
    private readonly amount: number;
    private readonly limit: number;

    public constructor(args: any) {
        super();
        this.cost = DefDatabase.get<EnergyTypeDef>(args.cost);
        this.amount = args.amount;
        this.limit = args.limit;
    }

    public override preEffect(context: AttackContext, damage: number): number {
        const extraEnergy = context.attack.costOversatisfied(context.attacker.energy).filter(e => e == this.cost);
        return damage + this.amount * Math.min(this.limit, extraEnergy.length);
    }
};
