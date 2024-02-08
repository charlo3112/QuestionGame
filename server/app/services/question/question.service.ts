import { MAX_CHOICES_NUMBER, MAX_NB_OF_POINTS, MIN_NB_OF_POINTS, PONDERATION_INCREMENT, QuestionType } from '@app/constants';
import { Choice } from '@app/model/database/choice';
import { Question, QuestionDocument } from '@app/model/database/question';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(Question.name) public questionModel: Model<QuestionDocument>,
        private readonly logger: Logger,
    ) {
        this.start();
    }

    async start() {
        if ((await this.questionModel.countDocuments()) === 0) {
            await this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        const testChoices: Choice[] = [];
        for (let i = 0; i < MAX_CHOICES_NUMBER; i++) {
            const text = 'test text';
            const isCorrect = i === 0;
            testChoices.push(new Choice(text, isCorrect));
        }
        const testQuestions: Question[] = [];
        for (let i = 0; i < MAX_CHOICES_NUMBER; i++) {
            const questionData: CreateQuestionDto = {
                type: QuestionType.QCM,
                text: 'test text' + i,
                points: 40,
                choices: testChoices,
            };
            testQuestions.push(new Question(questionData));
        }
        await this.questionModel.insertMany(testQuestions);
    }

    async getAllQuestions(): Promise<Question[]> {
        return await this.questionModel.find<Question>({});
    }

    async addQuestion(questionData: CreateQuestionDto): Promise<void> {
        try {
            if (!(await this.validateQuestion(questionData))) {
                return Promise.reject('A similar question already exists or the question data is invalid');
            }
            const question = new Question(questionData);
            await this.questionModel.create(question);
        } catch (error) {
            this.logger.error(`Failed to insert question: ${error.message || error}`);
            throw new Error('Failed to insert question');
        }
    }

    async deleteQuestion(text: string): Promise<void> {
        try {
            const res = await this.questionModel.deleteOne({
                text,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('Could not find question');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete question: ${error}`);
        }
    }

    async validateQuestion(questionData: CreateQuestionDto): Promise<boolean> {
        let isUnique = true;
        let arePointsCorrect = false;
        let areChoicesCorrect = false;
        const resultModulo = questionData.points.valueOf() % PONDERATION_INCREMENT;
        if (await this.questionModel.findOne({ text: questionData.text })) {
            isUnique = false;
        }
        if (resultModulo === 0 && questionData.points <= MAX_NB_OF_POINTS && questionData.points >= MIN_NB_OF_POINTS) {
            arePointsCorrect = true;
        }
        if (questionData.choices.length <= MAX_CHOICES_NUMBER && questionData.choices.length > 0) {
            areChoicesCorrect = true;
        }
        return isUnique && areChoicesCorrect && arePointsCorrect;
    }
}
