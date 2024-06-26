import { Grade } from '@common/enums/grade';
import { WebsocketMessage } from '@common/enums/websocket-message';
import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { QrlAnswer } from '@common/interfaces/qrl-answer';
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
        this.server.to(roomId).emit(WebsocketMessage.QUESTION_COUNTER, questionsCounter);
    }

    sendTimeUpdate(roomId: string, time: TimeData): void {
        this.server.to(roomId).emit(WebsocketMessage.TIME, time);
    }

    sendDeleteRoom(roomId: string): void {
        this.server.to(roomId).emit(WebsocketMessage.CLOSED, 'La partie a été fermée');
        this.server.socketsLeave(roomId);
    }

    sendUserRemoval(userId: string, message: string): void {
        this.server.to(userId).emit(WebsocketMessage.CLOSED, message);
    }

    sendUpdateUser(roomId: string, userUpdate: UserConnectionUpdate): void {
        this.server.to(roomId).emit(WebsocketMessage.USER_UPDATE, userUpdate);
    }

    sendStateUpdate(roomId: string, state: GameStatePayload): void {
        this.server.to(roomId).emit(WebsocketMessage.STATE, state);
    }

    sendScoreUpdate(userId: string, score: Score): void {
        this.server.to(userId).emit(WebsocketMessage.SCORE, score);
    }

    sendUsersStatUpdate(userId: string, usersStat: UserStat[]): void {
        this.server.to(userId).emit(WebsocketMessage.USER_STAT, usersStat);
    }

    sendQrlResultData(roomId: string, qrlResultData: QrlAnswer[]): void {
        this.server.to(roomId).emit(WebsocketMessage.QRL_RESULT_DATA, qrlResultData);
    }

    sendQrlGradedAnswer(userId: string, qrlAnswer: Grade): void {
        this.server.to(userId).emit(WebsocketMessage.QRL_GRADED_ANSWER, qrlAnswer);
    }

    sendQrlAnswer(userId: string, qrlAnswer: string): void {
        this.server.to(userId).emit(WebsocketMessage.QRL_ANSWER, qrlAnswer);
    }

    sendHistogramDataUpdate(roomId: string, histogramData: HistogramData): void {
        this.server.to(roomId).emit(WebsocketMessage.HISTOGRAM_DATA, histogramData);
    }

    sendAlert(roomId: string, message: string): void {
        this.server.to(roomId).emit(WebsocketMessage.ALERT, message);
    }

    sendUserGameInfo(userId: string, userGameInfo: UserGameInfo): void {
        this.server.to(userId).emit(WebsocketMessage.USER_GAME_INFO, userGameInfo);
    }
}
