import { DefDatabase } from "../../defs/DefDatabase.js";
import { EnergyCardDef } from "../../defs/EnergyCardDef.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { Card } from "./Card.js";
import { Choice } from "./interrupts/Choice.js";
import { InterruptSync } from "./interrupts/Interrupt.js";
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
        this.engine.interrupts.interrupt(new InterruptSync(this.owner)
            .withPrompt("Attach", this, "to which Pokémon?")
            .withChoices(this.owner.pokemonInPlay.map(c => new Choice(c)))
            .withResolution(InterruptResolution.AttachEnergy)
            .withArgs(this.id));
        
        return true;
    }
};
