import { HOST_NAME } from '@common/constants';
import { UserState } from '@common/enums/user-state';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { Score } from '@common/interfaces/score';
import { UserGameInfo } from '@common/interfaces/user-game-info';

export class UserData {
    private userId: string;
    private name: string;
    private score: number;
    private bonus: number;
    private roomId: string;
    private choice: boolean[] | undefined;
    private answerQrl: QrlAnswer | undefined;
    private timeValidate: number | undefined;
    private isBonus: boolean;
    private state: UserState;
    private canChat: boolean;

    constructor(userId: string, roomId: string, username: string) {
        this.userId = userId;
        this.name = username;
        this.roomId = roomId;
        this.score = 0;
        this.bonus = 0;
        this.choice = undefined;
        this.timeValidate = undefined;
        this.isBonus = false;
        this.state = UserState.NO_INTERACTION;
        this.canChat = true;
    }

    get username() {
        return this.name;
    }

    get userChoice(): boolean[] | undefined {
        return this.choice;
    }

    get validate() {
        return this.timeValidate;
    }

    get userCanChat() {
        return this.canChat;
    }

    get userState() {
        return this.state;
    }

    get uid() {
        return this.userId;
    }
    get userScore() {
        return { score: this.score, bonus: this.isBonus } as Score;
    }

    get userGameInfo() {
        const choice: boolean[] = this.choice === undefined ? [false, false, false, false] : this.choice;
        return { choice, validate: this.validate !== undefined } as UserGameInfo;
    }

    get userBonus() {
        return this.bonus;
    }

    get userRoomId() {
        return this.roomId;
    }

    set uid(uid: string) {
        this.userId = uid;
    }

    set userCanChat(canChat: boolean) {
        this.canChat = canChat;
    }

    set userState(state: UserState) {
        this.state = state;
    }

    set newChoice(choice: boolean[]) {
        this.choice = choice;
        this.state = UserState.FIRST_INTERACTION;
    }

    set newAnswer(answer: QrlAnswer) {
        this.answerQrl = answer;
    }

    set validate(time: number) {
        this.timeValidate = time;
        this.state = UserState.ANSWER_CONFIRMED;
    }

    resetChoice() {
        this.choice = undefined;
        this.timeValidate = undefined;
        this.isBonus = false;
        this.state = UserState.NO_INTERACTION;
    }

    isHost(): boolean {
        return this.name.toLowerCase() === HOST_NAME.toLowerCase();
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
        this.isBonus = true;
        this.addScore(score * bonusMultiplier);
    }

    resetFinalResults() {
        this.state = UserState.FINAL_RESULTS;
    }
}
