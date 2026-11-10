import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { InterruptType } from "../state/interrupts/InterruptType.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Switch extends TrainerWorker {
    public override validateTargets(context: TrainerContext, target: number): Interrupt | "fail" | null {
        if (!context.player.bench.count) {
            context.engine.sendError(context.player, "There are no Pokémon on your bench to switch with.");
            return "fail";
        } else if (!target) {
            return {
                type: InterruptType.Switch,
                player: context.player.id,
                prompt: `Switch ${context.player.activePokemon!.name} with which benched Pokémon?`,
                choices: context.player.bench.cards.map(c => new Choice(c)),
                resolution: InterruptResolution.TrainerTargets,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id ]
            };
        }

        return null;
    }

    public override execute(context: TrainerContext, target: number): void {
        const card = context.engine.search.getCard(target)!;
        context.engine.send(context.player, "switched", context.player.activePokemon, "with", context.engine.search.getCard(target), ".");
        context.player.bench.add(context.player.activePokemon!);
        context.player.active.add(card);
    }
};
