import { QuestionData } from '@app/model/database/question';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { QuestionService } from '@app/services/question/question.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Questions')
@Controller('question')
export class QuestionController {
    constructor(private readonly questionsService: QuestionService) {}

    @ApiOkResponse({
        description: 'Returns all questions',
        type: QuestionData,
        isArray: true,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Get('/')
    async getAllQuestions(@Res() response: Response) {
        try {
            const allQuestions = await this.questionsService.getAllQuestions();
            response.status(HttpStatus.OK).json(allQuestions);
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Returns the question answers for a specified question',
        isArray: true,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Return BAD_REQUEST http status when request fails',
    })
    @Get('/')
    async getAnswers(@Body() questionText: string, @Res() response: Response) {
        try {
            const answers = await this.questionsService.getAnswers(questionText);
            response.status(HttpStatus.OK).json(answers);
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @ApiCreatedResponse({
        description: 'Add new question',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
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
    @ApiResponse({
        status: HttpStatus.NOT_MODIFIED,
        description: 'Return NOT_MODIFIED http status when request fails',
    })
    @Patch('/')
    async modifyQuestion(@Body() questionDto: CreateQuestionDto, @Res() response: Response) {
        try {
            await this.questionsService.modifyQuestion(questionDto);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.NOT_MODIFIED).send(error.message);
        }
    }

    @ApiOkResponse({
        description: 'Delete a question',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Return BAD_REQUEST http status when the question cant be found',
    })
    @Delete('/:mongoId')
    async deleteQuestion(@Param('mongoId') id: string, @Res() response: Response) {
        try {
            await this.questionsService.deleteQuestion(id);
            response.status(HttpStatus.OK).send();
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }
}
