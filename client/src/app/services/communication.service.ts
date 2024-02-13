import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Question, QuestionWithModificationDate } from '@app/interfaces/question';
import { Result } from '@app/interfaces/result';
import { catchError, map, Observable, of } from 'rxjs';
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

    login(password: string): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/admin`, { password }, { observe: 'response', responseType: 'text' });
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
            catchError(() => {
                return of(false);
            }),
        );
    }

    getAllQuestions(): Observable<HttpResponse<Question[]>> {
        return this.http.get<Question[]>(`${this.baseUrl}/question`, { observe: 'response' });
    }

    getAllQuestionsWithModificationDates(): Observable<HttpResponse<QuestionWithModificationDate[]>> {
        return this.http.get<QuestionWithModificationDate[]>(`${this.baseUrl}/question`, { observe: 'response' });
    }
}
