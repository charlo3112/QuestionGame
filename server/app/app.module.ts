import { GameController } from '@app/controllers/game/game.controller';
import { QuestionController } from '@app/controllers/question/question.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GameData, gameSchema } from '@app/model/database/game';
import { QuestionData, questionSchema } from '@app/model/database/question';
import { GameService } from '@app/services/game/game.service';
import { QuestionService } from '@app/services/question/question.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './controllers/admin/admin.controller';
import { GameGatewayReceive } from './gateways/game-receive/game-receive.gateway';
import { RoomManagementService } from './services/room-management/room-management.service';
import { GameGatewaySend } from './gateways/game-send/game-send.gateway';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([
            { name: GameData.name, schema: gameSchema },
            { name: QuestionData.name, schema: questionSchema },
        ]),
    ],
    controllers: [GameController, QuestionController, AdminController],
    providers: [RoomManagementService, ChatGateway, GameService, QuestionService, Logger, GameGatewayReceive, GameGatewaySend],
})
export class AppModule {}
