import { GameData } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    constructor(private readonly gamesService: GameService) {}

    @ApiOkResponse({
        description: 'login success',
    })
    @ApiForbiddenResponse({
        description: 'Return FORBIDDEN http status failed to login',
    })
    @Post('/')
    async login(@Body() loginData: { password: string }, @Res() response: Response) {
        if (loginData.password === process.env.ADMIN_PASSWORD) {
            response.status(HttpStatus.OK).send();
        } else {
            response.status(HttpStatus.FORBIDDEN).send();
        }
    }

    @ApiOkResponse({
        description: 'Returns all games',
        type: GameData,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/game')
    async getAllGamesAdmin(@Res() response: Response) {
        try {
            const allGames = await this.gamesService.getAllGamesAdmin();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
