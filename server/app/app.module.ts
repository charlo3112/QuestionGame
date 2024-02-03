import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GameController } from './controllers/game/game.controller';
import { QuestionController } from './controllers/question/question.controller';
import { Game, gameSchema } from './model/database/game';
import { Question, questionSchema } from './model/database/question';
import { GameService } from './services/game/game.service';
import { QuestionService } from './services/question/question.service';

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
    controllers: [GameController, QuestionController],
    providers: [ChatGateway, GameService, QuestionService, Logger],
})
export class AppModule {}
