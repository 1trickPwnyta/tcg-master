import { ICardDefData_Energy, IDefData } from "./IDefData.js";
import { CardDef } from "./CardDef.js";
import { IToken } from "../IToken.js";
import { EnergyTypeDef } from "./EnergyTypeDef.js";
import { DefDatabase } from "./DefDatabase.js";

export class EnergyCardDef extends CardDef {
    public override readonly kind = "energy";
    public readonly basic: boolean;
    public readonly type: EnergyTypeDef;
    public readonly amount: number;
    public readonly text?: string;

    private readonly energyData: IDefData & ICardDefData_Energy;

    public override get token(): IToken {
        let symbol = "";
        for (let i = 0; i < this.amount; i++) {
            symbol += this.type.symbol;
        }
        return { name: `${symbol}${this.basic ? "Energy" : this.label}`, type: "energy" };
    }

    public constructor(defClass: string, data: IDefData) {
        super(defClass, data);
        this.energyData = data as IDefData & ICardDefData_Energy;
        this.basic = this.energyData.basic;
        this.type = DefDatabase.get<EnergyTypeDef>(this.energyData.type);
        this.amount = this.energyData.amount;
        this.text = this.energyData.text;
    }

    public override async init() { }

    public override getDetails(): any[] {
        return [
            this.name,
            ...(this.basic ? [ "(basic)" ] : []),
            "Provides",
            Array.from({ length: this.amount }, () => this.type.symbol),
            ...(this.text ? [ "<br />", this.text ] : [])
        ];
    }
};
