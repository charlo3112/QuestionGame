import { HistoryData, HistoryDocument } from '@app/model/database/history';
import { CreateHistoryDto } from '@app/model/dto/history/create-history.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class HistoryService {
    constructor(@InjectModel(HistoryData.name) private readonly historyModel: Model<HistoryDocument>) {}

    async getAllHistories(): Promise<HistoryData[]> {
        return await this.historyModel.find({});
    }

    async addHistory(historyData: CreateHistoryDto): Promise<void> {
        try {
            const history = new HistoryData(historyData);
            await this.historyModel.create(history);
        } catch (error) {
            return Promise.reject(`Failed to insert history: ${error}`);
        }
    }

    async deleteHistories(): Promise<boolean> {
        try {
            const res = await this.historyModel.deleteMany({});
            return res.deletedCount > 0;
        } catch (error) {
            return Promise.reject(`Failed to delete histories: ${error}`);
        }
    }
}
