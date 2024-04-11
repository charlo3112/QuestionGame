import { GameState } from '@common/enums/game-state';
import { WebsocketMessage } from '@common/enums/websocket-message';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HISTOGRAM_DATA } from '@common/interfaces/histogram-data';
import { Score } from '@common/interfaces/score';
import { TIME_DATA } from '@common/interfaces/time-data';
import { USER_GAME_INFO } from '@common/interfaces/user-game-info';
import { UserStat } from '@common/interfaces/user-stat';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server } from 'socket.io';
import { GameGatewaySend } from './game-send.gateway';

describe('GameGatewaySend', () => {
    let gateway: GameGatewaySend;
    let mockServer: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        mockServer = createStubInstance<Server>(Server);
        mockServer.to.returnsThis();
        mockServer.emit.returnsThis();
        jest.spyOn(mockServer, 'to');
        jest.spyOn(mockServer, 'emit');
        jest.spyOn(mockServer, 'socketsLeave');

        const module: TestingModule = await Test.createTestingModule({
            providers: [GameGatewaySend],
        })
            .overrideProvider(Server)
            .useValue(mockServer)
            .compile();

        gateway = module.get<GameGatewaySend>(GameGatewaySend);
        gateway.server = mockServer;
    });

    it('updateQuestionsCounter should emit questionsCounter update', () => {
        const roomId = 'testRoom';
        const questionsCounter = [1, 2, 3];
        gateway.updateQuestionsCounter(roomId, questionsCounter);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith(WebsocketMessage.QuestionsCounter, questionsCounter);
    });

    it('sendTimeUpdate should emit time update', () => {
        const roomId = 'testRoom';
        const time = TIME_DATA;
        gateway.sendTimeUpdate(roomId, time);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith(WebsocketMessage.Time, time);
    });

    it('sendDeleteRoom should emit room closure and leave room', () => {
        const roomId = 'testRoom';
        gateway.sendDeleteRoom(roomId);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith(WebsocketMessage.Closed, 'La partie a été fermée');
        expect(mockServer.socketsLeave).toHaveBeenCalledWith(roomId);
    });

    it('sendUserRemoval should emit user removal', () => {
        const userId = 'testUser';
        const message = 'User removed';
        gateway.sendUserRemoval(userId, message);
        expect(mockServer.to).toHaveBeenCalledWith(userId);
        expect(mockServer.emit).toHaveBeenCalledWith(WebsocketMessage.Closed, message);
    });

    it('sendUpdateUser should emit user update', () => {
        const roomId = 'testRoom';
        const userUpdate = { username: 'testUser', isConnected: true } as UserConnectionUpdate;
        gateway.sendUpdateUser(roomId, userUpdate);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith(WebsocketMessage.UserUpdate, userUpdate);
    });

    it('sendStateUpdate should emit state update', () => {
        const roomId = 'testRoom';
        const state = { state: GameState.AskingQuestion } as GameStatePayload;
        gateway.sendStateUpdate(roomId, state);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith(WebsocketMessage.State, state);
    });

    it('sendScoreUpdate should emit score update', () => {
        const userId = 'testUser';
        const score = { score: 10 } as Score;
        gateway.sendScoreUpdate(userId, score);
        expect(mockServer.to).toHaveBeenCalledWith(userId);
        expect(mockServer.emit).toHaveBeenCalledWith(WebsocketMessage.Score, score);
    });

    it('sendUsersStatUpdate should emit users stat update', () => {
        const userId = 'testUser';
        const usersStat = [] as UserStat[];
        gateway.sendUsersStatUpdate(userId, usersStat);
        expect(mockServer.to).toHaveBeenCalledWith(userId);
        expect(mockServer.emit).toHaveBeenCalledWith(WebsocketMessage.UsersStat, usersStat);
    });

    it('sendHistogramDataUpdate should emit histogram data update', () => {
        const roomId = 'testRoom';
        const histogramData = HISTOGRAM_DATA;
        gateway.sendHistogramDataUpdate(roomId, histogramData);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith(WebsocketMessage.HistogramData, histogramData);
    });

    it('sendAlert should emit an alert message', () => {
        const roomId = 'testRoom';
        const message = 'Test Alert';
        gateway.sendAlert(roomId, message);
        expect(mockServer.to).toHaveBeenCalledWith(roomId);
        expect(mockServer.emit).toHaveBeenCalledWith(WebsocketMessage.Alert, message);
    });

    it('sendUserGameInfo should emit user game info', () => {
        const userId = 'testUser';
        const userGameInfo = USER_GAME_INFO;
        gateway.sendUserGameInfo(userId, userGameInfo);
        expect(mockServer.to).toHaveBeenCalledWith(userId);
        expect(mockServer.emit).toHaveBeenCalledWith(WebsocketMessage.UserGameInfo, userGameInfo);
    });
});
