import { QuestionData, QuestionDocument } from '@app/model/database/question';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { MAX_CHOICES_NUMBER, MAX_NB_OF_POINTS, MIN_NB_OF_POINTS, PONDERATION_INCREMENT } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(QuestionData.name) private readonly questionModel: Model<QuestionDocument>,
        private readonly logger: Logger,
    ) {}

    async getAllQuestions(): Promise<QuestionData[]> {
        const questions = await this.questionModel.find<QuestionData>({});
        for (const question of questions) {
            // _id is an MongoDB attribute
            // eslint-disable-next-line no-underscore-dangle
            question.mongoId = question._id;
        }
        return questions;
    }

    async getAllQCMQuestions(): Promise<QuestionData[]> {
        const questions = await this.questionModel.find<QuestionData>({ type: QuestionType.QCM });
        for (const question of questions) {
            // _id is an MongoDB attribute
            // eslint-disable-next-line no-underscore-dangle
            question.mongoId = question._id;
        }
        return questions;
    }

    async getMongoId(text: string): Promise<string> {
        // The underscore in _id is needed because it's a property of the mongoDB object

        // eslint-disable-next-line no-underscore-dangle
        const mongoId = (await this.questionModel.findOne({ text }))._id;
        return mongoId;
    }

    async getAnswers(questionText: string): Promise<boolean[]> {
        const filter = { text: questionText };
        const question = await this.questionModel.findOne(filter);
        if (!question) {
            return [];
        }
        const choices = question.choices;
        const answers: boolean[] = [];
        for (const choice of choices) {
            answers.push(choice.isCorrect);
        }
        return answers;
    }

    async addQuestion(questionData: CreateQuestionDto): Promise<void> {
        try {
            if (questionData.type === QuestionType.QCM) {
                if (!(await this.validateQuestion(questionData))) {
                    return Promise.reject('The question data is invalid');
                }
            }
            const existingQuestion = await this.questionModel.findOne({ text: questionData.text });
            if (existingQuestion) {
                return Promise.reject('A similar question already exists');
            }

            const question = new QuestionData(questionData);
            await this.questionModel.create(question);
        } catch (error) {
            this.logger.error(`Failed to insert question: ${error.message || error}`);
            return Promise.reject(`Failed to add question: ${error}`);
        }
    }

    async modifyQuestion(newQuestionData: CreateQuestionDto): Promise<void> {
        try {
            if (!(await this.validateQuestion(newQuestionData))) {
                return Promise.reject('The question data is invalid');
            }
            const question = new QuestionData(newQuestionData);
            await this.questionModel.replaceOne(
                { _id: newQuestionData.mongoId },
                {
                    type: question.getType(),
                    text: question.getText(),
                    points: question.getPoints(),
                    lastModification: question.getLastModification(),
                    choices: question.getChoices(),
                },
            );
        } catch (error) {
            this.logger.error(`Failed to modify question: ${error.message || error}`);
            return Promise.reject('Failed to modify question');
        }
    }

    async deleteQuestion(mongoId: string): Promise<void> {
        try {
            const res = await this.questionModel.deleteOne({ _id: mongoId });
            if (res.deletedCount === 0) {
                return Promise.reject('Could not find question');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete question: ${error}`);
        }
    }

    async validateQuestion(questionData: CreateQuestionDto): Promise<boolean> {
        let nbOfRightChoices = 0;
        let nbOfWrongChoices = 0;
        let arePointsCorrect = false;
        let areChoicesCorrect = false;
        let answersAreCorrect = false;
        const resultModulo = questionData.points.valueOf() % PONDERATION_INCREMENT;
        for (const choice of questionData.choices) {
            if (choice.isCorrect) {
                nbOfRightChoices++;
            } else nbOfWrongChoices++;
        }
        if ((nbOfRightChoices >= 1 && nbOfWrongChoices >= 0) || questionData.type === QuestionType.QCM) {
            answersAreCorrect = true;
        }
        if (resultModulo === 0 && questionData.points <= MAX_NB_OF_POINTS && questionData.points >= MIN_NB_OF_POINTS) {
            arePointsCorrect = true;
        }
        if ((questionData.choices.length <= MAX_CHOICES_NUMBER && questionData.choices.length > 0) || questionData.type === QuestionType.QRL) {
            areChoicesCorrect = true;
        }
        return areChoicesCorrect && arePointsCorrect && answersAreCorrect;
    }
}
