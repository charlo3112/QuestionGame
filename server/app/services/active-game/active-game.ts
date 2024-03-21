import { GameGateway } from '@app/gateways/game/game.gateway';
import { CountDownTimer } from '@app/model/classes/time/time';
import { UserData } from '@app/model/classes/user/user';
import { GameData } from '@app/model/database/game';
import { BONUS_TIME, TIME_CONFIRM_S, WAITING_TIME_S } from '@common/constants';
import { GameState } from '@common/enums/game-state';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { Question } from '@common/interfaces/question';
import { Score } from '@common/interfaces/score';
import { UserStat } from '@common/interfaces/user-stat';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class ActiveGame {
    isLocked: boolean;
    private game: GameData;
    private users: Map<string, UserData>;
    private state: GameState = GameState.Wait;
    private bannedNames: string[];
    private activeUsers: Set<string>;
    private roomId: string;
    private questionIndex: number = 0;
    private histogramData: HistogramData;

    constructor(
        private readonly timer: CountDownTimer,
        private readonly gameGateway: GameGateway,
    ) {
        this.users = new Map<string, UserData>();
        this.activeUsers = new Set<string>();
        this.isLocked = false;
        this.state = GameState.Wait;
        this.bannedNames = [];
        this.histogramData = {
            choicesCounters: Array.from({ length: this.game.questions.length }, () => [0, 0, 0, 0]),
            question: this.game.questions,
            indexCurrentQuestion: 0,
        };
    }

    get currentQuestionWithAnswer(): Question {
        return {
            ...this.game.questions[this.questionIndex],
        };
    }

    get currentQuestionWithoutAnswer(): Question {
        const data: Question = {
            ...this.game.questions[this.questionIndex],
        };
        return {
            type: data.type,
            text: data.text,
            points: data.points,
            choices: data.choices.map((choice) => {
                return {
                    text: choice.text,
                    isCorrect: false,
                };
            }),
        };
    }

    get currentState() {
        return this.state;
    }

    get gameData() {
        return this.game;
    }

    get gameStatePayload(): GameStatePayload {
        if (this.state === GameState.Starting) {
            return { state: this.state, payload: this.game.title };
        }
        if (this.state === GameState.AskingQuestion) {
            return { state: this.state, payload: this.currentQuestionWithoutAnswer };
        }
        if (this.state === GameState.ShowResults || this.state === GameState.LastQuestion) {
            return { state: this.state, payload: this.currentQuestionWithAnswer };
        }
        return { state: this.state };
    }

    get histoData() {
        return this.histogramData;
    }

    get hostId() {
        return Array.from(this.users.values()).find((user) => user.isHost())?.uid;
    }

    get questionIndexCurrent() {
        return this.questionIndex;
    }

    get usersStat(): UserStat[] {
        return Array.from(this.users.values())
            .filter((user) => !user.isHost())
            .map((user) => {
                return {
                    username: user.username,
                    score: user.userScore.score,
                    bonus: user.userBonus,
                    isConnected: this.activeUsers.has(user.uid),
                };
            })
            .sort((a, b) => {
                if (a.score === b.score) {
                    return a.username.localeCompare(b.username);
                }
                return b.score - a.score;
            });
    }

    set(game: GameData, roomId: string) {
        this.game = game;
        this.roomId = roomId;
        this.timer.setRoomId(roomId);
    }

    addUser(user: UserData) {
        this.users.set(user.uid, user);
        this.activeUsers.add(user.uid);
    }

    banUser(name: string): string {
        if (this.currentState !== GameState.Wait) {
            return undefined;
        }
        this.bannedNames.push(name.toLowerCase());
        const userId = Array.from(this.users.values()).find((user) => user.username === name)?.uid;
        this.users.delete(userId);
        this.activeUsers.delete(userId);
        return userId;
    }

    canRejoin(userId: string): boolean {
        return this.activeUsers.has(userId);
    }

    getChoice(userId: string): boolean[] {
        const user = this.users.get(userId);
        if (!user) {
            return [false, false, false, false];
        }
        return user.userChoice === undefined ? [false, false, false, false] : user.userChoice;
    }

    getScore(userId: string): Score {
        const user = this.users.get(userId);
        if (!user) {
            return { score: 0, bonus: false };
        }
        return user.userScore;
    }

    getUser(userId: string): UserData {
        return this.users.get(userId);
    }

    getUsers(): string[] {
        return Array.from(this.users.values()).map((user) => user.username);
    }

    handleChoice(userId: string, choice: boolean[]) {
        const user = this.users.get(userId);
        if (!user || user.validate !== undefined || this.state !== GameState.AskingQuestion) {
            return;
        }
        user.newChoice = choice;
        this.sendUserSelectedChoice();
    }

    isBanned(name: string) {
        return this.bannedNames.includes(name.toLowerCase());
    }

    isHost(userId: string): boolean {
        const user = this.users.get(userId);
        if (!user) {
            return false;
        }
        return user.isHost();
    }

    isValidate(userId: string): boolean {
        const user = this.users.get(userId);
        if (!user) {
            return false;
        }
        return user.validate === undefined ? false : true;
    }

    needToClosed(): boolean {
        return this.activeUsers.size === 0 || (this.activeUsers.size === 1 && this.roomId.slice(0, 'test'.length) !== 'test');
    }

    removeUser(userId: string) {
        this.activeUsers.delete(userId);
        if (this.state === GameState.Wait) {
            this.users.delete(userId);
        }
        this.gameGateway.sendUsersStatUpdate(this.hostId, this.usersStat);
    }

    sendUserSelectedChoice() {
        this.histogramData.choicesCounters[this.questionIndex] = [0, 0, 0, 0];
        this.users.forEach((user) => {
            for (let i = 0; i < this.game.questions[this.questionIndex].choices.length; i++) {
                if (!user.userChoice) {
                    break;
                }
                if (user.userChoice[i]) {
                    this.histogramData.choicesCounters[this.questionIndex][i]++;
                }
            }
        });
        this.gameGateway.sendHistogramDataUpdate(this.hostId, this.histogramData);
    }

    showFinalResults() {
        this.advanceState(GameState.ShowFinalResults);
        this.gameGateway.sendUsersStatUpdate(this.roomId, this.usersStat);
        this.gameGateway.sendHistogramDataUpdate(this.roomId, this.histogramData);
    }

    update(userId: string, newId: string) {
        const user = this.users.get(userId);
        user.uid = newId;
        this.users.delete(userId);
        this.activeUsers.delete(userId);
        this.users.set(user.uid, user);
        this.activeUsers.add(user.uid);
        if (user.isHost() || this.currentState === GameState.ShowFinalResults) {
            this.gameGateway.sendUsersStatUpdate(this.roomId, this.usersStat);
            this.gameGateway.sendHistogramDataUpdate(this.roomId, this.histogramData);
        }
    }

    userExists(name: string) {
        return Array.from(this.users.values()).some((user) => user.username.toLowerCase() === name.toLowerCase());
    }

    validateChoice(userId: string) {
        const user = this.users.get(userId);
        if (!user) {
            return;
        }
        user.validate = new Date().getTime();
    }
    async advance() {
        switch (this.state) {
            case GameState.Wait:
                if (!this.isLocked) {
                    return null;
                }
                await this.launchGame();
                break;
            case GameState.ShowResults:
                if (this.questionIndex < this.game.questions.length) {
                    await this.timer.start(TIME_CONFIRM_S);
                    await this.askQuestion();
                } else {
                    this.advanceState(GameState.GameOver);
                }
                break;
            default:
                break;
        }
    }
    async askQuestion() {
        this.histogramData.indexCurrentQuestion = this.questionIndex;
        this.gameGateway.sendHistogramDataUpdate(this.hostId, this.histogramData);
        this.resetAnswers();
        this.advanceState(GameState.AskingQuestion);
        await this.timer.start(this.game.duration);

        this.calculateScores();
        this.advanceState(GameState.ShowResults);
        if (++this.questionIndex === this.game.questions.length) this.advanceState(GameState.LastQuestion);
    }
    async launchGame() {
        this.advanceState(GameState.Starting);
        await this.timer.start(WAITING_TIME_S);
        await this.askQuestion();
    }
    async testGame() {
        this.advanceState(GameState.Starting);
        while (this.questionIndex < this.game.questions.length) {
            await this.askQuestion();
            await this.timer.start(TIME_CONFIRM_S);
        }
    }
    private advanceState(state: GameState) {
        this.state = state;
        this.gameGateway.sendStateUpdate(this.roomId, this.gameStatePayload);
    }
    private calculateScores() {
        const correctAnswers = this.game.questions[this.questionIndex].choices.map((choice) => choice.isCorrect);
        const time = new Date().getTime();
        let users = Array.from(this.users.values());
        users.forEach((user) => {
            if (user.validate === undefined) {
                user.validate = time;
            }
        });
        users = users.filter((user) => user.goodAnswer(correctAnswers)).sort((a, b) => a.validate - b.validate);
        let bonus = true;
        if (users.length >= 2) {
            if (users[1].validate - users[0].validate <= BONUS_TIME) {
                bonus = false;
            }
        }

        users.forEach((user) => {
            if (users[0] === user && bonus) {
                user.addBonus(this.game.questions[this.questionIndex].points);
            } else {
                user.addScore(this.game.questions[this.questionIndex].points);
            }
            this.gameGateway.sendScoreUpdate(user.uid, user.userScore);
        });
        this.gameGateway.sendUsersStatUpdate(this.hostId, this.usersStat);
    }
    private resetAnswers() {
        this.users.forEach((user) => {
            user.resetChoice();
        });
    }
}
