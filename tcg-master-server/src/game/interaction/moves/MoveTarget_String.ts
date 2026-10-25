import { IMoveTarget } from "./IMoveTarget.js";

export class MoveTarget_String implements IMoveTarget {
    private s: string;

    public constructor(s: string) {
        this.s = s;
    }

    public get label(): string {
        return this.s;
    }
};
