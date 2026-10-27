import { GameObject } from "../../GameObject.js";

export class MoveTarget_Cancel implements GameObject {
    get label(): string {
        return "cancel";
    }

    get isCancel(): boolean {
        return true;
    }
}