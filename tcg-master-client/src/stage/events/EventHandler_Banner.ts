import { Banner } from "../banner";
import { EventHandler } from "./EventHandler";

export class EventHandler_Banner extends EventHandler {
    public onEvent(args: { message: string, permanent: boolean }, callback: () => void) {
        const banner = new Banner(this.stage, args.message, callback);
        banner.permanent = args.permanent;
        banner.draw();
    }
};
