import { WebsocketMessage } from '@common/enums/websocket-message';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { Score } from '@common/interfaces/score';
import { TimeData } from '@common/interfaces/time-data';
import { UserGameInfo } from '@common/interfaces/user-game-info';
import { UserStat } from '@common/interfaces/user-stat';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class GameGatewaySend {
    @WebSocketServer() server: Server;

    updateQuestionsCounter(roomId: string, questionsCounter: number[]) {
        this.server.to(roomId).emit(WebsocketMessage.QuestionsCounter, questionsCounter);
    }

    sendTimeUpdate(roomId: string, time: TimeData): void {
        this.server.to(roomId).emit(WebsocketMessage.Time, time);
    }

    sendDeleteRoom(roomId: string): void {
        this.server.to(roomId).emit(WebsocketMessage.Closed, 'La partie a été fermée');
        this.server.socketsLeave(roomId);
    }

    sendUserRemoval(userId: string, message: string): void {
        this.server.to(userId).emit(WebsocketMessage.Closed, message);
    }

    sendUpdateUser(roomId: string, userUpdate: UserConnectionUpdate): void {
        this.server.to(roomId).emit(WebsocketMessage.UserUpdate, userUpdate);
    }

    sendStateUpdate(roomId: string, state: GameStatePayload): void {
        this.server.to(roomId).emit(WebsocketMessage.State, state);
    }

    sendScoreUpdate(userId: string, score: Score): void {
        this.server.to(userId).emit(WebsocketMessage.Score, score);
    }

    sendUsersStatUpdate(userId: string, usersStat: UserStat[]): void {
        this.server.to(userId).emit(WebsocketMessage.UsersStat, usersStat);
    }

    sendHistogramDataUpdate(roomId: string, histogramData: HistogramData): void {
        this.server.to(roomId).emit(WebsocketMessage.HistogramData, histogramData);
    }

    sendAlert(roomId: string, message: string): void {
        this.server.to(roomId).emit(WebsocketMessage.Alert, message);
    }

    sendUserGameInfo(userId: string, userGameInfo: UserGameInfo): void {
        this.server.to(userId).emit(WebsocketMessage.UserGameInfo, userGameInfo);
    }
}
