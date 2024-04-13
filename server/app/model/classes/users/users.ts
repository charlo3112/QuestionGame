import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { UserData } from '@app/model/classes/user/user';
import { ChoiceData } from '@app/model/database/choice';
import { BONUS_TIME } from '@common/constants';
import { UserState } from '@common/enums/user-state';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
import { Score } from '@common/interfaces/score';
import { UserStat } from '@common/interfaces/user-stat';

export class Users {
    hostIsPlaying: boolean;
    private users: Map<string, UserData>;
    private activeUsers: Set<string>;
    private bannedNames: string[];
    private gameGateway: GameGatewaySend;

    constructor(gameWebsocket: GameGatewaySend, hostIsPlaying: boolean) {
        this.users = new Map();
        this.activeUsers = new Set();
        this.bannedNames = [];
        this.gameGateway = gameWebsocket;
        this.hostIsPlaying = hostIsPlaying;
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

    get allHaveValidated(): boolean {
        return Array.from(this.users.values()).every((user) => user.validate !== undefined || (user.isHost() && !this.hostIsPlaying));
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
        this.users.forEach((user) => {
            user.resetChoice();
            this.gameGateway.sendUserGameInfo(user.uid, user.userGameInfo);
        });
        this.gameGateway.sendUsersStatUpdate(this.hostId, this.usersStat);
    }

    updateUsersScore(correctAnswers: boolean[], points: number): void {
        const time = new Date().getTime();
        let users = Array.from(this.users.values());
        users.forEach((user) => {
            const state = user.userState;
            if (user.validate === undefined) {
                user.validate = time;
            }
            user.userState = state;
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
        return user.isHost();
    }

    setChat(hostId: string, username: string, value: boolean): string | undefined {
        if (hostId !== this.hostId) {
            return undefined;
        }
        const user = Array.from(this.users.values()).find((u) => u.username === username);
        if (!user) {
            return undefined;
        }
        user.userCanChat = value;
        this.gameGateway.sendUsersStatUpdate(hostId, this.usersStat);
        return user.uid;
    }

    canChat(userId: string): boolean {
        const user = this.users.get(userId);
        if (!user) {
            return false;
        }
        return user.userCanChat;
    }

    userExists(name: string): boolean {
        return Array.from(this.users.values()).some((user) => user.username.toLowerCase() === name.toLowerCase());
    }

    validateChoice(userId: string): void {
        const user = this.users.get(userId);
        if (!user) {
            return;
        }
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
        if (!user) {
            return false;
        }
        return user.validate === undefined ? false : true;
    }

    isHost(userId: string): boolean {
        const user = this.users.get(userId);
        if (!user) {
            return false;
        }
        return user.isHost();
    }

    isBanned(name: string) {
        return this.bannedNames.includes(name.toLowerCase());
    }

    handleChoice(userId: string, choice: boolean[]) {
        const user = this.users.get(userId);
        if (!user || user.validate !== undefined) {
            return;
        }
        user.newChoice = choice;
        this.gameGateway.sendUsersStatUpdate(this.hostId, this.usersStat);
        this.gameGateway.sendUserGameInfo(user.uid, user.userGameInfo);
    }

    handleAnswers(userId: string, answers: QrlAnswer[], points: number) {
        const user = this.users.get(userId);
        this.users.forEach((player) => {
            for (const answer of answers) {
                if (player.username === answer.player) {
                    player.newAnswer = answer;
                    if (answer.grade !== 'Ungraded') {
                        player.addScore(points * answer.grade);
                        this.gameGateway.sendScoreUpdate(player.uid, player.userScore);
                        this.gameGateway.sendQrlGradedAnswer(player.uid, answer);
                    }
                }
            }
        });
        this.gameGateway.sendUsersStatUpdate(this.hostId, this.usersStat);
        this.gameGateway.sendUserGameInfo(user.uid, user.userGameInfo);
    }

    getCurrentHistogramData(choices: ChoiceData[]): number[] {
        const data = [0, 0, 0, 0];
        this.users.forEach((user) => {
            for (let i = 0; i < choices.length; i++) {
                if (!user.userChoice) {
                    break;
                }
                if (user.userChoice[i]) {
                    data[i]++;
                }
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
