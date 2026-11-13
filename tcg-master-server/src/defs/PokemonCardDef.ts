import { ICardDefData_Pokemon, IDefData } from "./IDefData.js";
import { CardDef } from "./CardDef.js";
import { Attack } from "../game/attacks/Attack.js";
import { DefDatabase } from "./DefDatabase.js";
import { EnergyTypeDef } from "./EnergyTypeDef.js";
import { EnergyTypeDefOf } from "./defof/EnergyTypeDefOf.js";
import { EvolutionDef } from "./EvolutionDef.js";
import { PokemonPower } from "../game/powers/PokemonPower.js";

export class PokemonCardDef extends CardDef {
    public override readonly kind = "pokemon";
    public readonly type: EnergyTypeDef;
    public readonly stage: "basic" | "stage1" | "stage2";
    public readonly hp: number;
    public readonly weakness: EnergyTypeDef | undefined;
    public readonly resistance: EnergyTypeDef | undefined;
    public readonly retreat: number;
    public power?: PokemonPower;
    public readonly attacks: Attack[];

    private readonly pokemonData: IDefData & ICardDefData_Pokemon;

    public get evolution(): EvolutionDef {
        return DefDatabase.get<EvolutionDef>(this.label);
    }

    public constructor(defClass: string, data: IDefData) {
        super(defClass, data);
        this.pokemonData = data as IDefData & ICardDefData_Pokemon;
        this.type = DefDatabase.get<EnergyTypeDef>(this.pokemonData.type);
        this.stage = this.pokemonData.stage;
        this.hp = this.pokemonData.hp;
        this.weakness = this.pokemonData.weakness ? DefDatabase.get<EnergyTypeDef>(this.pokemonData.weakness) : undefined;
        this.resistance = this.pokemonData.resistance ? DefDatabase.get<EnergyTypeDef>(this.pokemonData.resistance) : undefined;
        this.retreat = this.pokemonData.retreat;
        this.attacks = [];
    }

    public override async init() {
        await super.init();
        if (this.pokemonData.power) {
            this.power = new PokemonPower(this.pokemonData.power);
            await this.power.init();
        }
        for (const attackData of this.pokemonData.attacks) {
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
