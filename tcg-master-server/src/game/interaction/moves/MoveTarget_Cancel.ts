import { IMoveTarget } from "./IMoveTarget.js";

export class MoveTarget_Cancel implements IMoveTarget {
    get label(): string {
        return "cancel";
    }

    get isCancel(): boolean {
        return true;
    }
}