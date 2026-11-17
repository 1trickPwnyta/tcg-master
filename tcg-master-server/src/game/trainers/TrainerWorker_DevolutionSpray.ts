import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_DevolutionSpray extends TrainerWorker {
    private getTargetChoices(context: TrainerContext): Choice[] {
        return this.getValidChoices(context, context.player.pokemonInPlay.filter(p => p.def.stage !== "basic").map(p => new Choice(p)));
    }

    private getDevolutionChoices(context: TrainerContext, target: PokemonCard): Choice[] {
        return this.getValidChoices(context, target.attachments.cards.filter(c => c instanceof PokemonCard && target.def.evolution.evolvesFromEver(c.name)).map(p => new Choice(p)));
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (!this.getTargetChoices(context).length) {
            return AcceptanceReport.Rejected("None of your Pokémon can devolve.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        const target = context.nextTargetCard() as PokemonCard | null;
        if (!target) {
            return this.generateInterrupt(context,
                "Select a Pokémon to devolve.",
                this.getTargetChoices(context)
            );
        }

        const devolution = context.nextTarget();
        if (!devolution) {
            return this.generateInterrupt(context,
                "Select a previous stage to devolve to.",
                this.getDevolutionChoices(context, target)
            );
        }

        return null;
    }

    public override execute(context: TrainerContext): void {
        const target = context.nextTargetCard() as PokemonCard;
        const devolution = context.nextTargetCard() as PokemonCard;
        target.devolve(devolution);
    }
};
