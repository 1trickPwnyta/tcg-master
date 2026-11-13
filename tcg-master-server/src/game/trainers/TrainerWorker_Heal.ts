import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { Location } from "../state/Location.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Heal extends TrainerWorker {
    private readonly amount: number;
    private readonly discardEnergy: number;

    public override getTargetLocation(context: TrainerContext): Location {
        const targets = this.getTargets(context);
        if (targets.length) {
            const card = context.engine.search.getCard(targets[0] as number) as PokemonCard;
            return card.attachments;
        } else {
            return super.getTargetLocation(context);
        }
    }

    public constructor(args: any) {
        super();
        this.amount = args.amount;
        this.discardEnergy = args.discard_energy ?? 0;
    }

    public override validate(context: TrainerContext): boolean {
        if (!context.player.pokemonInPlay.some(c => c.damage && (c.energy.length >= this.discardEnergy))) {
            context.engine.sendError(context.player, "None of your Pokémon can be healed right now.");
            return false;
        }

        return true;
    }

    public override acquireTargets(context: TrainerContext, target: number, ...energy: number[]): Interrupt | null {
        if (!target) {
            return this.generateInterrupt(context,
                "Heal which Pokémon?",
                context.player.pokemonInPlay.filter(p => p.damage && (p.energy.length >= this.discardEnergy)).map(p => new Choice(p)),
            );
        } else if (energy.length < this.discardEnergy) {
            const card = context.engine.search.getCard(target) as PokemonCard;
            return this.generateInterrupt(context,
                `Discard which energy card from ${card.name}?`,
                card.energy.map(e => new Choice(e)),
            );
        }

        return null;
    }

    public override execute(context: TrainerContext, target: number, ...energy: number[]): void {
        const card = context.engine.search.getCard(target) as PokemonCard;
        for (const energy_id of energy) {
            const energyCard = context.engine.search.getCard(energy_id, card.attachments)!;
            energyCard.discard();
        }
        card.heal(this.amount);
    }
};
