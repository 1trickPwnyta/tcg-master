import { AttackContext } from "../attacks/AttackContext.js";
import { Choice } from "../state/interrupts/Choice.js";
import { InterruptSync } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { EffectWorker } from "./EffectWorker.js";

export class EffectWorker_Bounce extends EffectWorker {
    public override getTarget(context: AttackContext, args?: any): PokemonCard | null {
        return args.target ?? context.defender;
    }

    public override apply(context: AttackContext, args?: any) {
        if (args?.target) {
            const target = context.engine.search.getCard(args.target) as PokemonCard;
            context.defender.owner.bench.add(context.defender);
            context.defender.owner.active.add(target);
            context.engine.send(...target.fullTokens, "was forced out!");
        } else {
            context.engine.interrupts.interrupt(new InterruptSync(context.defender.owner)
                .withPrompt("Choose one of your benched Pokémon to switch with your active Pokémon.")
                .withChoices(context.defender.owner.bench.cards.map(c => new Choice(c)))
                .withResolution(InterruptResolution.Promote)
                .withArgs(context.defender.owner.id)
                .forced());
        }
    }
};
