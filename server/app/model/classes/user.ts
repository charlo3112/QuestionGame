export class UserData {
    private userId: string;
    private name: string;
    private score: number;
    private bonus: number;
    private roomId: string;
    private choice: boolean[] | undefined;
    private timeValidate: number | undefined;

    constructor(userId: string, roomId: string, username: string) {
        this.userId = userId;
        this.name = username;
        this.roomId = roomId;
        this.score = 0;
        this.bonus = 0;
        this.choice = undefined;
        this.timeValidate = undefined;
    }

    get username() {
        return this.name;
    }

    get userChoice() {
        return this.choice;
    }

    get validate() {
        return this.timeValidate;
    }

    get uid() {
        return this.userId;
    }

    get userScore() {
        return this.score;
    }

    get userBonus() {
        return this.bonus;
    }

    get userRoomId() {
        return this.roomId;
    }

    set newChoice(choice: boolean[]) {
        this.choice = choice;
    }

    set validate(time: number) {
        this.timeValidate = time;
    }

    resetChoice() {
        this.choice = undefined;
        this.timeValidate = undefined;
    }

    isHost(): boolean {
        return this.name.toLowerCase() === 'organisateur';
    }

    goodAnswer(answer: boolean[]): boolean {
        if (this.choice === undefined) {
            return false;
        }
        if (answer.length > this.choice.length) {
            return false;
        }
        this.choice.slice(0, answer.length);

        for (let i = 0; i < answer.length; i++) {
            if (answer[i] !== this.choice[i]) {
                return false;
            }
        }
        return true;
    }

    addScore(score: number) {
        this.score += score;
    }

    addBonus(score: number) {
        const bonusMultiplier = 1.2;
        ++this.bonus;
        this.addScore(score * bonusMultiplier);
    }
}
