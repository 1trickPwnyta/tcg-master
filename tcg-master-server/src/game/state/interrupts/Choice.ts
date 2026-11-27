import { InterruptResolution } from "./InterruptResolution.js";
import { Serializable, Serialize } from "../serializer.js";

export interface ITargetable {
    id: number | string;
    targetType?: TargetType;
    targetName: string | any[];
};

export enum TargetType {
    PlayCard = "play_card"
};

@Serializable()
export class Choice {
    public static fromInt(int: number, id?: number | string): Choice {
        return new Choice({ id: id ?? int, targetName: [ { name: int.toString() } ] });
    }

    public static fromText(text: string, id?: number | string, type?: TargetType): Choice {
        return new Choice({ id: id ?? text, targetType: type, targetName: [ { name: text } ] });
    }

    public static get Yes(): Choice {
        return Choice.fromText("yes");
    }

    public static get No(): Choice {
        return Choice.fromText("no");
    }

    @Serialize()
    public readonly parts: any[];

    @Serialize()
    public readonly id: number | string;

    @Serialize()
    public readonly targetType?: string;

    @Serialize()
    public resolution?: InterruptResolution;

    @Serialize()
    public args?: number[];

    @Serialize()
    public hint_priority: number = 0;

    @Serialize()
    public aiScoreOffset: number = 0;

    public constructor(target: ITargetable) {
        this.parts = typeof target.targetName === "string" ? [ target.targetName ] : target.targetName;
        this.id = target.id;
        this.targetType = target.targetType;
    }

    public withResolution(resolution: InterruptResolution, ...args: number[]) {
        this.resolution = resolution;
        this.args = args;
        return this;
    }

    public withPriority(priority: number): Choice {
        this.hint_priority = priority;
        return this;
    }

    public withAiScoreOffset(offset: number): Choice {
        this.aiScoreOffset = offset;
        return this;
    }
};
