import { Message } from '@common/message';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExampleService {
    private clientMessages: Message[];
}
