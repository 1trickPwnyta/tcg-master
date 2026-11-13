import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { Location } from "../state/Location.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Pokedex extends TrainerWorker {
    protected override getTargetLocation(context: TrainerContext): Location {
        return context.player.deck;
    }

    public override validate(context: TrainerContext): boolean {
        if (context.player.deck.count === 0) {
            context.engine.sendError(context.player, "Your deck is empty.");
            return false;
        }

        return true;
    }

    public override acquireTargets(context: TrainerContext, ...targets: number[]): Interrupt | null {
        if (context.player.limbo.count - 1 < 5) {
            context.forceInterrupt = true;
            return this.generateInterrupt(context,
                targets.length ? `Which card will go in position ${targets.length + 1}?` : "Which card will go in position 1 (the top)?",
                context.player.deck.cards.slice(-(5 - (context.player.limbo.count - 1))).map(c => new Choice(c))
            );
        }

        return null;
    }

    public override execute(context: TrainerContext, ...targets: number[]) {
        while (targets.length) {
            const target = targets.pop()!;
            const card = context.engine.search.getCard(target)!;
            context.player.deck.add(card);
        }
    }
};
