import { DefDatabase } from "./DefDatabase.js";
import { IDefData } from "./IDefData.js";

export abstract class Def {
    public static populatePlaceholders(original: string): string {
        return original.replaceAll(/\{[^\}]+\}/g, match => {
            const defName = match.split(":")[1];
            const def = DefDatabase.get(defName);
            return def.toString();
        });
    }

    public readonly name: string;
    public readonly label: string;

    public constructor(data: IDefData) {
        this.name = data.name;
        this.label = data.label ?? data.name;
    }

    public abstract init(): Promise<void>;

    public getDetails(): any[] {
        return [];
    }
};
