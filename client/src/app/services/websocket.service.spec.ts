import { TestBed } from '@angular/core/testing';

import { ChatService } from './websocket.service';

describe('ChatService', () => {
    let service: ChatService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
