import $ from "jquery";
import { Vector } from "./math";
import { Perspective, Stage, STAGE_SIZE } from "./stage";

export class StageObject {
    public readonly stage: Stage;
    public readonly element: JQuery<HTMLElement>;
    public position: Vector = new Vector();
    public perspective: Perspective = Perspective.Favoring;
    public neverFlip: boolean = false;

    public constructor(stage: Stage, className: string) {
        this.stage= stage;
        this.element = $("<div>", { class: `object ${className}` });
        this.stage.element.append(this.element);
    }

    public draw() {
        const x = this.perspective === Perspective.Favoring ? this.position.x : STAGE_SIZE.x - this.position.x;
        const y = this.perspective === Perspective.Favoring ? this.position.y : STAGE_SIZE.y - this.position.y;
        const scale = this.perspective === Perspective.Favoring || this.neverFlip ? 1 : -1;
        this.element.css({
            left: `${x}px`,
            top: `${y}px`,
            scale: `${scale} ${scale}`
        });
    }

    public remove() {
        this.element.remove();
    }
};
