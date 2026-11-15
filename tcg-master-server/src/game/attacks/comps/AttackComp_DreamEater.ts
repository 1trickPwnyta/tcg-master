import { AcceptanceReport } from "../../../AcceptanceReport.js";
import { StatusDefOf } from "../../../defs/defof/StatusDefOf.js";
import { GameEngine } from "../../engine/GameEngine.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_DreamEater extends AttackComp {
    public override canUse(engine: GameEngine): AcceptanceReport {
        if (engine.game.defendingPokemon.hasStatus(StatusDefOf.Sleep)) {
            return AcceptanceReport.Accepted;
        } else {
            return AcceptanceReport.Rejected(`${engine.game.defendingPokemon.name} is not asleep.`);
        }
    }

    public override apply(context: AttackContext): void { }
};
