import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_FailedRetreat extends StatusWorker {
    public override notify_endOfTurn(context: StatusContext) {
        this.remove(context);
    }
};
