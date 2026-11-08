import { GameEngine } from "../engine/GameEngine.js";
import { Interrupt } from "./interrupts/Interrupt.js";
import { PlayerState } from "./PlayerState.js";
import { Serializable, SerializationHydrate, SerializationReplace, Serialize } from "./serializer.js";
import { State } from "./State.js";
import { Turn } from "./Turn.js";

@Serializable()
export class GameState extends State {
    @Serialize()
    public readonly players: PlayerState[] = [];

    @Serialize()
    public turn: Turn | null = null;

    @Serialize()
    public interrupt: Interrupt | null = null;

    @Serialize()
    public readonly interruptStack: Interrupt[] = [];

    @Serialize()
    public readonly rules: { prizes: number };

    @Serialize()
    public betweenTurns: boolean = false;

    @Serialize()
    public winner_id?: number;

    @Serialize()
    public nextInterrupt_id: number = 1000;

    public constructor(engine: GameEngine, rules: { prizes: number }) {
        super(engine);
        this.rules = rules;
        this.nextInterrupt_id = 1000;
    }

    public clone(engine: GameEngine): GameState {
        const json = JSON.stringify(this, SerializationReplace);
        const raw = JSON.parse(json);
        const hydrated = SerializationHydrate(raw, engine);
        return hydrated;
    }
};
