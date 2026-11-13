import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_GustOfWind extends TrainerWorker {
    public override validate(context: TrainerContext): boolean {
        if (!context.player.opponent.bench.count) {
            context.engine.sendError(context.player, "Your opponent doesn't have any benched Pokémon.");
            return false;
        }

        return true;
    }

    public override acquireTargets(context: TrainerContext, target: number): Interrupt | null {
        if (!target) {
            return this.generateInterrupt(context,
                "Which of your opponent's Pokémon will switch in?",
                context.player.opponent.bench.cards.map(c => new Choice(c)),
            );
        }
        
        return null;
    }

    public execute(context: TrainerContext, target: number) {
        const card = context.engine.search.getCard(target) as PokemonCard;
        context.player.opponent.bench.add(context.player.opponent.activePokemon!);
        context.player.opponent.active.add(card);
        context.engine.send(...card.fullTokens, " was forced out!");
    }
};
