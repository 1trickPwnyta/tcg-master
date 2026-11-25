export type CardState = {
    id: number;
    name: string;
    graphicPath: string;
};

export type PokemonCardState = CardState & {
    damage: number;
    attachments: {
        cards: CardState[]
    };
};

export type State = {
    self: {
        id: number,
        name: string,
        active?: PokemonCardState,
        bench: PokemonCardState[],
        hand: CardState[],
        discard: CardState[],
        deck: number,
        prizes: number
    };
    opponent: {
        id: number,
        name: string,
        active?: PokemonCardState,
        bench: PokemonCardState[],
        hand: number,
        discard: CardState[],
        deck: number,
        prizes: number
    };
};
