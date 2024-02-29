export class User {
    private playerId: string;
    private name: string;
    private score: number;
    private bonus: number;

    constructor(username: string, playerId: string) {
        this.playerId = playerId;
        this.name = username;
        this.score = 0;
        this.bonus = 0;
    }

    addScore(score: number) {
        this.score += score;
    }

    addBonus(bonus: number) {
        this.bonus += bonus;
    }

    getPlayerId() {
        return this.playerId;
    }

    getName() {
        return this.name;
    }

    getScore() {
        return this.score;
    }

    getBonus() {
        return this.bonus;
    }
}
