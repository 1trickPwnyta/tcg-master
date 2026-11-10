import { ITargetable } from "../game/state/Choice.js";
import { DefDatabase } from "./DefDatabase.js";
import { IDefData } from "./IDefData.js";

export abstract class Def implements ITargetable {
    public static populatePlaceholders(original: string): string {
        return original.replaceAll(/\{[^\}]+\}/g, match => {
            const defName = match.split(":")[1];
            const def = DefDatabase.get(defName);
            return def.toString();
        });
    }

    public readonly defClass: string;
    public readonly name: string;
    public readonly label: string;

    public get targetName(): string {
        return this.label;
    }

    public get id(): string {
        return this.name;
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
