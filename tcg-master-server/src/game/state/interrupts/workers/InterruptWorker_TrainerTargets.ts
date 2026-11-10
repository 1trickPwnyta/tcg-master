import { TrainerCard } from "../../TrainerCard.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.TrainerTargets)
export class InterruptWorker_TrainerTargets extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number, card_id: number, ...otherTargets: number[]): boolean {
        const card = context.engine.search.getCard(card_id) as TrainerCard;
        card.play(...otherTargets, target_id);
        return true;
    }
};
