import { PokemonCardDef } from "../../defs/PokemonCardDef.js";
import { TrainerCardDef } from "../../defs/TrainerCardDef.js";
import { Card } from "./Card.js";
import { Location } from "./Location.js";
import { Serializable } from "./serializer.js";
import { TrainerCard } from "./TrainerCard.js";

@Serializable()
export class Hand extends Location {
    public get basicPokemon(): Card[] {
        return this.cards.filter(c => (c.def instanceof PokemonCardDef && c.def.stage === "basic") || (c.def instanceof TrainerCardDef && c.def.wrapper));
    }

    public shuffleIntoDeck() {
        while (this.count) {
            this.owner.deck.add(this.cards.pop()!);
        }
        this.owner.deck.shuffle();
    }

    public reveal() {
        this.engine.sendTo(this.owner.opponent, this.owner, "revealed", this.owner.pronouns.possessive, "hand:", ...this.cards);
    }
};
