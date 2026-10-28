import { InterruptResolution } from "../InterruptResolution.js";
import { Turn } from "../state/Turn.js";
import { GameWorker } from "./GameWorker.js";

export class GameWorker_Turn extends GameWorker {
    private get turn(): Turn {
        return this.state.turn!;
    }

    public update() {
        this.game.interrupt({
            player: this.turn.player,
            prompt: "Your turn.",
            choices: [
                {
                    text: "play a card",
                    resolution: InterruptResolution.PlayCard
                },
                {
                    text: "attack",
                    resolution: InterruptResolution.Attack
                },
                {
                    text: "end turn",
                    resolution: InterruptResolution.EndTurn
                }
            ],
            force: true
        });
    }
};
