import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Heal extends TrainerWorker {
    private readonly amount: number;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
    }

    public override validateTargets(context: TrainerContext, target: number): Interrupt | "fail" | null {
        if (!context.player.pokemonInPlay.some(c => c.damage)) {
            context.engine.sendError(context.player, "None of your Pokémon can be healed right now.");
            return "fail";
        } else if (!target) {
            return {
                player: context.player.id,
                prompt: "Heal which Pokémon?",
                choices: context.player.pokemonInPlay.filter(p => p.damage).map(p => new Choice(p)),
                resolution: InterruptResolution.TrainerTargets,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id ]
            };
        }

        return null;
    }

    public override execute(context: TrainerContext, target: number): void {
        const card = context.engine.search.getCard(target) as PokemonCard;
        card.heal(this.amount);
    }
};
