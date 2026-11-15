import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";

export class EnergyCost {
    private static analyzeCost(required: EnergyTypeDef[], provided: EnergyTypeDef[]): { unsatisfied: EnergyTypeDef[], oversatisfied: EnergyTypeDef[] } {
        const reqs = [ ...required ].sort((a, b) => b.resolutionPriority - a.resolutionPriority);
        const pool = [ ...provided ].sort((a, b) => a.resolutionPriority - b.resolutionPriority);
        const unsatisfied = [];
        for (let i = 0; i < reqs.length; i++) {
            let satisfied = false;
            for (let j = 0; j < pool.length; j++) {
                if (pool[j].satisfies(reqs[i])) {
                    pool.splice(j, 1);
                    satisfied = true;
                    break;
                }
            }
            if (!satisfied) {
                unsatisfied.push(reqs[i]);
            }
        }
        
        return { unsatisfied: unsatisfied, oversatisfied: pool };
    }

    public static costUnsatisfied(required: EnergyTypeDef[], provided: EnergyTypeDef[]): EnergyTypeDef[] {
        return EnergyCost.analyzeCost(required, provided).unsatisfied;
    }

    public static costSatisfied(required: EnergyTypeDef[], provided: EnergyTypeDef[]): boolean {
        return EnergyCost.analyzeCost(required, provided).unsatisfied.length === 0;
    }

    public static costOversatisfied(required: EnergyTypeDef[], provided: EnergyTypeDef[]): EnergyTypeDef[] {
        return EnergyCost.analyzeCost(required, provided).oversatisfied;
    }
};
