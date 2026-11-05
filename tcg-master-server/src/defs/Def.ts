export abstract class Def {
    public abstract readonly name: string;
    public abstract readonly label: string;

    public abstract init(): Promise<void>;
};
