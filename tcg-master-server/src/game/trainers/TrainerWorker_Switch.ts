import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/interrupts/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptType } from "../state/interrupts/InterruptType.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Switch extends TrainerWorker {
    public override validate(context: TrainerContext): AcceptanceReport {
        if (!context.player.bench.count) {
            return AcceptanceReport.Rejected("There are no Pokémon on your bench to switch with.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        const target = context.nextTarget();
        if (!target) {
            return this.generateInterrupt(context)
                .withPrompt("Switch", context.player.activePokemon, "with which benched Pokémon?")
                .withChoices(context.player.bench.cards.map(c => new Choice(c)))
                .ofType(InterruptType.Switch);
        }

        return null;
    }

    public override execute(context: TrainerContext) {
        const target = context.nextTargetCard() as PokemonCard;
        context.engine.send(context.player, "switched", context.player.activePokemon, "with", target, ".");
        context.player.bench.add(context.player.activePokemon!);
        context.player.active.add(target);
    }
};
