import { InterruptResolution } from "./interrupts/InterruptResolution.js";
import { Serializable, Serialize } from "./serializer.js";

export interface ITargetable {
    targetName: string;
    id: number | string;
};

@Serializable()
export class Choice {
    public static get Yes(): Choice {
        return new Choice({ text: "yes", id: "yes" });
    }

    public static get No(): Choice {
        return new Choice({ text: "no", id: "no" });
    }

    @Serialize()
    public readonly label: string;

    @Serialize()
    public readonly id?: number | string;

    @Serialize()
    public resolution?: InterruptResolution;

    @Serialize()
    public args?: number[];

    @Serialize()
    public turnEnding: boolean = false;

    @Serialize()
    public aiScoreOffset: number = 0;

    public constructor(target: ITargetable | { text: string, id?: number | string }) {
        this.label = "targetName" in target ? target.targetName : target.text;
        this.id = target.id;
    }

    public withResolution(resolution: InterruptResolution, ...args: number[]) {
        this.resolution = resolution;
        this.args = args;
        return this;
    }

    public endsTurn(): Choice {
        this.turnEnding = true;
        return this;
    }

    public withAiScoreOffset(offset: number): Choice {
        this.aiScoreOffset = offset;
        return this;
    }
};
