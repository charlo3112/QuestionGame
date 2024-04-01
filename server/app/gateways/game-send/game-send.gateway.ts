import { GameStatePayload } from '@common/interfaces/game-state-payload';
import { HistogramData } from '@common/interfaces/histogram-data';
import { Score } from '@common/interfaces/score';
import { UserStat } from '@common/interfaces/user-stat';
import { UserConnectionUpdate } from '@common/interfaces/user-update';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class GameGatewaySend {
    @WebSocketServer() server: Server;

    updateQuestionsCounter(roomId: string, questionsCounter: number[]) {
        this.server.to(roomId).emit('game:questionsCounter', questionsCounter);
    }

    sendTimeUpdate(roomId: string, time: number): void {
        this.server.to(roomId).emit('game:time', time);
    }

    sendDeleteRoom(roomId: string): void {
        this.server.to(roomId).emit('game:closed', 'La partie a été fermée');
        this.server.socketsLeave(roomId);
    }

    sendUserRemoval(userId: string, message: string): void {
        this.server.to(userId).emit('game:closed', message);
    }

    sendUpdateUser(roomId: string, userUpdate: UserConnectionUpdate): void {
        this.server.to(roomId).emit('game:user-update', userUpdate);
    }

    sendStateUpdate(roomId: string, state: GameStatePayload): void {
        this.server.to(roomId).emit('game:state', state);
    }

    sendScoreUpdate(userId: string, score: Score): void {
        this.server.to(userId).emit('game:score', score);
    }

    sendUsersStatUpdate(userId: string, usersStat: UserStat[]): void {
        this.server.to(userId).emit('game:users-stat', usersStat);
    }

    sendHistogramDataUpdate(roomId: string, histogramData: HistogramData): void {
        this.server.to(roomId).emit('game:histogramData', histogramData);
    }

    sendAlert(roomId: string, message: string): void {
        this.server.to(roomId).emit('game:alert', message);
    }
}
