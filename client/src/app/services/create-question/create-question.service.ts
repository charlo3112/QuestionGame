import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommunicationService } from '@app/services/communication/communication.service';
import { MAX_CHOICES_NUMBER, MIN_CHOICES_NUMBER, RESPONSE_CREATED, SNACKBAR_DURATION } from '@common/constants';
import { QuestionType } from '@common/enums/question-type';
import { Choice } from '@common/interfaces/choice';
import { Question } from '@common/interfaces/question';

@Injectable({
    providedIn: 'root',
})
export class CreateQuestionService {
    constructor(
        private readonly communicationService: CommunicationService,
        private snackBar: MatSnackBar,
    ) {}

    openSnackBar(message: string) {
        this.snackBar.open(message, undefined, {
            duration: SNACKBAR_DURATION,
        });
    }
    addChoice(choiceInput: string, choices: Choice[], editArray: boolean[]): void {
        const MAX_FOUR_CHOICES = 'Vous ne pouvez pas ajouter plus de 4 choix.';
        const CHOICE_EMPTY = 'Le champ Choix doit être rempli pour créer un choix.';
        if (choiceInput.length) {
            if (choices.length < MAX_CHOICES_NUMBER) {
                const newChoice: Choice = { text: choiceInput, isCorrect: false };
                choices.push(newChoice);
                editArray.push(false);
            } else {
                this.openSnackBar(MAX_FOUR_CHOICES);
            }
        } else {
            this.openSnackBar(CHOICE_EMPTY);
        }
    }

    async addToQuestionBank(questionName: string, questionPoints: number, choices: Choice[]): Promise<Question> {
        if (this.choiceVerif(questionName, choices)) {
            const newQuestion: Question = {
                type: QuestionType.QCM,
                text: questionName,
                points: +parseInt(questionPoints.toString(), 10),
                choices,
            };
            return new Promise<Question>((resolve, reject) => {
                this.communicationService.addQuestion(newQuestion).subscribe({
                    next: (response) => {
                        if (response.status === RESPONSE_CREATED) {
                            resolve(newQuestion);
                        }
                    },
                    error: (error) => {
                        reject(error);
                    },
                });
            });
        }
        return null as unknown as Promise<Question>;
    }

    choiceVerif(questionName: string, choices: Choice[]): boolean {
        const QUESTION_EMPTY = 'Le champ Question ne peut pas être vide.';
        const MIN_TWO_CHOICES = "Veuillez ajouter au moins deux choix de réponse avant d'enregistrer la question.";
        const MIN_ONE_ANSWER = "Il faut au moins une réponse et un choix éronné avant d'enregistrer la question.";
        if (!questionName.length) {
            this.openSnackBar(QUESTION_EMPTY);
            return false;
        } else if (choices.length < MIN_CHOICES_NUMBER) {
            this.openSnackBar(MIN_TWO_CHOICES);
            return false;
        } else if (!this.hasAnswer(choices)) {
            this.openSnackBar(MIN_ONE_ANSWER);
            return false;
        }
        return true;
    }

    // Every parameter is important for this method
    // eslint-disable-next-line max-params
    async editQuestion(questionName: string, questionPoints: number, choices: Choice[], questionMongoId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.communicationService
                .modifyQuestion({
                    type: QuestionType.QCM,
                    text: questionName,
                    points: questionPoints,
                    choices,
                    lastModification: new Date(),
                    mongoId: questionMongoId,
                })
                .subscribe({
                    next: () => {
                        resolve();
                    },
                    error: (error) => {
                        reject(error);
                    },
                });
        });
    }
    hasAnswer(choices: Choice[]): boolean {
        let hasChecked = false;
        let hasUnchecked = false;

        for (const choice of choices) {
            if (choice.isCorrect) {
                hasChecked = true;
            } else {
                hasUnchecked = true;
            }

            if (hasChecked && hasUnchecked) {
                break;
            }
        }
        return hasChecked && hasUnchecked;
    }
}
