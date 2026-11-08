import { PlayContext } from "../cards/workers/CardWorker.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Heal extends TrainerWorker {
    private readonly amount: number;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
    }

    public override validateTargets(context: PlayContext, target: number): Interrupt | "fail" | null {
        if (![ ...context.player.active.cards, ...context.player.bench.cards ].some(c => c.damage)) {
            context.engine.sendError(context.player, "None of your Pokémon can be healed right now.");
            return "fail";
        }

        if (!target) {
            return {
                player: context.player.id,
                prompt: "Heal which Pokémon?",
                choices: [ ...context.player.active.cards.filter(c => c.damage).map(c => ({ text: `${c.name} (active)`, target_id: c.id })), ...context.player.bench.cards.filter(c => c.damage).map(c => ({ text: c.name, target_id: c.id })) ],
                resolution: InterruptResolution.UseTrainer,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id ]
            };
        }

        return null;
    }

    public override execute(context: PlayContext, target: number): void {
        context.engine.pokemon.heal(context.player.id, target, this.amount);
    }
};
