import { Vector } from "../math";
import { StageObject } from "../object";
import { STAGE_SIZE } from "../stage";
import { EventHandler } from "./EventHandler";

export class EventHandler_CoinFlip extends EventHandler {
    public onEvent(args: any, callback: () => void) {
        const positions = this.calculatePositions(args.results.length, 50 * Math.min(args.results.length, 10));
        for (let i = 0; i < positions.length; i++) {
            this.flip(STAGE_SIZE.half().translate(positions[i].x, positions[i].y), args.results[i]);
        }
        setTimeout(callback, 1700);
    }

    private flip(position: Vector, result: boolean) {
        const coin = new StageObject(this.stage, "coin");
        coin.persistent = true;
        coin.element.addClass("coin-flip");
        coin.position = position;
        let front = true;
        coin.element.on("animationiteration", function() {
            front = !front;
            coin.element.css("background-image", `url("/coin-images/${front ? "front" : "back"}.png")`);
        });
        coin.draw();
        setTimeout(() => {
            coin.element.removeClass("coin-flip");
            coin.element.css("background-image", `url("/coin-images/${result ? "front" : "back"}.png")`);
            setTimeout(() => coin.element.fadeOut(1000), 1000);
        }, 700);
    }

    private calculatePositions(amount: number, radius: number): Vector[] {
        if (amount <= 0) return [];
        if (amount === 1) return [ new Vector() ];

        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const offset = Math.random() * 2 * Math.PI;
        const points = [];

        for (let i = 0; i < amount; i++) {
            const r = radius * Math.sqrt((i + 0.5) / amount);
            const theta = offset + i * goldenAngle;
            points.push(new Vector(r * Math.cos(theta), r * Math.sin(theta)));
        }

        return points;
    }
};
