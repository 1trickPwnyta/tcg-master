import { Banner } from "../banner";
import { EventHandler } from "./EventHandler";

export class EventHandler_Banner extends EventHandler {
    public onEvent(args: { message: string }, callback: () => void) {
        const banner = new Banner(this.stage, args.message, callback);
        banner.draw();
    }
};
