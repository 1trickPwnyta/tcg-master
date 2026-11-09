import { Location } from "./Location.js";
import { Serializable } from "./serializer.js";

@Serializable()
export class Deck extends Location {
    public shuffle() {
        for (let i = this.count - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
        this.engine.send(this.owner, "shuffled", this.owner.pronouns.possessive, "deck.");
    }
}