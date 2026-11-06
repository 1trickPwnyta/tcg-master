import { IToken } from "../IToken.js";

export abstract class Def {
    public abstract readonly name: string;
    public abstract readonly label: string;
    public abstract readonly token: IToken;

    public abstract init(): Promise<void>;

    public getDetails(): any[] {
        return [];
    }
};
