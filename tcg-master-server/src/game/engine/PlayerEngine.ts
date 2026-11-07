import { PlayerState } from "../state/PlayerState.js";
import { SubEngine } from "./SubEngine.js";

export class PlayerEngine extends SubEngine {
    public static makePlayer(id: number, name: string): PlayerState {
        return {
            id: id,
            token: { name: name, type: "player" },
            name: name,
            pronouns: { subjective: "they", possessive: "their" },
            active: { id: id * 10 + 0, cards: [] },
            bench: { id: id * 10 + 1, cards: [] },
            limbo: { id: id * 10 + 6, cards: [] },
            hand: { id: id * 10 + 2, cards: [] },
            discard: { id: id * 10 + 3, cards: [] },
            prizes: { id: id * 10 + 4, cards: [] },
            deck: { id: id * 10 + 5, cards: [] },
            mulligans: 0,
            mulliganBonusUsed: false,
            setupComplete: false,
            menus: 0
        };
    }

    public get active(): PlayerState {
        return this.state.players.find(p => p.id === this.state.turn!.player)!;
    }

    public get inactive(): PlayerState {
        return this.state.players.find(p => p.id !== this.state.turn!.player)!;
    }

    public get(player_id: number): PlayerState {
        return this.state.players.find(p => p.id === player_id)!;
    }

    public getOpponent(player_id: number): PlayerState {
        return this.state.players.find(p => p.id !== player_id)!;
    }
};
