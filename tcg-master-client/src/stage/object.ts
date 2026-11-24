import $ from "jquery";
import { Vector } from "./math";
import { Perspective, STAGE_SIZE } from "./stage";

export class StageObject {
    public readonly element: JQuery<HTMLElement>;

    public constructor(className: string) {
        this.element = $("<div>", { class: className });
    }

    public draw(stage: JQuery<HTMLElement>, position: Vector, perspective: Perspective) {
        const x = perspective === Perspective.Favoring ? position.x : STAGE_SIZE.x - position.x;
        const y = perspective === Perspective.Favoring ? position.y : STAGE_SIZE.y - position.y;
        const scale = perspective === Perspective.Favoring ? 1 : -1;
        this.element.css({
            left: `${x}px`,
            top: `${y}px`,
            scale: `${scale} ${scale}`
        });
        stage.append(this.element);
    }
};
