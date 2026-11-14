import { EnergyTypeDefOf } from "../../defs/defof/EnergyTypeDefOf.js";
import { StatusDefOf } from "../../defs/defof/StatusDefOf.js";
import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { PokemonPowerContext, PokemonPowerWorker } from "./PokemonPowerWorker.js";

export class PokemonPower_EnergyTrans extends PokemonPowerWorker {
    public override cantUseReason(context: PokemonPowerContext): string | null {
        if (context.card.hasStatus(StatusDefOf.Sleep) || context.card.hasStatus(StatusDefOf.Paralysis) || context.card.hasStatus(StatusDefOf.Confusion)) {
            return "a status condition";
        } else if (!context.owner.pokemonInPlay.some(p => p.energy.includes(EnergyTypeDefOf.Grass))) {
            return `no ${EnergyTypeDefOf.Grass} energy attached to any of your Pokémon`;
        }

        return null;
    }

    public override acquireTargets(context: PokemonPowerContext, source: number, energy: number | "all", target: number): Interrupt | null {
        if (!source) {
            return this.generateInterrupt(context,
                `Move ${EnergyTypeDefOf.Grass} energy from which Pokémon?`,
                context.owner.pokemonInPlay.filter(p => p.energy.includes(EnergyTypeDefOf.Grass)).map(p => new Choice(p))
            );
        } else if (!energy) {
            const card = context.engine.search.getCard(source) as PokemonCard;
            return this.generateInterrupt(context,
                `Move which ${EnergyTypeDefOf.Grass} energy from ${card.name}?`,
                [ new Choice({ text: "(all)", id: "all" }), ...card.attachments.energyCards.map(c => new Choice(c.card)) ]
            );
        } else if (!target) {
            return this.generateInterrupt(context,
                `Move ${EnergyTypeDefOf.Grass} energy to which Pokémon?`,
                context.owner.pokemonInPlay.filter(p => p.id !== source).map(p => new Choice(p))
            );
        }

        return null;
    }

    public override execute(context: PokemonPowerContext, source: number, energy: number | "all", target: number) {
        const sourceCard = context.engine.search.getCard(source) as PokemonCard;
        const targetCard = context.engine.search.getCard(target) as PokemonCard;
        if (energy === "all") {
            while (sourceCard.energy.includes(EnergyTypeDefOf.Grass)) {
                const card = sourceCard.attachments.energyCards.find(c => c.type == EnergyTypeDefOf.Grass)!;
                targetCard.attachments.add(card.card);
            }
            context.engine.send(context.owner, "moved all", EnergyTypeDefOf.Grass, "energy from", sourceCard, "to", targetCard, ".");
        } else {
            const card = context.engine.search.getCard(energy, sourceCard.attachments)!;
            targetCard.attachments.add(card);
            context.engine.send(context.owner, "moved", card, "from", sourceCard, "to", targetCard, ".");
        }
    }
};
