import { TrainerCardDef } from "../../defs/TrainerCardDef.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Card } from "./Card.js";
import { Interrupt, InterruptSync } from "./interrupts/Interrupt.js";
import { InterruptType } from "./interrupts/InterruptType.js";
import { Location } from "./Location.js";
import { Player } from "./Player.js";
import { Serializable } from "./serializer.js";

export type TrainerContext = {
    engine: GameEngine;
    player: Player;
    card: TrainerCard;
    args: any;
    targetsLocation?: Location;
    interruptType?: InterruptType;
    forceInterrupt?: boolean;
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
            card: this,
            args: {}
        };

        if (!this.validate(context)) {
            this.cancel(context);
            return false;
        }

        if (this.def.preannounce && targets.length === 0) {
            this.engine.send(this.owner, "used", this, ".");
        }

        return this.playTrainer(context.args);
    }

    public playTrainer(args: any): boolean {
        const context = {
            engine: this.engine,
            player: this.owner,
            card: this,
            args: args
        };

        const interrupt = this.acquireTargets(context);
        if (interrupt) {
            this.engine.interrupts.interrupt(interrupt);
            return true;
        }

        if (!this.def.preannounce) {
            this.engine.send(this.owner, "used", this, ".");
        }
        
        this.execute(context);
        if (this.location == this.owner.limbo) {
            this.discard();
        }

        return true;
    }

    private cancel(context: TrainerContext) {
        context.player.limbo.sendAllBack();
    }

    private validate(context: TrainerContext): boolean {
        for (const worker of this.def.workers) {
            if (!worker.validate(context)) {
                return false;
            }
        }

        return true;
    }

    private acquireTargets(context: TrainerContext): Interrupt | null {
        for (const worker of this.def.workers) {
            worker.consolidateTargets(context);
            const interrupt = worker.acquireTargets(context, ...worker.getTargets(context));
            if (interrupt) {
                return interrupt;
            }
        }

        return null;
    }

    private execute(context: TrainerContext) {
        for (const worker of this.def.workers) {
            worker.consolidateTargets(context);
            worker.execute(context, ...worker.getTargets(context));
        }
    }
};
