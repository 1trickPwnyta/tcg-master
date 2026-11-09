import { PokemonCardDef } from "../../defs/PokemonCardDef.js";
import { Card } from "./Card.js";
import { Location } from "./Location.js";
import { Serializable } from "./serializer.js";

@Serializable()
export class Hand extends Location {
    public get basicPokemon(): Card[] {
        return this.cards.filter(c => c.def instanceof PokemonCardDef && c.def.stage === "basic");
    }

    public shuffleIntoDeck() {
        while (this.count) {
            this.owner.deck.add(this.cards.pop()!);
        }
        this.owner.deck.shuffle();
    }
};
