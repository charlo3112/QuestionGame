export class User {
    private userId: string;
    private name: string;
    private score: number;
    private bonus: number;
    private roomId: string;

    constructor(userId: string, roomId: string, username: string) {
        this.userId = userId;
        this.name = username;
        this.roomId = roomId;
        this.score = 0;
        this.bonus = 0;
    }

    get username() {
        return this.name;
    }

    isHost(): boolean {
        return this.name === 'organisateur';
    }

    addScore(score: number) {
        this.score += score;
    }

    addBonus(score: number) {
        const bonusMultiplier = 1.2;
        ++this.bonus;
        this.addScore(score * bonusMultiplier);
    }

    getUserId() {
        return this.userId;
    }

    getScore() {
        return this.score;
    }

    getBonus() {
        return this.bonus;
    }

    getRoomId() {
        return this.roomId;
    }
}
