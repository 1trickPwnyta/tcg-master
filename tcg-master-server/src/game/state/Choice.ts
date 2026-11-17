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
    public readonly resolution?: InterruptResolution;

    @Serialize()
    public readonly args?: number[]

    public constructor(target: ITargetable | { text: string, id?: number | string }, resolution?: InterruptResolution, ...args: number[]) {
        this.label = "targetName" in target ? target.targetName : target.text;
        this.id = target.id;
        this.resolution = resolution;
        if (args?.length) {
            this.args = args;
        }
    }
};
