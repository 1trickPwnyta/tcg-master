import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptType } from "../state/interrupts/InterruptType.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Switch extends TrainerWorker {
    public override validate(context: TrainerContext): boolean {
        if (!context.player.bench.count) {
            context.engine.sendError(context.player, "There are no Pokémon on your bench to switch with.");
            return false;
        }

        return true;
    }

    public override acquireTargets(context: TrainerContext, target: number): Interrupt | null {
        if (!target) {
            context.interruptType = InterruptType.Switch;
            return this.generateInterrupt(context,
                `Switch ${context.player.activePokemon!.name} with which benched Pokémon?`,
                context.player.bench.cards.map(c => new Choice(c))
            );
        }

        return null;
    }

    public override execute(context: TrainerContext, target: number) {
        const card = context.engine.search.getCard(target)!;
        context.engine.send(context.player, "switched", context.player.activePokemon, "with", context.engine.search.getCard(context.args.switchTarget), ".");
        context.player.bench.add(context.player.activePokemon!);
        context.player.active.add(card);
    }
};
