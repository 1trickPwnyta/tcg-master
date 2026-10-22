import { EnergyType } from "../EnergyType.js";
import { Prompt_SelectCard } from "../interaction/prompts/Prompt_SelectCard.js";
import { Card } from "./Card.js";
import { Card_Pokemon } from "./Card_Pokemon.js";

export abstract class Card_Energy extends Card {
    public abstract readonly basic: boolean;
    public abstract readonly type: EnergyType;
    public readonly amount: number = 1;

    public get tokenType(): string {
        return "energy";
    }

    public override get unplayableReason(): string | null {
        if (this.game.energyPlayed) {
            return "You already played an energy card this turn.";
        }

        return null;
    }

    public override play() {
        this.owner.setPrompt(new Prompt_SelectCard<Card_Pokemon>(
            `Attach ${this} to which Pokémon?`,
            [ this.owner.active.single!, ...this.owner.bench.cards ],
            (card: Card_Pokemon) => {
                this.game.send(this.owner, "attached", this, "to", card, ".");
                card.energy.add(this.take() as Card_Energy);
                this.game.energyPlayed = true;
                return true;
            },
            {
                cancelAction: () => false
            }
        ));
    }

    public override getDetails(): any[] {
        return [ this ];
    }

    public toString(): string {
        return this.basic ? `${this.type.symbol} Energy` : super.toString();
    }
};
