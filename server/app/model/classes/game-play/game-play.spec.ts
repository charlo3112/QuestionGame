import { ChoiceData } from '@app/model/database/choice';
import { GameData } from '@app/model/database/game';
import { QuestionData } from '@app/model/database/question';
import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question.dto';
import { QuestionType } from '@common/enums/question-type';
import { GamePlay } from './game-play';

describe('GamePlay', () => {
    let gamePlay: GamePlay;

    beforeEach(() => {
        const choiceDtoOne = new CreateChoiceDto();
        choiceDtoOne.text = 'Paris';
        choiceDtoOne.isCorrect = true;
        const mockChoiceOne = new ChoiceData(choiceDtoOne);

        const choiceDtoTwo = new CreateChoiceDto();
        choiceDtoTwo.text = 'London';
        choiceDtoTwo.isCorrect = false;
        const mockChoiceTwo = new ChoiceData(choiceDtoTwo);

        const questionDto = new CreateQuestionDto();
        questionDto.type = QuestionType.QCM;
        questionDto.text = 'What is the capital of France?';
        questionDto.points = 40;
        questionDto.choices = [mockChoiceOne, mockChoiceTwo];
        const questionData1 = new QuestionData(questionDto);
        questionDto.type = QuestionType.QRL;
        questionDto.text = 'What is France?';
        questionDto.points = 10;
        questionDto.choices = [mockChoiceOne, mockChoiceTwo];
        const questionData2 = new QuestionData(questionDto);

        const mockGameDto = new CreateGameDto();
        mockGameDto.title = 'test';
        mockGameDto.duration = 1;
        mockGameDto.questions = [questionData1, questionData2];
        gamePlay = new GamePlay(new GameData(mockGameDto));
    });
    it('should be defined', () => {
        expect(gamePlay).toBeDefined();
    });

    it('should return questionIndex', () => {
        gamePlay.addIndexCurrentQuestion();
        expect(gamePlay.questionIndex).toBe(1);
    });

    it('should return the questions', () => {
        const questions = gamePlay.questions;
        expect(questions[0].text).toBe('What is the capital of France?');
        expect(questions[1].text).toBe('What is France?');
    });

    it('should return the duration', () => {
        expect(gamePlay.duration).toBe(1);
    });

    it('should return the current question without the answers', () => {
        let hasAnAnswer: boolean;
        const question = gamePlay.currentQuestionWithoutAnswer;
        if (question.type === 'QCM') {
            hasAnAnswer = question.choices[0].isCorrect || question.choices[1].isCorrect;
        }
        expect(hasAnAnswer).toBeFalsy();
    });

    it('should return the current question with the answers', () => {
        let hasAnAnswer: boolean;
        const question = gamePlay.currentQuestionWithAnswer;
        if (question.type === 'QCM') {
            hasAnAnswer = question.choices[0].isCorrect || question.choices[1].isCorrect;
        }
        expect(hasAnAnswer).toBeTruthy();
    });
});
