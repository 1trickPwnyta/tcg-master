import { IDefData, IDefData_Evolution } from "./IDefData.js";
import { Def } from "./Def.js";

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
};
