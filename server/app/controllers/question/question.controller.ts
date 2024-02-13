import { Question } from '@app/model/database/question';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { QuestionService } from '@app/services/question/question.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
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
    async getAllQuestions(@Res() response: Response) {
        try {
            const allQuestions = await this.questionsService.getAllQuestions();
            response.status(HttpStatus.OK).json(allQuestions);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Returns the question answers',
        isArray: true,
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/')
    async getAnswers(@Body() questionText: string, @Res() response: Response) {
        try {
            const answers = await this.questionsService.getAnswers(questionText);
            response.status(HttpStatus.OK).json(answers);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new question',
    })
    @ApiNotFoundResponse({
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Post('/')
    async addQuestion(@Body() questionDto: CreateQuestionDto, @Res() response: Response) {
        try {
            await this.questionsService.addQuestion(questionDto);
            response.status(HttpStatus.CREATED).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'modifies a question',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_MODIFIED http status when request fails',
    })
    @Patch('/:text')
    async modifyQuestion(@Param('text') text: string, @Body() questionDto: CreateQuestionDto, @Res() response: Response) {
        try {
            await this.questionsService.modifyQuestion(text, questionDto);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_MODIFIED).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a question',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Delete('/:text')
    async deleteQuestion(@Param('text') text: string, @Res() response: Response) {
        try {
            await this.questionsService.deleteQuestion(text);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
