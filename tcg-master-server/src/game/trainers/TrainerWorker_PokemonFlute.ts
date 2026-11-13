import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_PokemonFlute extends TrainerWorker {
    public override validate(context: TrainerContext): boolean {
        if (context.player.opponent.bench.full) {
            context.engine.sendError(context.player, "Your opponent's bench is full.");
            return false;
        } else if (!context.player.opponent.discard.cards.some(c => c instanceof PokemonCard && c.def.stage === "basic")) {
            context.engine.sendError(context.player, "Your opponent has no basic Pokémon cards in their discard pile.");
            return false;
        }

        return true;
    }

    public override acquireTargets(context: TrainerContext, target: number): Interrupt | null {
        if (!target) {
            return this.generateInterrupt(context,
                "Which Pokémon will be sent to your opponent's bench?",
                context.player.opponent.discard.cards.filter(c => c instanceof PokemonCard && c.def.stage === "basic").map(c => new Choice(c))
            );
        }

        return null;
    }

    public override execute(context: TrainerContext, target: number) {
        const card = context.engine.search.getCard(target, context.player.opponent.discard) as PokemonCard;
        context.player.opponent.bench.add(card);
        context.engine.send(...card.fullTokens, "was brought back!");
    }
};
