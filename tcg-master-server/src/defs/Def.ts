import { ITargetable } from "../game/state/interrupts/Choice.js";
import { DefDatabase } from "./DefDatabase.js";
import { IDefData } from "./IDefData.js";

export abstract class Def implements ITargetable {
    public static populatePlaceholders(original: string): string {
        return original.replaceAll(/\{([^\}]+)\}/g, (_, match) => {
            const def = DefDatabase.get(match);
            return def?.toString() ?? "{unknown def}";
        });
    }

    public readonly defClass: string;
    public readonly name: string;
    public readonly label: string;

    public get id(): string {
        return this.name;
    }

    public get targetName(): string {
        return this.label;
    }

    public constructor(defClass: string, data: IDefData) {
        this.defClass = defClass;
        this.name = data.name;
        this.label = data.label ?? data.name;
    }

    public abstract init(): Promise<void>;

    public getDetails(): any[] {
        return [];
    }
};
