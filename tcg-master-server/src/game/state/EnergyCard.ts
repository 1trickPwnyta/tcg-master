import { EnergyCardDef } from "../../defs/EnergyCardDef.js";
import { Card } from "./Card.js";
import { InterruptResolution } from "./interrupts/InterruptResolution.js";
import { Serializable } from "./serializer.js";

@Serializable()
export class EnergyCard extends Card {
    public get def(): EnergyCardDef {
        return super.def as EnergyCardDef;
    }

    public override play(): boolean {
        if (this.engine.game.turn?.energyPlayed) {
            this.engine.sendError(this.owner, "You already played an Energy card this turn.");
            return false;
        }
        
        this.engine.interrupts.interrupt({
            player: this.owner.id,
            prompt: `Attach ${this.name} to which Pokémon?`,
            choices: this.owner.pokemonInPlay.map(c => ({
                text: c.name + (c == this.owner.activePokemon ? " (active)" : ""),
                target_id: c.id
            })),
            resolution: InterruptResolution.AttachEnergy,
            args: [ this.id ]
        });
        
        return true;
    }
};
