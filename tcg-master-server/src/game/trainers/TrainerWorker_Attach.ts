import { Choice } from "../state/interrupts/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Attach extends TrainerWorker {
    private readonly target: "active" | "any";

    public constructor(args: any) {
        super();
        this.target = args.target;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        if (this.target === "any") {
            const target = context.nextTarget();
            if (!target) {
                return this.generateInterrupt(context)
                    .withPrompt("Attach", context.card, "to which Pokémon?")
                    .withChoices(context.player.pokemonInPlay.map(p => new Choice(p)));
            }
        }

        return null;
    }

    public override execute(context: TrainerContext) {
        const card = this.target === "active" ? context.player.activePokemon! : context.nextTargetCard() as PokemonCard;
        card.attachments.add(context.card);
        context.engine.send(context.player, "attached", context.card, "to", card, ".");
    }
};
