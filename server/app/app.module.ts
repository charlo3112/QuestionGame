import { GameController } from '@app/controllers/game/game.controller';
import { QuestionController } from '@app/controllers/question/question.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Game, gameSchema } from '@app/model/database/game';
import { Question, questionSchema } from '@app/model/database/question';
import { GameService } from '@app/services/game/game.service';
import { QuestionService } from '@app/services/question/question.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './controllers/admin/admin.controller';
import { GameGateway } from './gateways/game/game.gateway';
import { RoomManagementService } from './services/room-management/room-management.service';

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
            { name: Game.name, schema: gameSchema },
            { name: Question.name, schema: questionSchema },
        ]),
    ],
    controllers: [GameController, QuestionController, AdminController],
    providers: [RoomManagementService, ChatGateway, GameService, QuestionService, Logger, GameGateway],
})
export class AppModule {}
