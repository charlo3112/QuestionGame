import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Result } from '@app/interfaces/result';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Question } from '../interfaces/question';

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
        return this.http.get<Game[]>(`${this.baseUrl}/game/admin`, { observe: 'response', responseType: 'json' }).pipe(
            map((response: HttpResponse<Game[]>) => {
                const games = response.body as Game[];
                return { ok: true, value: games } as Result<Game[]>;
            }),
            catchError(() => {
                return of({ ok: false, error: 'Error fetching games' } as Result<Game[]>);
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

    getGameById(gameId: string): Observable<HttpResponse<Game>> {
        //Remplacer Question par Game quand on aura l'interface
        return this.http.get<any>(`${this.baseUrl}/game/${gameId}`);
    }

    verifyTitle(title: string): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}/game/verify/`, { title }).pipe(
            catchError(() => {
                return of(false);
            }),
        );
    }
}
