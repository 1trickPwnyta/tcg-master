export class EvolutionTree {
    public readonly name: string;
    public next: EvolutionTree[] = [];

    public constructor(name: string) {
        this.name = name;
    }

    public then(...next: (string | EvolutionTree)[]): EvolutionTree {
        for (const branch of next) {
            if (branch instanceof EvolutionTree) {
                this.next.push(branch);
            } else {
                this.next.push(new EvolutionTree(branch));
            }
        }
        return this;
    }

    public evolvesDirect(current: string, next: string): boolean {
        return this.next.some(n => n.name == next);
    }

    public static readonly Staryu: EvolutionTree = new EvolutionTree("Staryu").then("Starmie");
    public static readonly Vulpix: EvolutionTree = new EvolutionTree("Vulpix").then("Ninetales");
}
