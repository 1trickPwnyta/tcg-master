import { TrainerCard } from "../../TrainerCard.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.TrainerTargets)
export class InterruptWorker_TrainerTargets extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number | string, card_id: number, ...targets: (number | string)[]): boolean {
        const card = context.engine.search.getCard(card_id) as TrainerCard;
        targets.push(target_id);
        card.play(...targets);
        return true;
    }
};
