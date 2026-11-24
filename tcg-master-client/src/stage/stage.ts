import $ from "jquery";
import { Vector } from "./math";
import type { PokemonCardState, State } from "./state";
import { PokemonCard } from "./cards";

export const STAGE_WIDTH = 600;
export const STAGE_HEIGHT = 600;
const ACTIVE_POSITION = new Vector(STAGE_WIDTH / 2, STAGE_HEIGHT * 2 / 3);
const BENCH_POSITION = new Vector(STAGE_WIDTH / 2, STAGE_HEIGHT * 9 / 10);
const BENCH_OFFSET = STAGE_WIDTH / 7;

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
        console.log(this.state);
        if (this.state) {
            this.drawPlayer(stage, false, this.state.self.active, this.state.self.bench);
            this.drawPlayer(stage, true, this.state.opponent.active, this.state.opponent.bench);
        }
    }

    private drawPlayer(stage: JQuery<HTMLElement>, opposing: boolean, active: PokemonCardState | undefined, bench: PokemonCardState[]) {
        if (active) {
            const card = new PokemonCard(active);
            const position = ACTIVE_POSITION;
            if (!opposing) {
                card.draw(stage, position);
            } else {
                card.drawOpposing(stage, position);
            }
        }

        let benchPosition = bench.length % 2 === 1 ? BENCH_POSITION : BENCH_POSITION.translate(BENCH_OFFSET / 2, 0);
        for (let i = 0; i < bench.length; i++) {
            const card = new PokemonCard(bench[i]);
            if (!opposing) {
                card.draw(stage, benchPosition);
            } else {
                card.drawOpposing(stage, benchPosition);
            }
            benchPosition = benchPosition.translate((i % 2 === 1 ? BENCH_OFFSET : -BENCH_OFFSET) * (i + 1), 0);
        }
    }
};
