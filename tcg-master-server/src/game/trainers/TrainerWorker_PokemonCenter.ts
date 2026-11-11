import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_PokemonCenter extends TrainerWorker {
    public override execute(context: TrainerContext): void {
        for (const pokemon of context.player.pokemonInPlay.filter(p => p.damage)) {
            while (pokemon.energy.length) {
                pokemon.energy[0].discard();
            }
            pokemon.heal(pokemon.damage);
        }
    }
};
