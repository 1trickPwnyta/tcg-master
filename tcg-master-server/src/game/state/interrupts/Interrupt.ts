import { GameEngine } from "../../engine/GameEngine.js";
import { Player } from "../Player.js";
import { Serializable, Serialize } from "../serializer.js";
import { State } from "../State.js";
import { Choice } from "./Choice.js";
import { InterruptResolution } from "./InterruptResolution.js";
import { InterruptType } from "./InterruptType.js";

export type InterruptArgument = number | string | null;

@Serializable()
export abstract class Interrupt extends State {
    @Serialize()
    public readonly id: number;

    public constructor(engine: GameEngine) {
        const id = engine.game.nextInterrupt_id++;
        super(id, engine);
        this.id = id;
    }

    public abstract getInterruptFor(player: number): InterruptSync | null;
};

@Serializable()
export class InterruptSync extends Interrupt {
    @Serialize()
    public player: number;

    @Serialize()
    public type?: InterruptType;

    @Serialize()
    public _prompt?: any[];

    @Serialize()
    public _choices?: Choice[];

    @Serialize()
    public force?: boolean;

    @Serialize()
    public resolution?: InterruptResolution;

    @Serialize()
    public cancelResolution?: InterruptResolution;

    @Serialize()
    public args?: InterruptArgument[];

    @Serialize()
    public compoundArgs?: any;

    public get choices(): Choice[] {
        return this._choices!;
    }

    public get prompt(): any[] {
        return this._prompt!;
    }

    public constructor(player: Player) {
        super(player.engine);
        this.player = player.id;
    }

    public override getInterruptFor(player: number): InterruptSync | null {
        if (this.player === player) {
            return this;
        }

        return null;
    }

    public withPrompt(...parts: any[]): this {
        this._prompt = parts;
        return this;
    }

    public withChoices(choices: Choice[]): this {
        this._choices = choices;
        return this;
    }

    public ofType(type: InterruptType): this {
        this.type = type;
        return this;
    }

    public forced(): this {
        this.force = true;
        return this;
    }

    public withResolution(resolution: InterruptResolution): this {
        this.resolution = resolution;
        return this;
    }

    public withCancelResolution(resolution: InterruptResolution): this {
        this.cancelResolution = resolution;
        return this;
    }

    public withArgs(...args: InterruptArgument[]): this {
        this.args = args;
        return this;
    }

    public withCompoundArgs(args: any): this {
        this.compoundArgs = args;
        return this;
    }
};

@Serializable()
export class InterruptAsync extends Interrupt {
    @Serialize()
    public readonly interrupts: Interrupt[];

    public constructor(engine: GameEngine, ...interrupts: Interrupt[]) {
        super(engine);
        this.interrupts = interrupts;
    }

    public getInterruptFor(player: number): InterruptSync | null {
        for (const interrupt of this.interrupts) {
            const sub = interrupt.getInterruptFor(player);
            if (sub) {
                return sub;
            }
        }
        return null;
    }

    public close(id: number) {
        const i = this.interrupts.findIndex(i => i.id === id);
        if (i >= 0) {
            this.interrupts.splice(i, 1);
        } else {
            for (const interrupt of this.interrupts.filter(i => i instanceof InterruptAsync)) {
                interrupt.close(i);
            }
        }
    }
};
