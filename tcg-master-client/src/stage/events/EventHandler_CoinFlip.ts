import { StageObject } from "../object";
import { STAGE_SIZE } from "../stage";
import { EventHandler } from "./EventHandler";

export class EventHandler_CoinFlip extends EventHandler {
    public onEvent(args: any, callback: () => void) {
        const coin = new StageObject(this.stage, "coin");
        coin.persistent = true;
        coin.element.addClass("coin-flip");
        coin.position = STAGE_SIZE.half();
        let front = true;
        coin.element.on("animationiteration", function() {
            front = !front;
            coin.element.css("background-image", `url("/coin-images/${front ? "front" : "back"}.png")`);
        });
        coin.draw();
        setTimeout(() => {
            coin.element.removeClass("coin-flip");
            coin.element.css("background-image", `url("/coin-images/${args.result ? "front" : "back"}.png")`);
            setTimeout(() => coin.element.fadeOut(1000), 1000);
            callback();
        }, 700);
    }
};
