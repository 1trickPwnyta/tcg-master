import { Prompt_SelectCard } from "../interaction/prompts/Prompt_SelectCard.js";
import { Card } from "./Card.js";
import { Card_Pokemon } from "./Card_Pokemon.js";

export abstract class Card_Energy extends Card {
    public get tokenType(): string {
        return "energy";
    }

    public override play() {
        if (!this.game.energyPlayed) {
            this.owner.setPrompt(new Prompt_SelectCard<Card_Pokemon>(
                `Attach ${this} to which Pokémon?`,
                [ this.owner.active.single!, ...this.owner.bench.cards ],
                (card: Card_Pokemon) => {
                    this.game.send(this.owner, "attached", this, "to", card, ".");
                    card.energy.add(this.take());
                    this.game.energyPlayed = true;
                    return true;
                },
                {
                    cancelAction: () => false
                }
            ));
        } else {
            this.owner.send("You already played an energy this turn.");
        }
    }

    public override getDetails(): string {
        return `${this.name}`;
    }
};
