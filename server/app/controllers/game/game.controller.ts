import { GameData } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { GameService } from '@app/services/game/game.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiFoundResponse, ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Games')
@Controller('game')
export class GameController {
    constructor(private readonly gamesService: GameService) {}

    @ApiOkResponse({
        description: 'Returns all games',
        type: GameData,
        isArray: true,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Get('/')
    async getAllGames(@Res() response: Response) {
        try {
            const allGames = await this.gamesService.getAllGames();
            response.status(HttpStatus.OK).json(allGames);
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Get game by id',
        type: GameData,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when the game doesnt exist',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Return BAD_REQUEST http status when the requesti fails',
    })
    @Get('/:id')
    async getGameById(@Param('id') id: string, @Res() response: Response) {
        try {
            const game = await this.gamesService.getGameById(id);
            if (!game) {
                response.status(HttpStatus.NOT_FOUND).send('Game not found');
                return;
            }
            response.status(HttpStatus.OK).json(game);
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'title is unique',
    })
    @ApiFoundResponse({
        description: 'Return FOUND http status the game already exists',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Post('/verify')
    async verifyTitle(@Body() data: { title: string }, @Res() response: Response) {
        try {
            const game = await this.gamesService.verifyTitle(data.title);
            if (game) {
                response.status(HttpStatus.FOUND).send();
            } else {
                response.status(HttpStatus.OK).send();
            }
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new game',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Post('/')
    async addGame(@Body() gameDto: CreateGameDto, @Res() response: Response) {
        try {
            await this.gamesService.addGame(gameDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Modify a game',
        type: GameData,
    })
    @ApiResponse({
        status: HttpStatus.NOT_MODIFIED,
        description: 'Return NOT_MODIFIED http status when request fails',
    })
    @Patch('/')
    async modifyGame(@Body() gameDto: UpdateGameDto, @Res() response: Response) {
        try {
            await this.gamesService.modifyGame(gameDto);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_MODIFIED).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Toogles Visibility',
    })
    @ApiResponse({
        status: HttpStatus.NOT_MODIFIED,
        description: 'Return NOT_MODIFIED http status when request fails',
    })
    @Patch('/:id')
    async toggleVisibility(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.gamesService.toggleVisibility(id);
            response
                .status(HttpStatus.OK)
                .json({ visibility: (await this.gamesService.getGameById(id)).visibility })
                .send();
        } catch (error) {
            response.status(HttpStatus.NOT_MODIFIED).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a game',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when the game cannot be found',
    })
    @Delete('/:id')
    async deleteGameById(@Param('id') id: string, @Res() response: Response) {
        try {
            if ((await this.gamesService.deleteGameById(id)) !== 0) {
                response.status(HttpStatus.OK).send();
            } else response.status(HttpStatus.NOT_FOUND).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }
}
