import { EnergyTypeDefOf } from "../../defs/defof/EnergyTypeDefOf.js";
import { Choice } from "../state/interrupts/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { PokemonPowerContext, PokemonPowerWorker } from "./PokemonPowerWorker.js";

export class PokemonPower_EnergyTrans extends PokemonPowerWorker {
    public override cantUseReason(context: PokemonPowerContext): string | null {
        if (this.hasDisqualifyingStatus(context.card)) {
            return "a status condition";
        } else if (!context.owner.pokemonInPlay.some(p => p.energy.includes(EnergyTypeDefOf.Grass))) {
            return `no ${EnergyTypeDefOf.Grass} energy attached to any of your Pokémon`;
        }

        return null;
    }

    public override acquireTargets(context: PokemonPowerContext, source: number, energy: number | "all", target: number): Interrupt | null {
        if (!source) {
            return this.generateInterrupt(context)
                .withPrompt("Move", EnergyTypeDefOf.Grass, "energy from which Pokémon?")
                .withChoices(context.owner.pokemonInPlay.filter(p => p.energy.includes(EnergyTypeDefOf.Grass)).map(p => new Choice(p)));
        } else if (!energy) {
            const card = context.engine.search.getCard(source) as PokemonCard;
            return this.generateInterrupt(context)
                .withPrompt("Move which", EnergyTypeDefOf.Grass, "energy from", card, "?")
                .withChoices([ Choice.fromText("(all)", "all"), ...card.attachments.energyCards.map(c => new Choice(c.card)) ]);
        } else if (!target) {
            return this.generateInterrupt(context)
                .withPrompt("Move", EnergyTypeDefOf.Grass, "energy to which Pokémon?")
                .withChoices(context.owner.pokemonInPlay.filter(p => p.id !== source).map(p => new Choice(p)));
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
