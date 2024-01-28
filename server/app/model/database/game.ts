import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Question } from './question';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { v4 as uuidv4 } from 'uuid';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    #id: string;
    #title: string;
    #description: string;
    #duration: number;
    #lastModification: string;
    #questions: Question[];

    constructor(gameData: CreateGameDto) {
        this.#id = uuidv4();
        this.#title = gameData.title;
        this.#description = gameData.description;
        this.#duration = gameData.duration;
        this.#lastModification = new Date().toISOString();
        this.#questions = gameData.questions;
    }

    addQuestion(newQuestion: Question) {
        this.#questions.push(newQuestion);
    }

    getId(): string {
        return this.#id;
    }

    getTitle(): string {
        return this.#title;
    }

    getDescription(): string {
        return this.#description;
    }

    getDuration(): number {
        return this.#duration;
    }

    getLastModification(): string {
        return this.#lastModification;
    }

    getQuestions(): Question[] {
        return this.#questions;
    }
}

export const gameSchema = SchemaFactory.createForClass(Game);
