import { IDefData, IDefData_Evolution } from "./IDefData.js";
import { Def } from "./Def.js";
import { DefDatabase } from "./DefDatabase.js";

export class EvolutionDef extends Def {
    public readonly next: string[];

    private readonly cardData: IDefData & IDefData_Evolution;

    public constructor(defClass: string, data: IDefData) {
        super(defClass, data);
        this.cardData = data as IDefData & IDefData_Evolution;
        this.next = this.cardData.next;
    }

    public override async init() { }

    public evolvesDirect(next: string): boolean {
        return this.next.includes(next);
    }

    public evolvesEver(next: string): boolean {
        if (this.evolvesDirect(next)) {
            return true;
        }

        for (const evolution of this.next) {
            if (DefDatabase.get<EvolutionDef>(evolution)?.evolvesEver(next)) {
                return true;
            }
        }

        return false;
    }

    public eveolvesFromDirect(previous: string): boolean {
        const prevolution = DefDatabase.get<EvolutionDef>(previous);
        return prevolution.evolvesDirect(this.name);
    }

    public evolvesFromEver(previous: string): boolean {
        if (this.eveolvesFromDirect(previous)) {
            return true;
        }

        for (const evolution of DefDatabase.getAll<EvolutionDef>("EvolutionDef").filter(e => e.evolvesDirect(this.name))) {
            if (evolution.evolvesFromEver(previous)) {
                return true;
            }
        }

        return false;
    }
};
