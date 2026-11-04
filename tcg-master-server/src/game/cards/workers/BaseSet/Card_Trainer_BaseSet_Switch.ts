import { InterruptResolution } from "../../../state/interrupts/InterruptResolution.js";
import { InterruptType } from "../../../state/interrupts/InterruptType.js";
import { Card } from "../../CardDatabase.js";
import { PlayContext } from "../CardWorker.js";
import { CardWorker_Trainer } from "../CardWorker_Trainer.js";

@Card("BaseSet.Switch")
export class Card_Trainer_BaseSet_Switch extends CardWorker_Trainer {
    public override readonly name: string = "Switch";
    public override readonly text: string = "Switch 1 of your own Benched Pokémon with your Active Pokémon.";
    public override readonly targeting: boolean = true;

    public override execute(context: PlayContext, target_id: number) {
        if (!context.player.bench.cards.length) {
            context.game.sendError(context.player, "There are no Pokémon on your bench to switch with.");
            return false;
        }
        if (target_id !== undefined) {
            context.game.send(context.player, "switched", context.player.active.cards[0], "with", context.game.search.getCard(target_id), ".");
            context.game.cards.move(context.player.active.cards[0].id, context.player.active.id, context.player.bench.id);
            context.game.cards.move(target_id, context.player.bench.id, context.player.active.id);
            return true;
        } else {
            context.game.interrupts.interrupt({
                type: InterruptType.Switch,
                player: context.player.id,
                prompt: `Switch ${context.player.active.cards[0].name} with which benched Pokémon?`,
                choices: context.player.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
                resolution: InterruptResolution.UseTrainer,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id ]
            });
            return true;
        }
    }
};
