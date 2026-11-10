import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_GustOfWind extends TrainerWorker {
    public override validateTargets(context: TrainerContext, target: number): Interrupt | "fail" | null {
        if (!context.player.opponent.bench.count) {
            context.engine.sendError(context.player, "Your opponent doesn't have any benched Pokémon.");
            return "fail";
        } else if (!target) {
            return {
                player: context.player.id,
                prompt: "Which of your opponent's Pokémon will switch in?",
                choices: context.player.opponent.bench.cards.map(c => new Choice(c)),
                resolution: InterruptResolution.TrainerTargets,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id ]
            };
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
