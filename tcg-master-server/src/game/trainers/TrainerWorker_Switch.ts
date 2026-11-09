import { PlayContext } from "../cards/workers/CardWorker.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { InterruptType } from "../state/interrupts/InterruptType.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Switch extends TrainerWorker {
    public override selectTargets(context: PlayContext): Interrupt | "fail" | null {
        if (!context.player.bench.count) {
            context.engine.sendError(context.player, "There are no Pokémon on your bench to switch with.");
            return "fail";
        }

        return {
            type: InterruptType.Switch,
            player: context.player.id,
            prompt: `Switch ${context.player.activePokemon!.name} with which benched Pokémon?`,
            choices: context.player.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
            resolution: InterruptResolution.UseTrainer,
            cancelResolution: InterruptResolution.CancelTrainer,
            args: [ context.card.id ]
        };
    }

    public override execute(context: PlayContext, target: number): void {
        const card = context.engine.search.getCard(target)!;
        context.engine.send(context.player, "switched", context.player.activePokemon, "with", context.engine.search.getCard(target), ".");
        context.player.bench.add(context.player.activePokemon!);
        context.player.active.add(card);
    }
};
