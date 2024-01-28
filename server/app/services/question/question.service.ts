import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from '@app/model/database/question';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { MAX_CHOICES_NUMBER } from '@app/constants';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(Question.name) public questionModel: Model<QuestionDocument>,
        private readonly logger: Logger,
    ) {}

    async getAllQuestions(): Promise<Question[]> {
        return await this.questionModel.find({});
    }

    async addQuestion(questionData: CreateQuestionDto): Promise<void> {
        if (!this.validateQuestion(questionData)) return Promise.reject('A similar question already exists');
        try {
            const question = new Question(questionData);
            await this.questionModel.create(question);
        } catch (error) {
            return Promise.reject(`Failed to insert question: ${error}`);
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
        const existingQuestion = await this.questionModel.findOne({ text: questionData.text });
        return !!existingQuestion && questionData.choices.length <= MAX_CHOICES_NUMBER && questionData.choices.length >= 0;
    }
}
