import { IToken } from "./IToken.js";

declare global {
    interface Object {
        readonly token: IToken;
    }

    interface String {
        capitalizeFirst(): string;
    }
}

String.prototype.capitalizeFirst = function (this: string): string {
    return this.length ? this[0].toUpperCase() + this.substring(1) : this;
};
