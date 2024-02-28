import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RoomManagementService {
    constructor(private readonly logger: Logger) {}
    // private roomMembers: Map<string, Set<string>> = new Map();
    // private joinGatewayCallback: ((uid: string, roomID: string) => void)[] = [];
    // private leaveGatewayCallback: ((uid: string, roomID: string) => void)[] = [];
    // setGatewayCallback(join: (uid: string, roomID: string) => void, leave: (uid: string, roomID: string) => void) {
    //     this.joinGatewayCallback.push(join);
    //     this.leaveGatewayCallback.push(leave);
    // }
    // joinRoom(userId: string, roomId: string) {
    //     if (!this.roomMembers.has(roomId)) {
    //         this.roomMembers.set(roomId, new Set());
    //     }
    //     this.roomMembers.get(roomId).add(userId);
    //     this.joinGatewayCallback.forEach((callback) => callback(userId, roomId));
    // }
    // leaveRoom(userId: string, roomId: string) {
    //     if (this.roomMembers.has(roomId)) {
    //         this.roomMembers.get(roomId).delete(userId);
    //         if (this.roomMembers.get(roomId).size === 0) {
    //             this.roomMembers.delete(roomId);
    //         }
    //     }
    //     this.leaveGatewayCallback.forEach((callback) => callback(userId, roomId));
    // }

    removeRoom(roomId: string) {
        this.logger.log(`Room ${roomId} removed`);
    }
}
