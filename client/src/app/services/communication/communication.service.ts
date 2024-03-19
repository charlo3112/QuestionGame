import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@common/interfaces/game';
import { Question, QuestionWithModificationDate } from '@common/interfaces/question';
import { Result } from '@common/interfaces/result';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    toggleGameVisibility(id: string): Observable<HttpResponse<string>> {
        return this.http.patch(`${this.baseUrl}/game/${id}`, null, {
            observe: 'response',
            responseType: 'text',
        });
    }

    deleteGame(id: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/game/${id}`, { observe: 'response', responseType: 'text' });
    }

    exportGame(id: string): Observable<HttpResponse<string>> {
        return this.http.get(`${this.baseUrl}/game/${id}`, { observe: 'response', responseType: 'text' });
    }

    getAdminGames(): Observable<Result<Game[]>> {
        return this.http.get<Game[]>(`${this.baseUrl}/admin/game`, { observe: 'response', responseType: 'json' }).pipe(
            map((response: HttpResponse<Game[]>) => {
                const games = response.body as Game[];
                return { ok: true, value: games } as Result<Game[]>;
            }),
            catchError(() => {
                return of({ ok: false, error: 'Error fetching games' } as Result<Game[]>);
            }),
        );
    }

    getGames(): Observable<Result<Game[]>> {
        return this.http.get<Game[]>(`${this.baseUrl}/game`, { observe: 'response', responseType: 'json' }).pipe(
            map((response: HttpResponse<Game[]>) => {
                const games = response.body as Game[];
                return { ok: true, value: games } as Result<Game[]>;
            }),
            catchError(() => {
                return of({ ok: false, error: 'Error fetching games' } as Result<Game[]>);
            }),
        );
    }

    getGameByID(id: string): Observable<Result<Game>> {
        return this.http.get<Game>(`${this.baseUrl}/game/${id}`, { observe: 'response', responseType: 'json' }).pipe(
            map((response: HttpResponse<Game>) => {
                const game = response.body as Game;
                return { ok: true, value: game } as Result<Game>;
            }),
            catchError(() => {
                return of({ ok: false, error: 'Error fetching game' } as Result<Game>);
            }),
        );
    }

    addGame(game: Game): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/game`, game, { observe: 'response', responseType: 'text' });
    }

    login(password: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}/admin`, { password }).pipe(
            map(() => true),
            catchError(() => {
                return of(false);
            }),
        );
    }

    verifyLogin(login: boolean): boolean {
        const storedLogin = sessionStorage.getItem('login');
        if (storedLogin !== null) {
            login = JSON.parse(storedLogin);
        } else {
            login = false;
            sessionStorage.setItem('login', JSON.stringify(login));
        }
        return login;
    }

    addQuestion(question: Question): Observable<HttpResponse<Question>> {
        return this.http.post<Question>(`${this.baseUrl}/question`, question, { observe: 'response' });
    }

    getGameById(gameId: string): Observable<Game> {
        return this.http.get<Game>(`${this.baseUrl}/game/${gameId}`, { observe: 'response' }).pipe(map((response) => response.body as Game));
    }

    editGame(updatedGameData: Game): Observable<HttpResponse<Game>> {
        return this.http.patch<Game>(`${this.baseUrl}/game`, updatedGameData, { observe: 'response' }).pipe(
            catchError((error) => {
                return of(error);
            }),
        );
    }

    verifyTitle(title: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}/game/verify/`, { title }).pipe(
            map(() => true),
            catchError(() => {
                return of(false);
            }),
        );
    }

    getAllQuestionsWithModificationDates(): Observable<Result<QuestionWithModificationDate[]>> {
        return this.http.get<QuestionWithModificationDate[]>(`${this.baseUrl}/question`, { observe: 'response' }).pipe(
            map((response: HttpResponse<QuestionWithModificationDate[]>) => {
                return { ok: true, value: response.body as QuestionWithModificationDate[] } as Result<QuestionWithModificationDate[]>;
            }),
            catchError(() => {
                return of({ ok: false, error: 'Error fetching games' } as Result<QuestionWithModificationDate[]>);
            }),
        );
    }

    deleteQuestion(text: string): Observable<HttpResponse<string>> {
        return this.http.delete(`${this.baseUrl}/question/${text}`, { observe: 'response', responseType: 'text' });
    }

    modifyQuestion(updatedQuestionData: QuestionWithModificationDate): Observable<HttpResponse<QuestionWithModificationDate>> {
        return this.http.patch<QuestionWithModificationDate>(`${this.baseUrl}/question`, updatedQuestionData, { observe: 'response' });
    }

    getAnswers(questionText: string): Observable<boolean[]> {
        const params = new HttpParams().set('questionText', questionText);
        return this.http
            .get<boolean[]>(`${this.baseUrl}/question`, { params, observe: 'response' })
            .pipe(map((response: HttpResponse<boolean[]>) => response.body as boolean[]));
    }
}