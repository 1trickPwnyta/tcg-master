import { PlayContext } from "../cards/workers/CardWorker.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { InterruptType } from "../state/interrupts/InterruptType.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Switch extends TrainerWorker {
    public override validateTargets(context: PlayContext, target: number): Interrupt | "fail" | null {
        if (!context.player.bench.cards.length) {
            context.game.sendError(context.player, "There are no Pokémon on your bench to switch with.");
            return "fail";
        }

        if (!target) {
            return {
                type: InterruptType.Switch,
                player: context.player.id,
                prompt: `Switch ${context.player.active.cards[0].name} with which benched Pokémon?`,
                choices: context.player.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
                resolution: InterruptResolution.UseTrainer,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id ]
            };
        }

        return null;
    }

    public override execute(context: PlayContext, target: number): void {
        context.game.send(context.player, "switched", context.player.active.cards[0], "with", context.game.search.getCard(target), ".");
        context.game.cards.move(context.player.active.cards[0].id, context.player.active.id, context.player.bench.id);
        context.game.cards.move(target, context.player.bench.id, context.player.active.id);
    }
};
