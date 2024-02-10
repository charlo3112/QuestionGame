import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
    @ApiOkResponse({
        description: 'login success',
    })
    @ApiForbiddenResponse({
        description: 'failed to login',
    })
    @Post('/')
    async login(@Body() loginData: { password: string }, @Res() response: Response) {
        if (loginData.password === process.env.ADMIN_PASSWORD) {
            response.status(HttpStatus.OK).send();
        } else {
            response.status(HttpStatus.FORBIDDEN).send();
        }
    }
}
