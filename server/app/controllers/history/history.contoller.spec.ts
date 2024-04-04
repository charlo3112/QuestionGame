import { HistoryData } from '@app/model/database/history';
import { CreateHistoryDto } from '@app/model/dto/history/create-history.dto';
import { HistoryService } from '@app/services/history/history.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { HistoryController } from './history.controller';

describe('HistoryController', () => {
    let controller: HistoryController;
    let historyService: SinonStubbedInstance<HistoryService>;

    beforeEach(async () => {
        historyService = createStubInstance(HistoryService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HistoryController],
            providers: [
                {
                    provide: HistoryService,
                    useValue: historyService,
                },
            ],
        }).compile();

        controller = module.get<HistoryController>(HistoryController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getAllHistories() should return all histories', async () => {
        const fakeHistory: HistoryData[] = [getFakeHistory()];
        historyService.getAllHistories.resolves(fakeHistory);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (histories) => {
            expect(histories).toEqual(fakeHistory);
            return res;
        };

        await controller.getAllHistories(res);
    });

    it('getAllHistories() should return BAD_REQUEST when service unable to fetch histories', async () => {
        historyService.getAllHistories.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.getAllHistories(res);
    });

    it('deleteHistories() should return NO_CONTENT', async () => {
        historyService.deleteHistories.resolves();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;

        await controller.deleteHistories(res);
    });

    it('deleteHistories() should return BAD_REQUEST when service unable to delete histories', async () => {
        historyService.deleteHistories.rejects();

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;

        await controller.deleteHistories(res);
    });
});

const getFakeHistory = (): HistoryData => {
    const history = new HistoryData(getFakeCreateHistoryDto());

    return history;
};

const getFakeCreateHistoryDto = (): CreateHistoryDto => {
    const history: CreateHistoryDto = {
        name: getRandomString(),
        date: new Date('2021-01-01'),
        numberPlayers: 1,
        bestScore: 1,
    } as CreateHistoryDto;
    return history;
};

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
