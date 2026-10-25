export class AIPlanner {
    private static results: { choices: string[], score: number }[] = [];

    private static recordResults(choices: string[], score: number) {
        AIPlanner.results.push({ choices: choices, score: score });
    }

    public static getBestChoices(): string[] {
        return AIPlanner.results.sort((a, b) => b.score - a.score)[0].choices;
    }

    public static reset() {
        AIPlanner.results = [];
    }

    public nextChoice: string | null;
    public previousChoices: string[];
    public choice: string | null = null;
    public nullified: boolean = false;

    public constructor(nextChoice: string, previousChoices: string[] = []) {
        this.nextChoice = nextChoice;
        this.previousChoices = previousChoices;
    }

    public recordScore(score: number) {
        AIPlanner.recordResults([ ...this.previousChoices, this.choice! ], score);
    }
};
