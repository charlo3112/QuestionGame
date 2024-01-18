import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Question, QuestionDocument } from '@app/model/database/question';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { UpdateQuestionDto } from '@app/model/dto/question/update-question.dto';


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
            //await this.populateDB();
        }
    }

    

    async getAllQuestions(): Promise<Question[]> {
        return await this.questionModel.find({});
    }

    async getQuestion(sbjCode: string): Promise<Question> {
        // NB: This can return null if the course does not exist, you need to handle it
        return await this.questionModel.findOne({ subjectCode: sbjCode });
    }

    async addQuestion(question: CreateQuestionDto): Promise<void> {
        if (!this.validateCourse(question)) {
            return Promise.reject('Invalid question');
        }
        try {
            await this.questionModel.create(question);
        } catch (error) {
            return Promise.reject(`Failed to insert question: ${error}`);
        }
    }

    async deleteQuestion(sbjCode: string): Promise<void> {
        try {
            const res = await this.questionModel.deleteOne({
                subjectCode: sbjCode,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('Could not find question');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete question: ${error}`);
        }
    }

    async modifyCourse(question: UpdateQuestionDto): Promise<void> {
        const filterQuery = { subjectCode: question.subjectCode };
        // Can also use replaceOne if we want to replace the entire object
        try {
            const res = await this.questionModel.updateOne(filterQuery, question);
            if (res.matchedCount === 0) {
                return Promise.reject('Could not find question');
            }
        } catch (error) {
            return Promise.reject(`Failed to update question: ${error}`);
        }
    }

    async getCourseTeacher(sbjCode: string): Promise<string> {
        const filterQuery = { subjectCode: sbjCode };
        // Only get the teacher and not any of the other fields
        try {
            const res = await this.questionModel.findOne(filterQuery, {
                teacher: 1,
            });
            return res.teacher;
        } catch (error) {
            return Promise.reject(`Failed to get data: ${error}`);
        }
    }

    async getCoursesByTeacher(name: string): Promise<Question[]> {
        const filterQuery: FilterQuery<Question> = { teacher: name };
        return await this.questionModel.find(filterQuery);
    }

}
