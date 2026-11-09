import { PlayContext } from "../cards/workers/CardWorker.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Heal extends TrainerWorker {
    private readonly amount: number;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
    }

    public override selectTargets(context: PlayContext): Interrupt | "fail" | null {
        if (!context.player.pokemonInPlay.some(c => c.damage)) {
            context.engine.sendError(context.player, "None of your Pokémon can be healed right now.");
            return "fail";
        }

        return {
            player: context.player.id,
            prompt: "Heal which Pokémon?",
            choices: context.player.pokemonInPlay.filter(p => p.damage).map(p => ({ text: `${p.name}${p === context.player.activePokemon ? " (active)" : ""}`, target_id: p.id })),
            resolution: InterruptResolution.UseTrainer,
            cancelResolution: InterruptResolution.CancelTrainer,
            args: [ context.card.id ]
        };
    }

    public override execute(context: PlayContext, target: number): void {
        const card = context.engine.search.getCard(target) as PokemonCard;
        card.heal(this.amount);
    }
};
