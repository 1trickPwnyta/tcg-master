import { ICardDefData, ICardDefData_Energy, IDefData } from "./IDefData.js";
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

    private readonly energyData: ICardDefData_Energy;

    public override get token(): IToken {
        let symbol = "";
        for (let i = 0; i < this.amount; i++) {
            symbol += this.type.symbol;
        }
        return { name: `${symbol}${this.basic ? "Energy" : super.token.name}`, type: super.token.type };
    }

    protected override get typeAffinity(): EnergyTypeDef | null {
        return this.type;
    }

    public constructor(defClass: string, data: ICardDefData_Energy) {
        super(defClass, data);
        this.energyData = data;
        this.basic = this.energyData.basic;
        this.type = DefDatabase.get<EnergyTypeDef>(this.energyData.type);
        this.amount = this.energyData.amount;
        this.text = this.energyData.text;
    }

    public override async init() { }

    public override getDetails(): any[] {
        return [
            this.token,
            ...(this.basic ? [ "(basic)" ] : []),
            "Provides",
            Array.from({ length: this.amount }, () => this.type.symbol).join(""),
            ...(this.text ? [ "<br />", this.text ] : [])
        ];
    }
};
