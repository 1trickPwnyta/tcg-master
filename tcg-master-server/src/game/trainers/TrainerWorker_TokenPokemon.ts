import { AcceptanceReport } from "../../AcceptanceReport.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_TokenPokemon extends TrainerWorker {
    private readonly wrapper_def: string;

    public constructor(args: any) {
        super();
        this.wrapper_def = args.wrapper;
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (context.player.bench.full) {
            return AcceptanceReport.Rejected("Your bench is full.");
        }

        return AcceptanceReport.Accepted;
    }

    public override execute(context: TrainerContext) {
        context.player.bench.add(context.card);
    }
};
