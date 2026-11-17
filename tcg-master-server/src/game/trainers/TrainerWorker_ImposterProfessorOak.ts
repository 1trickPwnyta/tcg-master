import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_ImposterProfessorOak extends TrainerWorker {
    public execute(context: TrainerContext): void {
        context.player.opponent.hand.shuffleIntoDeck();
        context.player.opponent.draw(7);
    }
};
