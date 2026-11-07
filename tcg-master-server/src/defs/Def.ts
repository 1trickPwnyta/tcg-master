import { IDefData } from "./IDefData.js";

export abstract class Def {
    public readonly name: string;
    public readonly label?: string;

    public constructor(data: IDefData) {
        this.name = data.name;
        this.label = data.label ?? data.name;
    }

    public abstract init(): Promise<void>;

    public getDetails(): any[] {
        return [];
    }
};
