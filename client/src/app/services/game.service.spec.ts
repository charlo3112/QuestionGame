import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';

describe('CommunicationService', () => {
    let service: GameService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
