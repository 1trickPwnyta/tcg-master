import { StatusDefOf } from "../../defs/defof/StatusDefOf.js";
import { PokemonPower } from "../powers/PokemonPower.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { Modifier, ModifierContext } from "./Modifier.js";

export abstract class PokemonPowerModifier extends Modifier {
    public readonly power: PokemonPower;
    
    public override get label(): string {
        return this.power.name;
    }

    public override get canAttack(): boolean {
        return true;
    }

    public override get canRetreat(): boolean {
        return true;
    }

    public constructor(power: PokemonPower) {
        super();
        this.power = power;
    }

    protected hasDisqualifyingStatus(user: PokemonCard): boolean {
        return user.hasStatus(StatusDefOf.Sleep) || user.hasStatus(StatusDefOf.Confusion) || user.hasStatus(StatusDefOf.Paralysis);
    }

    protected override remove(context: ModifierContext) {
        throw new Error("You can't remove a modifier from a Pokémon Power.");
    }
};
