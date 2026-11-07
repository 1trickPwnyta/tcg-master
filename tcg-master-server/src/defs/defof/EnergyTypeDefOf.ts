import { EnergyTypeDef } from "../EnergyTypeDef.js";
import { DefOf } from "./DefOf.js";

@DefOf<EnergyTypeDef>()
export class EnergyTypeDefOf {
    public static readonly Colorless: EnergyTypeDef;
    public static readonly Grass: EnergyTypeDef;
    public static readonly Fire: EnergyTypeDef;
    public static readonly Water: EnergyTypeDef;
    public static readonly Lightning: EnergyTypeDef;
    public static readonly Psychic: EnergyTypeDef;
    public static readonly Fighting: EnergyTypeDef;
};
