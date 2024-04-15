import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { UserData } from '@app/model/classes/user/user';
import { ACTIVE_TIME, BONUS_TIME } from '@common/constants';
import { Grade } from '@common/enums/grade';
import { QuestionType } from '@common/enums/question-type';
import { UserState } from '@common/enums/user-state';
import { Choice } from '@common/interfaces/choice';
import { Histogram } from '@common/interfaces/histogram-data';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { Question } from '@common/interfaces/question';
import { Score } from '@common/interfaces/score';
import { UserStat } from '@common/interfaces/user-stat';

export class Users {
    hostIsPlaying: boolean;
    private users: Map<string, UserData>;
    private activeUsers: Set<string>;
    private bannedNames: string[];
    private gameGateway: GameGatewaySend;
    private gradeData$: Grade[];
    private answers: QrlAnswer[];
    private updateHistogram: () => void;

    constructor(gameWebsocket: GameGatewaySend, hostIsPlaying: boolean, updateHistogram: () => void) {
        this.users = new Map();
        this.activeUsers = new Set();
        this.bannedNames = [];
        this.gameGateway = gameWebsocket;
        this.hostIsPlaying = hostIsPlaying;
        this.gradeData$ = [];
        this.answers = [];
        this.updateHistogram = updateHistogram;
    }

    get hostId(): string {
        return Array.from(this.users.values()).find((user) => user.isHost())?.uid;
    }

    get usersStat(): UserStat[] {
        return Array.from(this.users.values())
            .filter((user) => this.hostIsPlaying || !user.isHost())
            .map((user) => {
                return {
                    username: user.username,
                    score: user.userScore.score,
                    bonus: user.userBonus,
                    state: this.activeUsers.has(user.uid) ? user.userState : UserState.DISCONNECT,
                    canChat: user.userCanChat,
                    isActive: user.isActive,
                };
            });
    }

    get usersArray(): string[] {
        return Array.from(this.users.values()).map((user) => user.username);
    }

    get size(): number {
        return this.activeUsers.size;
    }

    get totalSize(): number {
        return this.hostIsPlaying ? this.users.size : this.users.size - 1;
    }

    get totalActiveSize(): number {
        return this.hostIsPlaying ? this.activeUsers.size : this.activeUsers.size - 1;
    }

    get allHaveValidated(): boolean {
        return Array.from(this.users.values())
            .filter((user) => this.activeUsers.has(user.uid))
            .every((user) => user.validate !== undefined || (user.isHost() && !this.hostIsPlaying));
    }

    get bestScore(): number {
        return Math.max(...Array.from(this.users.values()).map((user) => user.userScore.score));
    }

    addUser(user: UserData) {
        this.users.set(user.uid, user);
        this.activeUsers.add(user.uid);
        this.gameGateway.sendUserGameInfo(user.uid, user.userGameInfo);
    }

    banUser(name: string): string {
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

    getQrlAnswers(): QrlAnswer[] {
        const qrlAnswers: QrlAnswer[] = [];
        this.users.forEach((user) => {
            if (user.uid !== this.hostId) {
                qrlAnswers.push({ user: user.username, grade: Grade.Ungraded, text: user.qrlAnswer });
            }
        });
        return qrlAnswers;
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

    resetAnswers(): void {
        this.answers = [];
        this.gradeData$ = this.gradeData$ = [];
        this.users.forEach((user) => {
            user.resetChoice();
            this.gameGateway.sendUserGameInfo(user.uid, user.userGameInfo);
            this.gameGateway.sendQrlAnswer(user.uid, user.qrlAnswer);
        });
        this.gameGateway.sendUsersStatUpdate(this.hostId, this.usersStat);
    }

    updateUsersScore(correctAnswers: boolean[], points: number): void {
        const time = new Date().getTime();
        const users = Array.from(this.users.values())
            .map((user) => {
                const state = user.userState;
                user.validate = user.validate === undefined ? time : user.validate;
                user.userState = state;
                return user;
            })
            .filter((user) => user.goodAnswer(correctAnswers))
            .sort((a, b) => a.validate - b.validate);
        const bonus = !(users.length >= 2 && users[1].validate - users[0].validate <= BONUS_TIME);

        users.forEach((user) => {
            if (users[0] === user && bonus) {
                user.addBonus(points);
            } else {
                user.addScore(points);
            }
            this.gameGateway.sendScoreUpdate(user.uid, user.userScore);
        });
        if (!this.hostIsPlaying) {
            this.gameGateway.sendUsersStatUpdate(this.hostId, this.usersStat);
        }
    }

    update(userId: string, newId: string): boolean {
        const user = this.users.get(userId);
        user.uid = newId;
        this.users.delete(userId);
        this.activeUsers.delete(userId);
        this.users.set(user.uid, user);
        this.activeUsers.add(user.uid);
        this.gameGateway.sendUserGameInfo(user.uid, user.userGameInfo);
        this.gameGateway.sendQrlAnswer(user.uid, user.qrlAnswer);
        const answer = this.answers.find((a) => a.user === user.username);
        if (answer) {
            this.gameGateway.sendQrlGradedAnswer(user.uid, answer.grade);
        }
        return user.isHost();
    }

    setChat(hostId: string, username: string, value: boolean): string | undefined {
        const user = Array.from(this.users.values()).find((u) => u.username === username);
        if (hostId !== this.hostId || !user) {
            return undefined;
        }
        user.userCanChat = value;
        this.gameGateway.sendUsersStatUpdate(hostId, this.usersStat);
        return user.uid;
    }

    canChat(userId: string): boolean {
        const user = this.users.get(userId);
        return user ? user.userCanChat : false;
    }

    userExists(name: string): boolean {
        return Array.from(this.users.values()).some((user) => user.username.toLowerCase() === name.toLowerCase());
    }

    handleTestAnswer(points: number) {
        this.users.forEach((user) => {
            user.addScore(points);
            this.gameGateway.sendScoreUpdate(user.uid, user.userScore);
        });
    }

    validateChoice(userId: string): void {
        const user = this.users.get(userId);
        if (!user) return;
        user.validate = new Date().getTime();
        this.gameGateway.sendUsersStatUpdate(this.hostId, this.usersStat);
        this.gameGateway.sendUserGameInfo(user.uid, user.userGameInfo);
    }

    removeActiveUser(userId: string) {
        this.activeUsers.delete(userId);
    }

    removeUser(userId: string) {
        this.users.delete(userId);
        this.activeUsers.delete(userId);
    }

    isValidate(userId: string): boolean {
        const user = this.users.get(userId);
        return user ? user.validate !== undefined : false;
    }

    isHost(userId: string): boolean {
        const user = this.users.get(userId);
        return user ? user.isHost() : false;
    }

    isBanned(name: string) {
        return this.bannedNames.includes(name.toLowerCase());
    }

    handleChoice(userId: string, choice: boolean[]) {
        const user = this.users.get(userId);
        if (!user || user.validate !== undefined) return;
        user.newChoice = choice;
        this.gameGateway.sendUsersStatUpdate(this.hostId, this.usersStat);
        this.gameGateway.sendUserGameInfo(user.uid, user.userGameInfo);
    }

    handleAnswers(answers: QrlAnswer[], points: number) {
        this.answers = answers;
        this.users.forEach((user) => {
            for (const answer of answers) {
                if (user.username === answer.user && answer.grade !== Grade.Ungraded) {
                    user.addScore(points * answer.grade);
                    this.gameGateway.sendScoreUpdate(user.uid, user.userScore);
                    this.gameGateway.sendQrlGradedAnswer(user.uid, answer.grade);
                    this.gradeData$.push(answer.grade);
                }
            }
        });
        this.updateHistogram();
        this.gameGateway.sendUsersStatUpdate(this.hostId, this.usersStat);
    }

    handleAnswer(uid: string, answer: string) {
        const user = this.users.get(uid);
        if (!user || user.validate !== undefined) return;
        user.newAnswer = answer;
        if (user.timeout) {
            clearTimeout(user.timeout);
        }
        user.isActive = true;
        user.timeout = setTimeout(() => {
            user.isActive = false;
            this.gameGateway.sendUsersStatUpdate(this.hostId, this.usersStat);
            this.updateHistogram();
        }, ACTIVE_TIME);
    }

    getCurrentHistogramData(question: Question): Histogram {
        if (question.type === QuestionType.QCM) {
            return {
                type: question.type,
                choicesCounters: this.getQcmData(question.choices),
            };
        } else {
            return {
                type: question.type,
                active: this.getQrlActive(),
                inactive: this.totalActiveSize - this.getQrlActive(),
                grades: this.gradeData$,
            };
        }
    }

    getQrlActive(): number {
        let active = 0;
        this.users.forEach((user) => {
            if (user.isActive) {
                active++;
            }
        });
        return active;
    }

    getQcmData(choices: Choice[]): number[] {
        const data = [0, 0, 0, 0];
        this.users.forEach((user) => {
            for (let i = 0; i < choices.length; i++) {
                if (!user.userChoice) break;
                if (user.userChoice[i]) data[i]++;
            }
        });
        return data;
    }

    resetFinalResults() {
        this.users.forEach((user) => {
            user.resetFinalResults();
            this.gameGateway.sendUserGameInfo(user.uid, user.userGameInfo);
        });
    }
}
