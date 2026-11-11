import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_PokemonFlute extends TrainerWorker {
    public override validateTargets(context: TrainerContext, target: number): Interrupt | "fail" | null {
        if (context.player.opponent.bench.full) {
            context.engine.sendError(context.player, "Your opponent's bench is full.");
            return "fail";
        } else if (!context.player.opponent.discard.cards.some(c => c instanceof PokemonCard && c.def.stage === "basic")) {
            context.engine.sendError(context.player, "Your opponent has no basic Pokémon cards in their discard pile.");
            return "fail";
        } else if (!target) {
            return {
                player: context.player.id,
                prompt: "Which Pokémon will be sent to your opponent's bench?",
                choices: context.player.opponent.discard.cards.filter(c => c instanceof PokemonCard && c.def.stage === "basic").map(c => new Choice(c)),
                resolution: InterruptResolution.TrainerTargets,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id ]
            };
        }

        return null;
    }

    public override execute(context: TrainerContext, target: number) {
        const card = context.engine.search.getCard(target, context.player.opponent.discard) as PokemonCard;
        context.player.opponent.bench.add(card);
        context.engine.send(...card.fullTokens, "was brought back!");
    }
};
