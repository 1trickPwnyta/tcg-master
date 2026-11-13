import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Revive extends TrainerWorker {
    public override validate(context: TrainerContext): boolean {
        if (!context.player.discard.cards.some(c => c instanceof PokemonCard && c.def.stage === "basic")) {
            context.engine.sendError(context.player, "There are no basic Pokémon cards in your discard pile.");
            return false;
        } else if (context.player.bench.full) {
            context.engine.sendError(context.player, "Your bench is full.");
            return false;
        }

        return true;
    }

    public override acquireTargets(context: TrainerContext, target: number): Interrupt | null {
        if (!target) {
            return this.generateInterrupt(context,
                "Select a basic Pokémon card from your discard pile.",
                context.player.discard.cards.filter(c => c instanceof PokemonCard && c.def.stage === "basic").map(c => new Choice(c))
            );
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
