import { Card } from "../state/Card.js";
import { Location } from "../state/Location.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { SubEngine } from "./SubEngine.js";

export class SearchEngine extends SubEngine {
    private cards: Map<number, Card> = new Map<number, Card>();
    private locations: Map<number, Location> = new Map<number, Location>();

    public getCard(card_id: number, root?: Location): Card | null {
        if (!root) {
            if (this.cards.has(card_id)) {
                return this.cards.get(card_id)!;
            }
            for (const player of this.state.players) {
                for (const location of player.locations) {
                    const card = this.getCard(card_id, location);
                    if (card) {
                        return card;
                    }
                }
            }
        } else {
            for (const card of root.cards) {
                if (card.id === card_id) {
                    this.cards.set(card.id, card);
                    return card;
                } else if (card.def.kind == "pokemon") {
                    const sub = this.getCard(card_id, (card as PokemonCard).attachments);
                    if (sub) {
                        return sub;
                    }
                }
            }
        }

        return null;
    }

    public getLocation(location_id: number): Location | null {
        if (this.locations.has(location_id)) {
            return this.locations.get(location_id)!;
        }
        for (const player of this.state.players) {
            for (const location of player.locations) {
                if (location.id === location_id) {
                    this.locations.set(location.id, location);
                    return location;
                }
            }
            for (const card of player.pokemonInPlay) {
                if (card.attachments.id === location_id) {
                    this.locations.set(card.attachments.id, card.attachments);
                    return card.attachments;
                }
            }
        }
        return null;
    }
};
