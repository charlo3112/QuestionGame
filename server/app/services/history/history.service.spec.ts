import { HistoryData, HistoryDocument, historySchema } from '@app/model/database/history';
import { CreateHistoryDto } from '@app/model/dto/history/create-history.dto';
import { Logger } from '@nestjs/common';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
    let service: HistoryService;
    let historyModel: Model<HistoryDocument>;

    beforeEach(async () => {
        historyModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
        } as unknown as Model<HistoryDocument>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HistoryService,
                Logger,
                {
                    provide: getModelToken(HistoryData.name),
                    useValue: historyModel,
                },
            ],
        }).compile();

        service = module.get<HistoryService>(HistoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

const DELAY_BEFORE_CLOSING_CONNECTION = 400;

describe('HistoryServiceEndToEnd', () => {
    let service: HistoryService;
    let historyModel: Model<HistoryDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: HistoryData.name, schema: historySchema }]),
            ],
            providers: [HistoryService, Logger],
        }).compile();

        service = module.get<HistoryService>(HistoryService);
        historyModel = module.get<Model<HistoryDocument>>(getModelToken(HistoryData.name));
        connection = await module.get(getConnectionToken());
        historyModel.deleteMany({});
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(historyModel).toBeDefined();
    });

    it('getAllHistories() return all histories in database', async () => {
        const history = getFakeHistory();
        await historyModel.create(history);
        const history2 = getFakeHistory();
        await historyModel.create(history2);
        const serviceHistories = await service.getAllHistories();
        expect(serviceHistories.length).toBe(2);
    });

    it('deleteHistories() should delete all histories in the database', async () => {
        const history = getFakeHistory();
        await historyModel.create(history);
        const history2 = getFakeHistory();
        await historyModel.create(history2);
        expect(await service.deleteHistories()).toBe(true);
        expect(await service.getAllHistories()).toEqual([]);
    });

    it('addHistory() should add the history to the DB', async () => {
        await historyModel.deleteMany({});
        const historyDto = getFakeCreateHistoryDto();
        await service.addHistory(historyDto);
        const finalGameNb = await historyModel.countDocuments();
        expect(await service.getAllHistories()).toHaveLength(finalGameNb);
    });
});

const getFakeCreateHistoryDto = (): CreateHistoryDto => {
    const historyData: CreateHistoryDto = {
        name: getRandomString(),
        date: '2021-01-01',
        numberPlayers: 1,
        bestScore: 1,
    } as CreateHistoryDto;
    return historyData;
};

const getFakeHistory = (): HistoryData => {
    const history = new HistoryData(getFakeCreateHistoryDto());
    return history;
};

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
