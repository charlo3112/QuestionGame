import { CreateChoiceDto } from '@app/model/dto/choice/create-choice.dto';
import { QuestionType } from '@common/constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateQuestionDto {
    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    type: QuestionType;

    @ApiProperty({ required: true })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({ required: true })
    @IsNumber()
    @IsNotEmpty()
    points: number;

    @ApiProperty()
    choices?: CreateChoiceDto[];

    @ApiProperty({ required: false })
    mongoId?: string;
}
