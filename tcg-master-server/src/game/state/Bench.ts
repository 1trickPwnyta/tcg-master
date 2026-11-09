import { Location } from "./Location.js";
import { PokemonCard } from "./PokemonCard.js";
import { Serializable, Serialize } from "./serializer.js";

@Serializable()
export class Bench extends Location {
    @Serialize()
    public override readonly inPlay: boolean = true;

    @Serialize()
    public override readonly cards: PokemonCard[] = [];

    public get full(): boolean {
        return this.count >= 5;
    }
};
