import { StatusDefOf } from "../../defs/defof/StatusDefOf.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_FullHeal extends TrainerWorker {
    public override execute(context: TrainerContext): void {
        const pokemon = context.player.activePokemon!;
        pokemon.removeStatus(StatusDefOf.Sleep);
        pokemon.removeStatus(StatusDefOf.Confusion);
        pokemon.removeStatus(StatusDefOf.Paralysis);
        pokemon.removeStatus(StatusDefOf.Poison);
    }
};
