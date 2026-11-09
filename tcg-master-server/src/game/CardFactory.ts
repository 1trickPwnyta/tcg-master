import { CardDef } from "../defs/CardDef.js";
import { EnergyCardDef } from "../defs/EnergyCardDef.js";
import { PokemonCardDef } from "../defs/PokemonCardDef.js";
import { TrainerCardDef } from "../defs/TrainerCardDef.js";
import { GameEngine } from "./engine/GameEngine.js";
import { Card } from "./state/Card.js";
import { EnergyCard } from "./state/EnergyCard.js";
import { Player } from "./state/Player.js";
import { PokemonCard } from "./state/PokemonCard.js";
import { TrainerCard } from "./state/TrainerCard.js";

export class CardFactory {
    private static next_id: number = 100;
    
    public static make(engine: GameEngine, def: CardDef, owner: Player): Card {
        switch (def.kind) {
            case "pokemon": return new PokemonCard(CardFactory.next_id++, engine, def as PokemonCardDef, owner);
            case "trainer": return new TrainerCard(CardFactory.next_id++, engine, def as TrainerCardDef, owner);
            case "energy": return new EnergyCard(CardFactory.next_id++, engine, def as EnergyCardDef, owner);
            default: throw new Error(`Can't make a card of kind ${def.kind}.`);
        }
    }
};
