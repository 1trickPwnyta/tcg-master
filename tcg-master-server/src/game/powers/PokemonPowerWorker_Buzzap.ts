import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDefOf } from "../../defs/defof/StatusDefOf.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { Modifier_Energy } from "../modifiers/Modifier_Energy.js";
import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { PokemonPowerContext, PokemonPowerWorker } from "./PokemonPowerWorker.js";

export class PokemonPowerWorker_Buzzap extends PokemonPowerWorker {
    public override cantUseReason(context: PokemonPowerContext): string | null {
        if (context.card.hasStatus(StatusDefOf.Sleep) || context.card.hasStatus(StatusDefOf.Paralysis) || context.card.hasStatus(StatusDefOf.Confusion)) {
            return "a status condition";
        } else if (context.owner.pokemonInPlay.length === 1) {
            return "no other Pokémon in play";
        }

        return null;
    }

    public override acquireTargets(context: PokemonPowerContext, pokemon: number, type: string): Interrupt | null {
        if (!pokemon) {
            return this.generateInterrupt(context,
                `Which Pokémon will ${context.card.name} attach to?`,
                context.owner.pokemonInPlay.filter(p => p != context.card).map(p => new Choice(p))
            );
        } else if (!type) {
            return this.generateInterrupt(context,
                `Which type of energy will ${context.card.name} provide?`,
                DefDatabase.getAll<EnergyTypeDef>("EnergyTypeDef").map(e => new Choice(e))
            );
        }

        return null;
    }

    public override execute(context: PokemonPowerContext, pokemon: number, type: string) {
        const pokemonCard = context.engine.search.getCard(pokemon) as PokemonCard;
        pokemonCard.attachments.add(context.card, [ { modifier: Modifier_Energy.name, args: { amount: 2, type: type } } ]);
        context.card.knockOut(undefined, false);
    }
};
