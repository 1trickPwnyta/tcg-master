import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Draw extends TrainerWorker {
    private readonly amount: number;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
    }

    public override execute(context: TrainerContext): void {
        context.player.draw(this.amount);
    }
};
