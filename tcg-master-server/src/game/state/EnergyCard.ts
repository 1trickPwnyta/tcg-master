import { DefDatabase } from "../../defs/DefDatabase.js";
import { EnergyCardDef } from "../../defs/EnergyCardDef.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { Card } from "./Card.js";
import { Choice } from "./Choice.js";
import { InterruptResolution } from "./interrupts/InterruptResolution.js";
import { Serializable, Serialize } from "./serializer.js";

@Serializable()
export class EnergyCard extends Card {
    @Serialize()
    private typeOverride?: string;

    public get def(): EnergyCardDef {
        return super.def as EnergyCardDef;
    }

    public get energy(): EnergyTypeDef[] {
        return Array.from({ length: this.def.amount }, () => this.typeOverride ? DefDatabase.get<EnergyTypeDef>(this.typeOverride) : this.def.type);
    }

    public setOverride(type: EnergyTypeDef) {
        this.typeOverride = type.name;
    }

    public clearOverride() {
        this.typeOverride = undefined;
    }

    public override play(): boolean {
        this.engine.interrupts.interrupt({
            player: this.owner.id,
            prompt: `Attach ${this.name} to which Pokémon?`,
            choices: this.owner.pokemonInPlay.map(c => new Choice(c)),
            resolution: InterruptResolution.AttachEnergy,
            args: [ this.id ]
        });
        
        return true;
    }
};
