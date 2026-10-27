export class AIPlanner {
    private static results: { choices: string[], score: number }[] = [];

    private static recordResults(choices: string[], score: number) {
        AIPlanner.results.push({ choices: choices, score: score });
    }

    public static getBestChoices(): string[] | undefined {
        return AIPlanner.results.sort((a, b) => b.score - a.score)[0]?.choices;
    }

    public static reset() {
        AIPlanner.results = [];
    }

    public depth: number = 0;
    public nextChoice: string | null;
    public previousChoices: string[];
    public choice: string | null = null;
    public nullified: boolean = false;

    public constructor(depth: number, nextChoice: string, previousChoices: string[] = []) {
        this.depth = depth;
        this.nextChoice = nextChoice;
        this.previousChoices = previousChoices;
    }

    public branch(choice: string): AIPlanner {
        if (this.choice) {
            this.nullified = true;
        }
        return new AIPlanner(this.depth + 1, choice, this.choice ? [ ...this.previousChoices, this.choice ] : []);
    }

    public recordScore(score: number) {
        AIPlanner.recordResults([ ...this.previousChoices, this.choice! ], score);
    }
};
