import { AcceptanceReport } from "../../AcceptanceReport.js";
import { TrainerCardDef } from "../../defs/TrainerCardDef.js";
import { TrainerContext } from "../trainers/TrainerContext.js";
import { Card } from "./Card.js";
import { Interrupt } from "./interrupts/Interrupt.js";
import { Location } from "./Location.js";
import { PokemonCardWrapper } from "./PokemonCardWrapper.js";
import { Serializable } from "./serializer.js";

@Serializable()
export class TrainerCard extends Card {
    public get def(): TrainerCardDef {
        return super.def as TrainerCardDef;
    }

    public override play(...targets: (number | string)[]): boolean {
        const report = this.validate();
        if (!report.accepted) {
            this.engine.sendError(this.owner, report.reason!);
            return false;
        }

        if (this.def.preannounce && targets.length === 0) {
            this.engine.send(this.owner, "used", this, ".");
        }

        const interrupt = this.acquireTargets(...targets);
        if (interrupt) {
            this.engine.interrupts.interrupt(interrupt);
            return true;
        }

        if (!this.def.preannounce) {
            this.engine.send(this.owner, "used", this, ".");
        }
        
        this.engine.showcase(this);
        this.execute(...targets);
        if (this.location == this.owner.hand) {
            this.discard();
        }

        return true;
    }

    private validate(): AcceptanceReport {
        const context = new TrainerContext(this.engine, this);
        for (const worker of this.def.workers) {
            const report = worker.validate(context);
            if (!report.accepted) {
                return report;
            }
        }

        return AcceptanceReport.Accepted;
    }

    private acquireTargets(...targets: (number | string)[]): Interrupt | null {
        const context = new TrainerContext(this.engine, this, ...targets);
        for (const worker of this.def.workers) {
            const interrupt = worker.acquireTargets(context);
            if (interrupt) {
                return interrupt;
            }
        }

        return null;
    }

    private execute(...targets: (number | string)[]) {
        const context = new TrainerContext(this.engine, this, ...targets);
        for (const worker of this.def.workers) {
            worker.execute(context);
        }
    }

    public override notify_postmove(_oldLocation: Location | null, newLocation: Location): void {
        if (newLocation == this.owner.active || newLocation == this.owner.bench) {
            if (this.def.wrapper) {
                const wrapper = new PokemonCardWrapper(this.engine, this.def.wrapper, this);
                newLocation.cards.splice(newLocation.cards.indexOf(this), 1);
                newLocation.add(wrapper);
            }
        }
    }
};
