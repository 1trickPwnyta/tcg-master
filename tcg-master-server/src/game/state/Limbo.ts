import { Card } from "./Card.js";
import { Location } from "./Location.js";
import { Serializable, Serialize } from "./serializer.js";

@Serializable()
export class Limbo extends Location {
    @Serialize()
    private readonly homes: { card: number, location?: number }[] = [];

    public override add(card: Card) {
        if (card.location && card.location != this) {
            this.homes.push({ card: card.id, location: card.location.id });
        }
        super.add(card);
    }

    public override notify_removed(card: Card): void {
        const home = this.homes.find(h => h.card === card.id);
        if (home) {
            this.homes.splice(this.homes.indexOf(home), 1);
        }
    }

    public sendAllBack() {
        while (this.count) {
            const card = this.cards[0];
            const home = this.homes.find(h => h.card === card.id)!;
            const location = home.location ? this.engine.search.getLocation(home.location)! : this.owner.hand;
            location.add(card);
        }
    }
};
