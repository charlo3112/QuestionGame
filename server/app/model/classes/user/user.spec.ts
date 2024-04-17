import { UserData } from './user';

describe('UserData', () => {
    let userData: UserData;
    const userId = 'user1';
    const roomId = 'room123';
    const username = 'John Doe';
    const SCORE = 100;
    const BONUS_SCORE = 120;

    beforeEach(() => {
        userData = new UserData(userId, roomId, username);
    });

    it('should be defined', () => {
        expect(userData).toBeDefined();
    });

    it('get roomId should return the room id', () => {
        expect(userData.userRoomId).toBe(roomId);
    });

    it('set newChoice should modify the choices', () => {
        const mockChoices = [true, true, false, false];
        userData.newChoice = mockChoices;
        expect(userData.userChoice).toBe(mockChoices);
    });

    it('resetChoice should reset the choices', () => {
        userData.resetChoice();
        expect(userData.userChoice).toBeUndefined();
        expect(userData.userBonus).toBeFalsy();
        expect(userData.validate).toBeUndefined();
    });

    it('goodAnswer should return true if the choices are correct', () => {
        const mockAnswer = [false, true, true, true];
        const mockChoices = mockAnswer;
        userData.newChoice = mockChoices;
        expect(userData.goodAnswer(mockAnswer)).toBeTruthy();
    });

    it('goodAnswer should return flase if the choices are not correct', () => {
        const mockAnswer = [false, true, true, true];
        const mockChoices = [false, true, true, false];
        userData.newChoice = mockChoices;
        expect(userData.goodAnswer(mockAnswer)).toBeFalsy();
    });

    it('goodAnswer should return false if the choices are undefined', () => {
        userData.resetChoice();
        const mockAnswer = [false, true, true];
        expect(userData.goodAnswer(mockAnswer)).toBeFalsy();
    });

    it('goodAnswer should return false if the choices lenght is smaller than  the asnwer', () => {
        const mockAnswer = [false, true, true, true];
        const mockChoices = [false, true];
        userData.newChoice = mockChoices;
        expect(userData.goodAnswer(mockAnswer)).toBeFalsy();
    });

    it('addBonus should modify the score', () => {
        userData.addBonus(SCORE);
        expect(userData.userScore.score).toBe(BONUS_SCORE);
    });

    it('userCanChat should set the chat permission', () => {
        userData.userCanChat = false;
        expect(userData.userCanChat).toBeFalsy();
    });

    it('userState should set the user state', () => {
        userData.userState = 1;
        expect(userData.userState).toBe(1);
    });

    it('newAnswer should set the new answer', () => {
        const mockText = 'Test';
        userData.newAnswer = mockText;
        expect(userData['answerQrl']).toBe(mockText);
    });
});
