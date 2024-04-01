import { AdminController } from '@app/controllers/admin/admin.controller';
import { GameController } from '@app/controllers/game/game.controller';
import { HistoryController } from '@app/controllers/history/history.controller';
import { QuestionController } from '@app/controllers/question/question.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GameGateway } from '@app/gateways/game/game.gateway';
import { GameData, gameSchema } from '@app/model/database/game';
import { HistoryData, historySchema } from '@app/model/database/history';
import { QuestionData, questionSchema } from '@app/model/database/question';
import { GameService } from '@app/services/game/game.service';
import { HistoryService } from '@app/services/history/history.service';
import { QuestionService } from '@app/services/question/question.service';
import { RoomManagementService } from '@app/services/room-management/room-management.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

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
            { name: HistoryData.name, schema: historySchema },
        ]),
    ],
    controllers: [GameController, QuestionController, AdminController, HistoryController],
    providers: [RoomManagementService, ChatGateway, GameService, QuestionService, Logger, GameGateway, HistoryService],
})
export class AppModule {}
