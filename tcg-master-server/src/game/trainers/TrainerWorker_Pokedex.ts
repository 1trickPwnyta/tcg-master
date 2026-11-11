import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Pokedex extends TrainerWorker {
    public override validateTargets(context: TrainerContext, ...targets: number[]): Interrupt | "fail" | null {
        context.targetsLocation = context.player.deck;
        this.storeInLimbo(context, ...targets);

        if (context.player.deck.count === 0) {
            context.engine.sendError(context.player, "Your deck is empty.");
            return "fail";
        } else if (context.player.limbo.count - 1 < 5) {
            return {
                player: context.player.id,
                prompt: targets.length ? `Which card will go in position ${targets.length + 1}?` : "Which card will go in position 1 (the top)?",
                choices: context.player.deck.cards.slice(-(5 - (context.player.limbo.count - 1))).map(c => new Choice(c)),
                resolution: InterruptResolution.TrainerTargets,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id, ...targets ],
                force: true
            };
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
