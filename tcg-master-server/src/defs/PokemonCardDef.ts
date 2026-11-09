import { ICardDefData_Pokemon, IDefData } from "./IDefData.js";
import { CardDef } from "./CardDef.js";
import { Attack } from "./Attack.js";
import { DefDatabase } from "./DefDatabase.js";
import { EnergyTypeDef } from "./EnergyTypeDef.js";
import { EnergyTypeDefOf } from "./defof/EnergyTypeDefOf.js";
import { EvolutionDef } from "./EvolutionDef.js";

export class PokemonCardDef extends CardDef {
    public override readonly kind = "pokemon";
    public readonly type: EnergyTypeDef;
    public readonly stage: "basic" | "stage1" | "stage2";
    public readonly hp: number;
    public readonly weakness: EnergyTypeDef | undefined;
    public readonly resistance: EnergyTypeDef | undefined;
    public readonly retreat: number;
    public readonly attacks: Attack[];

    private readonly cardData: IDefData & ICardDefData_Pokemon;

    public get evolution(): EvolutionDef {
        return DefDatabase.get<EvolutionDef>(this.label);
    }

    public constructor(data: IDefData) {
        super(data);
        this.cardData = data as IDefData & ICardDefData_Pokemon;
        this.type = DefDatabase.get<EnergyTypeDef>(this.cardData.type);
        this.stage = this.cardData.stage;
        this.hp = this.cardData.hp;
        this.weakness = this.cardData.weakness ? DefDatabase.get<EnergyTypeDef>(this.cardData.weakness) : undefined;
        this.resistance = this.cardData.resistance ? DefDatabase.get<EnergyTypeDef>(this.cardData.resistance) : undefined;
        this.retreat = this.cardData.retreat;
        this.attacks = [];
    }

    public override async init() {
        for (const attackData of this.cardData.attacks) {
            const attack = new Attack(attackData);
            await attack.init();
            this.attacks.push(attack);
        }
    }

    public override getDetails(): any[] {
        return [
            this.label,
            `(${this.stage})`,
            this.type.symbol,
            "<br />",
            ...this.attacks.flatMap(a => [ ...a.getDetails(), ...(this.attacks.indexOf(a) !== this.attacks.length - 1 ? [ "<br />" ] : []) ]),
            "<br />",
            "Weakness:",
            this.weakness?.symbol,
            "Resistance:",
            this.resistance ? `${this.resistance}-30` : "",
            "Retreat:",
            ...Array.from({ length: this.retreat }, () => EnergyTypeDefOf.Colorless.symbol)
        ];
    }
};
