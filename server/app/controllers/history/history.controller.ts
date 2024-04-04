import { HistoryData } from '@app/model/database/history';
import { HistoryService } from '@app/services/history/history.service';
import { Controller, Delete, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('History')
@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    @ApiOkResponse({
        description: 'Returns all histories',
        type: HistoryData,
        isArray: true,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Get('/')
    async getAllHistories(@Res() response: Response) {
        try {
            const getAllHistories = await this.historyService.getAllHistories();
            response.status(HttpStatus.OK).json(getAllHistories);
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiResponse({
        description: 'Delete histories',
        status: HttpStatus.NO_CONTENT,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Delete('/')
    async deleteHistories(@Res() response: Response) {
        try {
            await this.historyService.deleteHistories();
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }
}
