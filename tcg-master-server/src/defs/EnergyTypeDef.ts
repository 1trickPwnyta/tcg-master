import { IDefData, IDefData_EnergyType } from "./IDefData.js";
import { IToken } from "../IToken.js";
import { Def } from "./Def.js";
import { EnergyTypeDefOf } from "./defof/EnergyTypeDefOf.js";

export class EnergyTypeDef extends Def {
    public readonly symbol: string;
    public readonly resolutionPriority: number;

    private readonly cardData: IDefData & IDefData_EnergyType;

    public override get token(): IToken {
        return { name: this.symbol };
    }

    public constructor(data: IDefData) {
        super(data);
        this.cardData = data as IDefData & IDefData_EnergyType;
        this.symbol = this.cardData.symbol;
        this.resolutionPriority = this.cardData.resolutionPriority ?? 0;
    }

    public override async init() { }

    public satisfies(def: EnergyTypeDef): boolean {
        return this == def || def == EnergyTypeDefOf.Colorless;
    }

    public toString(): string {
        return this.symbol;
    }
};
