import { GameController } from '@app/controllers/game/game.controller';
import { QuestionController } from '@app/controllers/question/question.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GameService } from '@app/services/game/game.service';
import { QuestionService } from '@app/services/question/question.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true })],
    controllers: [GameController, QuestionController],
    providers: [ChatGateway, GameService, QuestionService, Logger],
})
export class AppModule {}
