import { Logger, Module } from '@nestjs/common';
import { ConfigModule /* , ConfigService*/ } from '@nestjs/config';
// import { Course, courseSchema } from '@app/model/database/course';
import { DateController } from '@app/controllers/date/date.controller';
import { ExampleController } from '@app/controllers/example/example.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { DateService } from '@app/services/date/date.service';
import { ExampleService } from '@app/services/example/example.service';
import { GameController } from './controllers/game.controller/game.controller.controller';
import { QuestionController } from './controllers/question.controller/question.controller.controller';
import { GameService } from './services/game/game.service';
import { QuestionService } from './services/question/question.service';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true })],
    controllers: [DateController, ExampleController, QuestionController, GameController],
    providers: [ChatGateway, DateService, ExampleService, Logger, GameService, QuestionService],
})
export class AppModule {}
