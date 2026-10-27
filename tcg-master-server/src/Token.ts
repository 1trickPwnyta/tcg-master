export interface IToken {
    name: string;
    tokenType: string | undefined;
};

export class Token implements IToken {
    public name: string;
    public tokenType: string | undefined;

    public constructor(text: string, type: string | undefined) {
        this.name = text;
        this.tokenType = type;
    }

    public setText(text: string): Token {
        this.name = text;
        return this;
    }

    public setType(type: string | undefined): Token {
        this.tokenType = type;
        return this;
    }
};
