import { Card } from "./cards/Card.js";
import { Card_Pokemon, EvolutionStage } from "./cards/Card_Pokemon.js";
import { Location } from "./Location.js";

export class Hand extends Location<Card> {
    public get basicPokemon(): Card_Pokemon[] {
        return this.cards.filter(c => c instanceof Card_Pokemon && c.stage == EvolutionStage.Basic) as Card_Pokemon[];
    }
}