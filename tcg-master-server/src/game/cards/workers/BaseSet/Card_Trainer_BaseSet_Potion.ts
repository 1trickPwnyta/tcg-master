import { InterruptResolution } from "../../../state/interrupts/InterruptResolution.js";
import { Card } from "../../CardDatabase.js";
import { PlayContext } from "../CardWorker.js";
import { CardWorker_Trainer } from "../CardWorker_Trainer.js";

@Card("BaseSet.Potion")
export class Card_Trainer_BaseSet_Potion extends CardWorker_Trainer {
    public override readonly name: string = "Potion";
    public override readonly text: string = "Remove 2 damage counters from 1 of your Pokémon (1 if that Pokémon has only 1).";
    public override readonly targeting: boolean = true;

    public override execute(context: PlayContext, target_id?: number): boolean {
        if (target_id !== undefined) {
            context.game.pokemon.heal(context.player.id, target_id, 20);
            return true;
        } else {
            context.game.interrupts.interrupt({
                player: context.player.id,
                prompt: "Heal which Pokémon?",
                choices: [ ...context.player.active.cards.map(c => ({ text: `${c.name} (active)`, target_id: c.id })), ...context.player.bench.cards.map(c => ({ text: c.name, target_id: c.id })) ],
                resolution: InterruptResolution.UseTrainer,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id ]
            });
            return true;
        }
    }
};
