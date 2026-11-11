import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Heal extends TrainerWorker {
    private readonly amount: number;
    private readonly discardEnergy: number;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
        this.discardEnergy = args.discard_energy ?? 0;
    }

    public override validateTargets(context: TrainerContext, target: number, ...energy: number[]): Interrupt | "fail" | null {
        if (target) {
            const card = context.engine.search.getCard(target) as PokemonCard;
            context.targetsLocation = card.attachments;
            this.storeInLimbo(context, ...energy);
        }

        if (!context.player.pokemonInPlay.some(c => c.damage && (c.energy.length >= this.discardEnergy))) {
            context.engine.sendError(context.player, "None of your Pokémon can be healed right now.");
            return "fail";
        } else if (!target) {
            return {
                player: context.player.id,
                prompt: "Heal which Pokémon?",
                choices: context.player.pokemonInPlay.filter(p => p.damage && (p.energy.length >= this.discardEnergy)).map(p => new Choice(p)),
                resolution: InterruptResolution.TrainerTargets,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id ]
            };
        } else if (energy.length < this.discardEnergy) {
            const card = context.engine.search.getCard(target) as PokemonCard;
            return {
                player: context.player.id,
                prompt: `Discard which energy card from ${card.name}?`,
                choices: card.energy.map(e => new Choice(e)),
                resolution: InterruptResolution.TrainerTargets,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id, target, ...energy ]
            };
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
