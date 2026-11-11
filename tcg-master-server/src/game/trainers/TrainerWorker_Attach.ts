import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Attach extends TrainerWorker {
    private readonly target: "active" | "any";

    public constructor(args: any) {
        super();
        this.target = args.target;
    }

    public override execute(context: TrainerContext, target: number): void {
        const card = this.target === "active" ? context.player.activePokemon! : context.engine.search.getCard(target) as PokemonCard;
        card.attachments.add(context.card);
        context.engine.send(context.player, "attached", context.card, "to", card, ".");
    }
};
