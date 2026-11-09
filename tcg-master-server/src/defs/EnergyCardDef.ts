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

    private readonly cardData: IDefData & ICardDefData_Energy;

    public override get token(): IToken {
        let symbol = "";
        for (let i = 0; i < this.amount; i++) {
            symbol += this.type.symbol;
        }
        return { name: `${symbol}${this.basic ? "Energy" : this.name}`, type: "energy" };
    }

    public constructor(data: IDefData) {
        super(data);
        this.cardData = data as IDefData & ICardDefData_Energy;
        this.basic = this.cardData.basic;
        this.type = DefDatabase.get<EnergyTypeDef>(this.cardData.type);
        this.amount = this.cardData.amount;
        this.text = this.cardData.text;
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
