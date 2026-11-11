import { TrainerCardDef } from "../../defs/TrainerCardDef.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Card } from "./Card.js";
import { Interrupt } from "./interrupts/Interrupt.js";
import { Location } from "./Location.js";
import { Player } from "./Player.js";
import { Serializable } from "./serializer.js";

export type TrainerContext = {
    engine: GameEngine,
    player: Player,
    card: TrainerCard,
    targetsLocation?: Location
};

@Serializable()
export class TrainerCard extends Card {
    public get def(): TrainerCardDef {
        return super.def as TrainerCardDef;
    }

    public override play(...targets: number[]): boolean {
        this.owner.limbo.add(this);

        const context = {
            engine: this.engine,
            player: this.owner,
            card: this
        };

        if (this.preTarget(context) === "fail") {
            this.cancel(context);
            return false;
        }

        if (this.def.preannounce && targets.length === 0) {
            this.engine.send(this.owner, "used", this, ".");
        }

        const interrupt = this.validateTargets(context, ...targets);
        if (interrupt === "fail") {
            this.cancel(context);
            return false;
        } else if (interrupt) {
            this.engine.interrupts.interrupt(interrupt);
            return true;
        }

        if (!this.def.preannounce) {
            this.engine.send(this.owner, "used", this, ".");
        }
        
        this.execute(context, ...targets);
        if (this.location == this.owner.limbo) {
            this.discard();
        }
        
        return true;
    }

    private cancel(context: TrainerContext) {
        context.player.limbo.sendAllBack();
    }

    private preTarget(context: TrainerContext): true | "fail" {
        for (const worker of this.def.workers) {
            const result = worker.preTarget(context);
            if (result === "fail") {
                return "fail";
            }
        }

        return true;
    }

    private validateTargets(context: TrainerContext, ...targets: number[]): Interrupt | "fail" | null {
        for (const worker of this.def.workers) {
            const interrupt = worker.validateTargets(context, ...targets);
            if (interrupt) {
                return interrupt;
            }
        }

        return null;
    }

    private execute(context: TrainerContext, ...targets: number[]) {
        for (const worker of this.def.workers) {
            worker.execute(context, ...targets);
        }
    }
};
