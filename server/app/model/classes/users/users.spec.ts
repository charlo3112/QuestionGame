import { GameGatewaySend } from '@app/gateways/game-send/game-send.gateway';
import { UserData } from '@app/model/classes/user/user';
import { ChoiceData } from '@app/model/database/choice';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Users } from './users';

describe('Users', () => {
    let users: Users;
    let mockGameGateway: SinonStubbedInstance<GameGatewaySend>;
    let mockHostIsPlaying: boolean;
    let user: UserData;

    beforeEach(() => {
        user = new UserData('123', 'Room123', 'John');
        mockGameGateway = createStubInstance(GameGatewaySend);
        mockHostIsPlaying = false;

        users = new Users(mockGameGateway, mockHostIsPlaying);
    });

    it('should add a user', () => {
        users.addUser(user);
        expect(users.size).toBe(1);
        expect(users.getUser('123')).toEqual(user);
    });

    it('should ban a user', () => {
        users.addUser(user);
        const bannedUserId = users.banUser('John');
        expect(users.size).toBe(0);
        expect(users.isBanned('John')).toBe(true);
        expect(users.getUser(bannedUserId)).toBeUndefined();
    });

    it('should validate a user choice', () => {
        users.addUser(user);
        users.validateChoice('123');
        expect(users.isValidate('123')).toBe(true);
    });

    it('should get the user choice', () => {
        users.addUser(user);
        users.handleChoice('123', [true, false, true, false]);
        expect(users.getChoice('123')).toEqual([true, false, true, false]);
    });

    it('should remove an active user', () => {
        users.addUser(user);
        users.removeActiveUser('123');
        expect(users.size).toBe(0);
    });

    it('should remove a user', () => {
        users.addUser(user);
        users.removeUser('123');
        expect(users.size).toBe(0);
    });

    it('should check if the user is banned', () => {
        users.addUser(user);
        expect(users.isBanned('John')).toBe(false);
    });

    it('canChat should return true if the user is not banned', () => {
        users.addUser(user);
        expect(users.canChat('123')).toBe(true);
    });

    it('canChat should return false if the user is banned', () => {
        users.addUser(user);
        users.banUser('John');
        expect(users.canChat('123')).toBe(false);
    });

    it('getChoices() should return the uses answers', () => {
        users.addUser(user);
        users.handleChoice('123', [true, false, true, false]);
        users.resetFinalResults();
        expect(users.getChoice('123')).toEqual([true, false, true, false]);
    });

    it('should reset final results', () => {
        users.addUser(user);
        users.handleChoice('123', [true, false, true, false]);
        users.resetAnswers();
        expect(users.getChoice('123')).toEqual([false, false, false, false]);
    });

    it('should return the correct user statistics', () => {
        const TEST_SCORE = 100;
        const user1 = new UserData('123', 'Room123', 'John');
        const user2 = new UserData('456', 'Room123', 'Alice');
        user1['score'] = TEST_SCORE;
        user1.userCanChat = true;
        user2.userCanChat = false;
        users.addUser(user1);
        users.addUser(user2);

        users.hostIsPlaying = true;

        const usersStat = users.usersStat;

        expect(usersStat).toHaveLength(2);
        expect(usersStat[0].username).toBe('John');
        expect(usersStat[0].score).toBe(TEST_SCORE);
        expect(usersStat[0].bonus).toBeFalsy();
        expect(usersStat[0].canChat).toBe(true);
    });

    it('setChat() should return undefined if no user is found', () => {
        users.addUser(user);
        const result = users.setChat(users.hostId, 'Albert', false);
        expect(result).toBeUndefined();
    });
    it('setChat() should update chat setting and return user ID if user is found', () => {
        users.addUser(user);
        const result = users.setChat(users.hostId, 'John', false);
        expect(result).toBe(user.uid);
        const updatedUser = users.getUser(user.uid);
        expect(updatedUser.userCanChat).toBe(false);
    });

    it('totalSize() should return the number of users', () => {
        users.addUser(user);
        users.hostIsPlaying = true;
        expect(users.totalSize).toBe(1);
    });

    it('bestScore() should return the highest score', () => {
        const BEST_SCORE = 200;
        const WORST_SCORE = 100;
        const user1 = new UserData('123', 'Room123', 'John');
        const user2 = new UserData('456', 'Room123', 'Alice');
        user1['score'] = BEST_SCORE;
        user2['score'] = WORST_SCORE;
        users.addUser(user1);
        users.addUser(user2);
        expect(users.bestScore).toBe(BEST_SCORE);
    });

    it('updateUsersScore() should update the users score', () => {
        const correctAnswers = [true, true, false, false];
        const points = 100;
        users.addUser(user);
        user.goodAnswer = jest.fn().mockReturnValue(true);
        users.updateUsersScore(correctAnswers, points);
        expect(users.getScore('123')).toEqual({ score: 120, bonus: true });
    });

    it('updateUsersScore() should not add bonus if user was not first to answer', () => {
        const correctAnswers = [true, true, false, false];
        const points = 100;
        const user2 = new UserData('456', 'Room123', 'Alice');
        users.addUser(user);
        users.addUser(user2);
        user.goodAnswer = jest.fn().mockReturnValue(true);
        user2.goodAnswer = jest.fn().mockReturnValue(true);
        users.updateUsersScore(correctAnswers, points);
        expect(users.getScore('456')).toEqual({ score: points, bonus: false });
    });

    it('getCurrentHistogramData should add data if user made a choice', () => {
        const choice = [true, false, true, false];
        const choiceDataArray = choice.map((isCorrect, index) => {
            const text = `Option ${index + 1}`;
            return new ChoiceData({ isCorrect, text });
        });
        users.addUser(user);
        users.handleChoice('123', choice);
        const histogramData = users.getCurrentHistogramData(choiceDataArray);
        expect(histogramData).toEqual([1, 0, 1, 0]);
    });

    // it('handleAnswers() should update the user score', () => {
    //     const correctAnswers = [true, true, false, false];
    //     const points = 100;
    //     users.addUser(user);
    //     user.goodAnswer = jest.fn().mockReturnValue(true);
    //     users.handleAnswers('123', correctAnswers, points);
    //     expect(users.getScore('123')).toEqual({ score: 120, bonus: true });
    // });
});
