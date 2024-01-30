import { Question } from '@app/model/database/question';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { QuestionService } from '@app/services/question/question.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Questions')
@Controller('question')
export class QuestionController {
    constructor(private readonly questionsService: QuestionService) {}

    @ApiOkResponse({
        description: 'Returns all questions',
        type: Question,
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async allQuestions(@Res() response: Response) {
        try {
            const allQuestions = await this.questionsService.getAllQuestions();
            response.status(HttpStatus.OK).json(allQuestions);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new question',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/')
    async addCourse(@Body() questionDto: CreateQuestionDto, @Res() response: Response) {
        try {
            await this.questionsService.addQuestion(questionDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a question',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:id')
    async deleteGame(@Param('title') title: string, @Res() response: Response) {
        try {
            await this.questionsService.deleteQuestion(title);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
