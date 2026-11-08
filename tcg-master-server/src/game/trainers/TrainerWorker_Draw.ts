import { PlayContext } from "../cards/workers/CardWorker.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Draw extends TrainerWorker {
    private readonly amount: number;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
    }

    public override execute(context: PlayContext): void {
        context.engine.cards.draw(context.player.id, this.amount);
    }
};
