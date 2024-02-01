import { Logger, Module } from '@nestjs/common';
import { ConfigModule /* , ConfigService*/ } from '@nestjs/config';
// import { Course, courseSchema } from '@app/model/database/course';
import { GameController } from '@app/controllers/game/game.controller';
import { QuestionController } from '@app/controllers/question/question.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { GameService } from '@app/services/game/game.service';
import { QuestionService } from '@app/services/question/question.service';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true })],
    controllers: [GameController, QuestionController],
    providers: [ChatGateway, GameService, QuestionService, Logger],
})
export class AppModule {}
