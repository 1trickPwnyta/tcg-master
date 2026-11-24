import $ from "jquery";
import { Vector } from "./math";
import type { PokemonCardState, State } from "./state";
import { PokemonCard } from "./cards";

export const STAGE_SIZE = new Vector(600, 600);
export const CARD_SIZE = new Vector(72, 99);

const ACTIVE_POSITION = new Vector(STAGE_SIZE.x / 2, STAGE_SIZE.y * 2 / 3);
const BENCH_POSITION = new Vector(STAGE_SIZE.x / 2, STAGE_SIZE.y * 9 / 10);
const BENCH_OFFSET = STAGE_SIZE.x / 7;

export enum Perspective {
    Favoring,
    Opposing
};

export class Stage {
    private _state?: State;

    public get state(): State | undefined {
        return this._state;
    }

    public update(state: State) {
        this._state = state;
        this.draw();
    }

    private draw() {
        const stage = $("#stage");
        stage.html("");
        
        if (this.state) {
            this.drawPlayer(stage, Perspective.Favoring, this.state.self.active, this.state.self.bench);
            this.drawPlayer(stage, Perspective.Opposing, this.state.opponent.active, this.state.opponent.bench);
        }
    }

    private drawPlayer(stage: JQuery<HTMLElement>, perspective: Perspective, active: PokemonCardState | undefined, bench: PokemonCardState[]) {
        if (active) {
            const card = new PokemonCard(active);
            card.draw(stage, ACTIVE_POSITION, perspective);
        }

        let benchPosition = BENCH_POSITION.translate(-(bench.length - 1) * BENCH_OFFSET / 2, 0);
        for (let i = 0; i < bench.length; i++) {
            const card = new PokemonCard(bench[i]);
            card.draw(stage, benchPosition, perspective);
            benchPosition = benchPosition.translate(BENCH_OFFSET, 0);
        }
    }
};
