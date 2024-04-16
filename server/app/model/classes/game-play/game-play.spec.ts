import { GameData } from '@app/model/database/game';
import { QuestionType } from '@common/enums/question-type';
import { GamePlay } from './game-play';

describe('GamePlay', () => {
    describe('addIndexCurrentQuestion', () => {
        it('should increment question index if there are more questions available', () => {
            const gameData = new GameData({
                description: 'description',
                duration: 10,
                questions: [
                    {
                        choices: [
                            { isCorrect: true, text: 'text1' },
                            { isCorrect: false, text: 'text2' },
                        ],
                        points: 10,
                        text: 'text',
                        type: QuestionType.QCM,
                    },
                    {
                        choices: [
                            { isCorrect: true, text: 'text1' },
                            { isCorrect: false, text: 'text2' },
                        ],
                        points: 20,
                        text: 'text',
                        type: QuestionType.QCM,
                    },
                ],
                title: 'title',
                visibility: true,
            });

            const gamePlay = new GamePlay(gameData);

            gamePlay.addIndexCurrentQuestion();

            expect(gamePlay.questionIndex).toBe(1);
        });

        it('should not increment question index if there are no more questions available', () => {
            const gameData = new GameData({
                description: 'description',
                duration: 10,
                questions: [
                    {
                        choices: [
                            { isCorrect: true, text: 'text1' },
                            { isCorrect: false, text: 'text2' },
                        ],
                        points: 10,
                        text: 'text',
                        type: QuestionType.QCM,
                    },
                ],
                title: 'title',
                visibility: true,
            });

            const gamePlay = new GamePlay(gameData);

            gamePlay.addIndexCurrentQuestion();

            expect(gamePlay.questionIndex).toBe(0);
        });
    });
});
