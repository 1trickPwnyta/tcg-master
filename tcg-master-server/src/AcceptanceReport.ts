export class AcceptanceReport {
    public static get Accepted(): AcceptanceReport {
        return new AcceptanceReport(true);
    }

    public static Rejected(reason: string) {
        return new AcceptanceReport(false, reason);
    }

    public readonly accepted: boolean;
    public readonly reason?: string;

    private constructor(accepted: boolean, reason?: string) {
        this.accepted = accepted;
        this.reason = reason;
    }
};