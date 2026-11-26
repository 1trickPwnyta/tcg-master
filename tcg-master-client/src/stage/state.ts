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

export type Player = {
    id: number,
    name: string,
    active?: PokemonCardState,
    bench: PokemonCardState[],
    hand: CardState[] | number,
    discard: CardState[],
    deck: number,
    prizes: number
};

export type State = {
    self: Player;
    opponent: Player;
};
