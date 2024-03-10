import { Injectable } from '@nestjs/common';

@Injectable()
export class TimeService {
    setTimeout(execute: () => void, timeMs: number) {
        setTimeout(execute, timeMs);
    }
}
