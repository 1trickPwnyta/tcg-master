import { ICardDefData_Pokemon, IDefData } from "./IDefData.js";
import { CardDef } from "./CardDef.js";
import { DefDatabase } from "./DefDatabase.js";
import { EnergyTypeDef } from "./EnergyTypeDef.js";
import { EnergyTypeDefOf } from "./defof/EnergyTypeDefOf.js";
import { EvolutionDef } from "./EvolutionDef.js";
import { PokemonPower } from "../game/powers/PokemonPower.js";
import { Attack } from "../game/attacks/Attack.js";
import { IToken } from "../IToken.js";

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
    public readonly prizes: number;

    private readonly pokemonData: ICardDefData_Pokemon;

    public get evolution(): EvolutionDef {
        return DefDatabase.get<EvolutionDef>(this.label);
    }

    protected override get typeAffinity(): EnergyTypeDef | null {
        return this.type;
    }

    public constructor(defClass: string, data: ICardDefData_Pokemon) {
        super(defClass, data);
        this.pokemonData = data;
        this.type = DefDatabase.get<EnergyTypeDef>(this.pokemonData.type);
        this.stage = this.pokemonData.stage;
        this.hp = this.pokemonData.hp;
        this.weakness = this.pokemonData.weakness ? DefDatabase.get<EnergyTypeDef>(this.pokemonData.weakness) : undefined;
        this.resistance = this.pokemonData.resistance ? DefDatabase.get<EnergyTypeDef>(this.pokemonData.resistance) : undefined;
        this.retreat = this.pokemonData.retreat;
        this.attacks = [];
        this.prizes = this.pokemonData.prizes ?? 1;
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
            this.token,
            `(${this.stage})`,
            "<br />",
            ...(this.power?.getDetails() ?? []),
            this.power ? "<br />" : null,
            ...this.attacks.flatMap(a => [ ...a.getDetails(), ...(this.attacks.indexOf(a) !== this.attacks.length - 1 ? [ "<br />" ] : []) ]),
            "<br />",
            "Weakness:",
            this.weakness?.symbol ?? "_",
            "Resistance:",
            this.resistance ? `${this.resistance}-30` : "_",
            "Retreat:",
            Array.from({ length: this.retreat }, () => EnergyTypeDefOf.Colorless.symbol).join("") || "_"
        ];
    }
};
