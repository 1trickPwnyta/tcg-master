import { Token } from "./Client.js";

declare global {
    interface Object {
        readonly tokenType: string;
        readonly tokens: Token[];
    }

    interface String {
        capitalizeFirst(): string;
    }
}

String.prototype.capitalizeFirst = function (this: string): string {
    return this.length ? this[0].toUpperCase() + this.substring(1) : this;
};
