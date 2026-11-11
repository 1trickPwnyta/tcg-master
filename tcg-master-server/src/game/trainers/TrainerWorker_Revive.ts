import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Revive extends TrainerWorker {
    public override validateTargets(context: TrainerContext, target: number): Interrupt | "fail" | null {
        if (!context.player.discard.cards.some(c => c instanceof PokemonCard && c.def.stage === "basic")) {
            context.engine.sendError(context.player, "There are no basic Pokémon cards in your discard pile.");
            return "fail";
        } else if (context.player.bench.full) {
            context.engine.sendError(context.player, "Your bench is full.");
            return "fail";
        } else if (!target) {
            return {
                player: context.player.id,
                prompt: "Select a basic Pokémon card from your discard pile.",
                choices: context.player.discard.cards.filter(c => c instanceof PokemonCard && c.def.stage === "basic").map(c => new Choice(c)),
                resolution: InterruptResolution.TrainerTargets,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id ]
            };
        }

        return null;
    }

    public override execute(context: TrainerContext, target: number) {
        const card = context.engine.search.getCard(target, context.player.discard) as PokemonCard;
        context.player.bench.add(card);
        card.damage = Math.floor(card.def.hp / 20) * 10;
        context.engine.send(card, "was revived!");
    }
};
