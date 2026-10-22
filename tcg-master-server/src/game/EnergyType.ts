export abstract class EnergyType {
    public static readonly Grass: EnergyType = new class extends EnergyType {
        public override readonly symbol: string = "🍃";
    };

    public static readonly Fire: EnergyType = new class extends EnergyType {
        public override readonly symbol: string = "🔥";
    };

    public static readonly Water: EnergyType = new class extends EnergyType {
        public override readonly symbol: string = "💧";
    };

    public static readonly Colorless: EnergyType = new class extends EnergyType {
        public override readonly symbol: string = "⚪";
        public override readonly resolutionPriority: number = -1;
    };

    public static readonly Lightning: EnergyType = new class extends EnergyType {
        public override readonly symbol: string = "⚡️";
    };

    public static readonly Psychic: EnergyType = new class extends EnergyType {
        public override readonly symbol: string = "👁️";
    };

    public static readonly Fighting: EnergyType = new class extends EnergyType {
        public override readonly symbol: string = "👊";
    }

    public abstract readonly symbol: string;
    public readonly resolutionPriority: number = 0;

    public satisfies(type: EnergyType): boolean {
        return this == type || type == EnergyType.Colorless;
    }

    public toString(): string {
        return this.symbol;
    }
};
