import { Logger, Module } from '@nestjs/common';
import { ConfigModule /* , ConfigService*/ } from '@nestjs/config';
// import { Course, courseSchema } from '@app/model/database/course';
import { DateController } from '@app/controllers/date/date.controller';
import { ExampleController } from '@app/controllers/question/question.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { DateService } from '@app/services/date/date.service';
import { ExampleService } from '@app/services/example/example.service';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true })],
    controllers: [DateController, ExampleController],
    providers: [ChatGateway, DateService, ExampleService, Logger],
})
export class AppModule {}
