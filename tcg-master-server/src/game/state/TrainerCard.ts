import { TrainerCardDef } from "../../defs/TrainerCardDef.js";
import { PlayContext } from "../cards/workers/CardWorker.js";
import { Card } from "./Card.js";
import { Interrupt } from "./interrupts/Interrupt.js";
import { Serializable } from "./serializer.js";

@Serializable()
export class TrainerCard extends Card {
    public get def(): TrainerCardDef {
        return super.def as TrainerCardDef;
    }

    public override play(): boolean {
        this.owner.limbo.add(this);

        const context = {
            engine: this.engine,
            player: this.owner,
            card: this
        };

        const interrupt = this.selectTargets(context);
        if (interrupt === "fail") {
            return false;
        } else if (interrupt) {
            this.engine.interrupts.interrupt(interrupt);
            return true;
        }

        this.engine.send(this.owner, "used", this, ".");
        this.execute(context);
        this.owner.discard.add(this);
        
        return true;
    }

    private selectTargets(context: PlayContext): Interrupt | "fail" | null {
        for (const worker of this.def.workers) {
            const interrupt = worker.selectTargets(context);
            if (interrupt) {
                return interrupt;
            }
        }

        return null;
    }

    public execute(context: PlayContext, ...targets: number[]) {
        for (const worker of this.def.workers) {
            worker.execute(context, ...targets);
        }
    }
};
